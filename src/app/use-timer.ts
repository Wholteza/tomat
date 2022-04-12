import { addSeconds, differenceInSeconds, getUnixTime } from "date-fns";
import {
  doc,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { RefObject, useCallback, useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import EntityBase from "../infrastructure/firebase/firebase-entity";
import { Room } from "./use-room";

const TIMER_COLLECTION_PATH = "timers";

export enum TimerType {
  Work = "Work",
  Break = "Break",
}

export class Timer extends EntityBase {
  public startTime: Date;
  public endTime: Date;
  public type: TimerType;
  public durationSeconds: number;
  public version: number = 1;
  public hash: string;

  public constructor(durationSeconds: number, type: TimerType) {
    super();
    this.type = type;
    this.durationSeconds = durationSeconds;
    this.startTime = new Date(Date.now());
    this.endTime = addSeconds(this.startTime, durationSeconds);
    this.hash = this.createHash();
  }

  private createHash = () =>
    `${this.type}${this.durationSeconds}${getUnixTime(
      this.startTime
    )}${getUnixTime(this.endTime)}`;

  getTimeLeft = () => {
    const difference = differenceInSeconds(this.endTime, new Date(Date.now()));
    return {
      minutes: Math.floor(difference / 60),
      seconds: difference % 60,
      finished: difference <= 0,
      type: this.type,
    };
  };

  isTheSameAs = (otherTimer: Timer | undefined) =>
    this.hash === otherTimer?.hash;

  public static converter: FirestoreDataConverter<Timer> = {
    toFirestore: (timer) => ({
      startTime: timer.startTime,
      endTime: timer.endTime,
      type: timer.type,
      durationSeconds: timer.durationSeconds,
      hash: timer.hash,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const timer = new Timer(
        data.durationSeconds,
        TimerType[data.type as keyof typeof TimerType]
      );
      timer.startTime = data.startTime.toDate();
      timer.endTime = data.endTime.toDate();
      timer.hash = data.hash;

      return timer;
    },
  };
}

type TimeLeft = {
  minutes: number;
  seconds: number;
  finished: boolean;
  type: TimerType;
};

type Props = {
  timer: Timer | undefined;
  timeLeft: TimeLeft;
  startNewTimer: (durationSeconds: number, type: TimerType) => void;
};

const useTimer = (
  db: Firestore,
  room: Room,
  timerStartingAudioRef: RefObject<HTMLAudioElement>,
  timerEndingAudioRef: RefObject<HTMLAudioElement>
): Props => {
  const [localTimer, setLocalTimer] = useState<Timer>();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    localTimer?.getTimeLeft() ?? {
      minutes: 0,
      seconds: 0,
      finished: true,
      type: TimerType.Break,
    }
  );

  useInterval(() => {
    let newTime = localTimer?.getTimeLeft() ?? {
      seconds: 0,
      minutes: 0,
      finished: true,
      type: TimerType.Break,
    };
    if (newTime?.finished) {
      newTime = { ...newTime, minutes: 0, seconds: 0 };
    }

    setTimeLeft((prev) => {
      !prev?.finished &&
        newTime.finished &&
        timerEndingAudioRef?.current?.play();
      return newTime;
    });
  }, 1000);

  const startNewTimer = useCallback(
    (durationSeconds: number, type: TimerType) => {
      const timer = new Timer(durationSeconds, type);
      setLocalTimer(timer);
      timerStartingAudioRef.current?.play();
    },
    [timerStartingAudioRef]
  );

  const ensureTimerExists = useCallback(
    async (timerId: string) => {
      try {
        const timerReference = doc(
          db,
          TIMER_COLLECTION_PATH,
          timerId
        ).withConverter(Timer.converter);
        const timerSnapshot = await getDoc(timerReference);
        // Is there already an online timer?
        if (!timerSnapshot.exists()) {
          // No
          let newTimer: Timer | undefined;
          // Do i have a local timer? If so, use that one
          if (localTimer) newTimer = localTimer;
          // No, then create a new one
          else newTimer = new Timer(0, TimerType.Break);
          newTimer.id = timerId;
          await setDoc(timerReference, newTimer);
          setLocalTimer(newTimer);
          console.log("No online timer existed, created new one.");
          return;
        }
        // Yes
        const onlineTimer = timerSnapshot.data();
        // Do i have a local timer?
        if (localTimer) {
          // Yes
          // are they the same ?
          if (onlineTimer.isTheSameAs(localTimer)) {
            // yes then add the online one as your local one.
            onlineTimer.id = timerId;
            setLocalTimer(onlineTimer);
            console.log("Timer online was the same as local, using online one");
            return;
          }
          // no then replace online one
          await setDoc(timerReference, localTimer);
          setLocalTimer((prev) => {
            if (!prev) return;
            prev.id = timerId;
            return prev;
          });
          console.log("Timer online was different then local, using local one");
          return;
        }
        // no then use remote one
        onlineTimer.id = timerId;
        setLocalTimer(onlineTimer);
        console.log("Timer existed online but not locally, using online one");
      } catch (e) {
        console.error("Failed to ensure timer:", e);
      }
    },
    [db, localTimer]
  );

  const subscribeToChanges = useCallback(
    (
      timerId: string,
      localTimer: Timer | undefined
    ): Unsubscribe | undefined => {
      const timerRef = doc(db, TIMER_COLLECTION_PATH, timerId).withConverter(
        Timer.converter
      );
      const unsubscribe = onSnapshot(timerRef, (doc) => {
        if (!doc.exists()) {
          console.log("Recieved document did not exist, ignoring");
          return;
        }
        const newTimer = doc.data();
        newTimer.id = timerId;
        // is the incoming timer same as local timer
        // yes, then ignore it
        if (newTimer.isTheSameAs(localTimer)) {
          console.log("Incoming timer was the same as local timer, ignoring");
          return;
        }
        // no, then use it
        console.log("Incoming timer was not the same as local timer, using it");
        setLocalTimer(newTimer);
        timerStartingAudioRef.current?.play();
      });
      return unsubscribe;
    },
    [db, timerStartingAudioRef]
  );

  useEffect(() => {
    if (!room.exists()) return;
    if (localTimer?.exists()) return;
    ensureTimerExists(room.id!);
  }, [ensureTimerExists, room, localTimer]);

  useEffect(() => {
    if (!room.exists()) return;
    const unsubscribe = subscribeToChanges(room.id!, localTimer);
    return () => unsubscribe?.();
  }, [subscribeToChanges, localTimer, localTimer?.hash, room]);

  return { startNewTimer, timeLeft, timer: localTimer };
};

export default useTimer;

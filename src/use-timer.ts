import { add, addSeconds, differenceInSeconds } from "date-fns";
import { FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  getDocFromCache,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";
import EntityBase from "./infrastructure/firebase/firebase-entity";
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

  public constructor(durationSeconds: number, type: TimerType) {
    super();
    this.type = type;
    this.durationSeconds = durationSeconds;
    this.startTime = new Date(Date.now());
    this.endTime = addSeconds(this.startTime, durationSeconds);
  }

  getTimeLeft = () => {
    const difference = differenceInSeconds(this.endTime, new Date(Date.now()));
    return {
      minutes: Math.floor(difference / 60),
      seconds: difference % 60,
      finished: difference <= 0,
    };
  };

  isTheSameAs = (otherTimer: Timer) => {
    const startTimeIsSame =
      this.startTime.toUTCString() === otherTimer.startTime.toUTCString();
    const endTimeIsSame =
      this.endTime.toUTCString() === otherTimer.endTime.toUTCString();
    const durationSecondsIsSame =
      this.durationSeconds === otherTimer.durationSeconds;
    const typeIsSame = this.type === otherTimer.type;
    return (
      startTimeIsSame && endTimeIsSame && durationSecondsIsSame && typeIsSame
    );
  };

  public static converter: FirestoreDataConverter<Timer> = {
    toFirestore: (timer) => ({
      startTime: timer.startTime,
      endTime: timer.endTime,
      type: timer.type,
      durationSeconds: timer.durationSeconds,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const timer = new Timer(data.durationSeconds, data.type);
      timer.startTime = data.startTime.toDate();
      timer.endTime = data.endTime.toDate();

      return timer;
    },
  };
}

type TimeLeft = { minutes: number; seconds: number; finished: boolean };

type Props = {
  timer: Timer | undefined;
  timeLeft: TimeLeft;
  startNewTimer: (durationSeconds: number, type: TimerType) => void;
};

const useTimer = (app: FirebaseApp, room: Room): Props => {
  const db = useMemo<Firestore>(() => getFirestore(app), [app]);
  const [localTimer, setLocalTimer] = useState<Timer>();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    localTimer?.getTimeLeft() ?? {
      minutes: 0,
      seconds: 0,
      finished: true,
    }
  );

  useInterval(() => {
    let newTime = localTimer?.getTimeLeft() ?? {
      seconds: 0,
      minutes: 0,
      finished: true,
    };
    if (newTime?.finished) newTime = { ...newTime, minutes: 0, seconds: 0 };
    setTimeLeft(newTime);
  }, 10);

  const startNewTimer = useCallback(
    (durationSeconds: number, type: TimerType) => {
      const timer = new Timer(durationSeconds, type);
      setLocalTimer(timer);
    },
    []
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
          console.log("No online room existed, created new one.");
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

  useEffect(() => {
    if (!room.exists()) return;
    if (localTimer?.exists()) return;
    ensureTimerExists(room.id!);
  }, [ensureTimerExists, room, localTimer]);

  return { startNewTimer, timeLeft, timer: localTimer };
};

export default useTimer;

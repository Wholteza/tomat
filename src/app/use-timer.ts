import { addSeconds, differenceInSeconds } from "date-fns";
import {
  doc,
  Firestore,
  FirestoreDataConverter,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";
import EntityBase from "../infrastructure/firebase/firebase-entity";
import { Room } from "./use-room";

const TIMER_COLLECTION_PATH = "timers";

export enum TimerType {
  Work = "Work",
  Break = "Break",
}

export class Timer extends EntityBase {
  public endTime: Date;
  public type: TimerType;
  public durationSeconds: number;
  public version: number = 1;

  public constructor(durationSeconds: number, type: TimerType) {
    super();
    this.type = type;
    this.durationSeconds = durationSeconds;
    const startTime = new Date(Date.now());
    this.endTime = addSeconds(startTime, durationSeconds);
  }

  getTimeLeft = () => {
    const difference = differenceInSeconds(this.endTime, new Date(Date.now()));
    return {
      minutes: Math.floor(difference / 60),
      seconds: difference % 60,
      finished: difference <= 0,
      type: this.type,
    };
  };

  public static converter: FirestoreDataConverter<Timer> = {
    toFirestore: (timer) => ({
      version: timer.version,
      endTime: timer.endTime,
      type: timer.type,
      durationSeconds: timer.durationSeconds,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const timer = new Timer(
        data.durationSeconds,
        TimerType[data.type as keyof typeof TimerType]
      );
      timer.endTime = data.endTime.toDate();
      timer.version = data.version;

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
  timeLeft: TimeLeft;
  start: (durationSeconds: number, type: TimerType) => void;
};

const useTimer = (
  db: Firestore | undefined,
  room: Room,
  timerStartingAudioRef: RefObject<HTMLAudioElement>,
  timerEndingAudioRef: RefObject<HTMLAudioElement>
): Props => {
  const [timer, setTimer] = useState<Timer>();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    timer?.getTimeLeft() ?? {
      minutes: 0,
      seconds: 0,
      finished: true,
      type: TimerType.Break,
    }
  );
  const roomExists = useMemo<boolean>(() => !!room?.id, [room?.id]);

  useInterval(() => {
    let newTime = timer?.getTimeLeft() ?? {
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

  const createTimer = useCallback(
    async (timer: Timer, roomName: string, db: Firestore) => {
      try {
        const timerReference = doc(
          db,
          TIMER_COLLECTION_PATH,
          roomName
        ).withConverter(Timer.converter);
        await setDoc(timerReference, timer);
      } catch (e) {
        console.error("Failed to ensure timer:", e);
      }
    },
    []
  );

  const listenToTimerChanges = useCallback(
    (db: Firestore): Unsubscribe | undefined => {
      const timerRef = doc(db, TIMER_COLLECTION_PATH, room.name).withConverter(
        Timer.converter
      );
      const unsubscribe = onSnapshot(timerRef, (doc) => {
        if (!doc.exists()) return;
        const newTimer = doc.data();
        setTimer(newTimer);
        timerStartingAudioRef.current?.play();
      });
      return unsubscribe;
    },
    [room.name, timerStartingAudioRef]
  );

  useEffect(() => {
    if (!roomExists || !db) return;
    const unsubscribe = listenToTimerChanges(db);
    return () => unsubscribe?.();
  }, [db, listenToTimerChanges, room?.id, roomExists]);

  const handleStart = useCallback(
    (durationSeconds: number, type: TimerType) => {
      if (!db || !roomExists) return;
      const timer = new Timer(durationSeconds, type);
      createTimer(timer, room.name, db);
    },
    [createTimer, db, room.name, roomExists]
  );

  return { start: handleStart, timeLeft };
};

export default useTimer;

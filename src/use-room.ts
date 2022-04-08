import { add, differenceInSeconds } from "date-fns";
import { FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  setDoc,
  WithFieldValue,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";

const ROOM_NAME = "Yggdrasil";
const USER_NAME = "Anonymous User";

const USER_COLLECTION_PATH = "users";
const TIMER_COLLECTION_PATH = "timers";
const NON_EXISTING_TIMER = "0";

export enum TimerType {
  Work = "Work",
  Break = "Break",
}

type Timer = {
  id: string;
  startTime: Date;
  type: TimerType;
  durationSeconds: number;
};

type User = {
  id?: string;
  name: string;
};

type Room = {
  timer: Timer;
};
type TimeLeft = { minutes: number; seconds: number; finished: boolean };

const getTimeLeft = (timer: Timer) => {
  const endTime = add(timer.startTime, { seconds: timer.durationSeconds });
  const difference = differenceInSeconds(endTime, new Date(Date.now()));
  return {
    minutes: Math.floor(difference / 60),
    seconds: difference % 60,
    finished: difference <= 0,
  };
};

// const roomConverter = (): FirestoreDataConverter<Room> => ({
//   toFirestore: (modelObject: WithFieldValue<Room>): DocumentData => ({
//     name: modelObject.name,
//     timer: {
//       type: modelObject.type,
//       startTime: modelObject.startTime,
//       durationSeconds: modelObject.durationSeconds,
//     },
//   }),
//   fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as Timer,
// });
const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user) => ({
    id: user.id,
    name: user.name,
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return { name: data.name, id: data.id };
  },
};

type Props = {
  addUser: () => Promise<void>;
  timer: Timer;
  timeLeft: TimeLeft;
  startNewTimer: (durationSeconds: number, type: TimerType) => void;
};
const createInitialTimer = (
  durationSeconds: number,
  type: TimerType
): Timer => ({
  id: NON_EXISTING_TIMER,
  type,
  durationSeconds,
  startTime: new Date(Date.now()),
});

const createTimer = (durationSeconds: number, type: TimerType): Timer => ({
  id: (Math.random() * 100_000_000_000_000_000).toString(),
  type,
  durationSeconds,
  startTime: new Date(Date.now()),
});

const useRoom = (app: FirebaseApp): Props => {
  const [timer, setTimer] = useState<Timer>(
    createInitialTimer(0, TimerType.Work)
  );
  const [user, setUser] = useState<User>();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    (timer && getTimeLeft(timer)) || {
      minutes: 0,
      seconds: 0,
    }
  );
  // infra
  const db = useMemo<Firestore>(() => getFirestore(app), [app]);
  // const timersCollectionReference = useMemo<CollectionReference<Timer>>(
  //   () =>
  //     collection(db, TIMER_COLLECTION_PATH).withConverter<Timer>(
  //       timerConverter()
  //     ),
  //   [db]
  // );

  const updateUser = useCallback(async () => {
    try {
      const user: User = {
        name: USER_NAME,
      };
      const docRef = doc(db, USER_COLLECTION_PATH, "123").withConverter(
        userConverter
      );
      await setDoc(docRef, user);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, [db]);

  const createUser = useCallback(async () => {
    try {
      const user: User = {
        name: USER_NAME,
      };
      const docRef = await addDoc(collection(db, USER_COLLECTION_PATH), user);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, [db]);

  useInterval(() => {
    let newTime: TimeLeft = timer && getTimeLeft(timer);
    if (newTime.finished) newTime = { ...newTime, minutes: 0, seconds: 0 };
    setTimeLeft(newTime);
  }, 10);

  // const replaceTimer = useCallback(
  //   async (newTimer: Timer) => {
  //     if (timer.id === NON_EXISTING_TIMER) {
  //       await setDoc(doc(timersCollectionReference), newTimer);
  //       return;
  //     }
  //     await deleteDoc(doc(timersCollectionReference));
  //     await setDoc(doc(timersCollectionReference), newTimer);
  //   },
  //   [timer.id, timersCollectionReference]
  // );

  const startNewTimer = useCallback(
    (durationSeconds: number, type: TimerType) => {
      const timer = createTimer(durationSeconds, type);
      setTimer(timer);
      //replaceTimer(timer);
    },
    []
  );

  // useEffect(() => {
  //   if (!db || !timersCollectionReference) return;
  //   const q = query(timersCollectionReference);
  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     const timers: Timer[] = [];
  //     querySnapshot.forEach((doc) =>
  //       timers.push({ ...doc.data(), id: doc.id })
  //     );
  //     setTimer(timers?.[0]);
  //   });
  //   return () => unsubscribe();
  // }, [timersCollectionReference, db]);

  // const getTimers = useCallback(async () => {
  //   const timersSnapshot = await getDocs(timersCollectionReference);
  //   const timers = timersSnapshot.docs.map(
  //     (doc): Timer => ({ ...doc.data(), id: doc.id })
  //   );
  //   setTimer(timers?.[0]);
  // }, [timersCollectionReference]);

  // useEffect(() => {
  //   getTimers();
  // }, [getTimers]);

  return { timeLeft, startNewTimer, timer, addUser: updateUser };
};

export default useRoom;

import { PrecisionManufacturing, TimerTwoTone } from "@mui/icons-material";
import { add, addSeconds, differenceInSeconds } from "date-fns";
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
  getDoc,
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

const ROOM_COLLECTION_PATH = "rooms";
const USER_COLLECTION_PATH = "users";
const TIMER_COLLECTION_PATH = "timers";
const NON_EXISTING_TIMER = "0";

export enum TimerType {
  Work = "Work",
  Break = "Break",
}

class Timer {
  public id?: string;
  public startTime: Date;
  public endTime: Date;
  public type: TimerType;
  public durationSeconds: number;

  public constructor(durationSeconds: number, type: TimerType) {
    this.type = type;
    this.durationSeconds = durationSeconds;
    this.startTime = new Date(Date.now());
    this.endTime = addSeconds(this.startTime, durationSeconds);
  }

  public static userConverter: FirestoreDataConverter<Timer> = {
    toFirestore: (timer) => ({
      startTime: timer.startTime,
      endTime: timer.endTime,
      type: timer.type,
      durationSeconds: timer.durationSeconds,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const timer = new Timer(data.durationSeconds, data.type);
      timer.id = data.id;
      timer.startTime = new Date(data.startTime);
      timer.endTime = new Date(data.endTime);

      return timer;
    },
  };
}

class User {
  public id?: string;
  public name: string;
  public lastSeen: Date;

  public constructor(name: string) {
    this.name = name;
    this.lastSeen = new Date(Date.now());
  }

  public static firebaseConverter: FirestoreDataConverter<User> = {
    toFirestore: (user) => ({
      name: user.name,
      lastSeen: user.lastSeen,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const user = new User(data.name);
      user.id = data.id;
      user.lastSeen = data.lastSeen;
      return user;
    },
  };
}

class Room {
  public id?: string;
  public name: string;
  public timer: Timer;
  public users: User[];

  public constructor(name: string) {
    this.name = name;
    this.users = [];
    this.timer = new Timer(0, TimerType.Work);
  }

  public static firebaseConverter: FirestoreDataConverter<Room> = {
    toFirestore: (room) => ({
      timer: room.timer,
      users: room.users,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const room = new Room(data.name);
      room.id = data.id;
      room.timer = data.timer;
      room.users = data.users;
      return room;
    },
  };
}

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

type Props = {
  timer: Timer;
  timeLeft: TimeLeft;
  startNewTimer: (durationSeconds: number, type: TimerType) => void;
};

const useRoom = (app: FirebaseApp): Props => {
  const db = useMemo<Firestore>(() => getFirestore(app), [app]);
  const [timer, setTimer] = useState<Timer>(new Timer(0, TimerType.Work));
  const [user, setUser] = useState<User>();
  const [room, setRoom] = useState<Room>();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    (timer && getTimeLeft(timer)) || {
      minutes: 0,
      seconds: 0,
      finished: true,
    }
  );

  const updateUser = useCallback(async () => {
    try {
      const user = new User(USER_NAME);
      const docRef = doc(db, USER_COLLECTION_PATH, "123").withConverter<User>(
        User.firebaseConverter
      );
      await setDoc(docRef, user);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, [db]);

  const createUser = useCallback(
    async (newUser: User) => {
      try {
        const ref = await addDoc(
          collection(db, USER_COLLECTION_PATH).withConverter<User>(
            User.firebaseConverter
          ),
          newUser
        );
        setUser((prev) => {
          if (!prev) return;
          prev.id = ref.id;
          return prev;
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    },
    [db]
  );

  const getRoom = useCallback(
    async (newRoom: Room) => {
      try {
        const docRef = doc(
          db,
          ROOM_COLLECTION_PATH,
          newRoom.name
        ).withConverter(Room.firebaseConverter);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRoom(docSnap.data());
          return;
        }
        const roomsRef = collection(
          db,
          ROOM_COLLECTION_PATH
        ).withConverter<Room>(Room.firebaseConverter);

        const ref = await addDoc(roomsRef, newRoom);
        setRoom((prev) => {
          if (!prev) return;
          prev.id = ref.id;
          return prev;
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    },
    [db]
  );

  useInterval(() => {
    let newTime = (timer && getTimeLeft(timer)) || {
      seconds: 0,
      minutes: 0,
      finished: true,
    };
    if (newTime?.finished) newTime = { ...newTime, minutes: 0, seconds: 0 };
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
      const timer = new Timer(durationSeconds, type);
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
  useEffect(() => {
    if (user?.id) return;
    const newUser = new User(USER_NAME);
    setUser(newUser);
    createUser(newUser);
  }, [createUser, user?.id]);

  useEffect(() => {
    console.log(0);
    if (!user?.id) return;
    console.log(1);
    if (room) return;
    console.log("adding room");
    const newRoom = new Room(ROOM_NAME);
    setRoom(newRoom);
    getRoom(newRoom);
  }, [getRoom, room, user?.id]);

  return { timeLeft, startNewTimer, timer };
};

export default useRoom;

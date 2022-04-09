import { FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import EntityBase from "./infrastructure/firebase/firebase-entity";

const ROOM_NAME = "Yggdrasil";
const USER_NAME = "Anonymous User";

const ROOM_COLLECTION_PATH = "rooms";
const USER_COLLECTION_PATH = "users";

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

export class Room extends EntityBase {
  public name: string;
  public version: number = 1;

  public constructor(name: string) {
    super();
    this.name = name;
  }

  public exists = () => !!this.id;

  public converter: FirestoreDataConverter<Room> = {
    toFirestore: (room) => ({
      name: room.name,
      version: room.version,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const room = new Room(data.name);
      room.version = data.version;
      return room;
    },
  };
}

type Props = {
  room: Room;
};

const useRoom = (app: FirebaseApp): Props => {
  const db = useMemo<Firestore>(() => getFirestore(app), [app]);
  const [user, setUser] = useState<User>();
  const [room, setRoom] = useState<Room>(new Room(ROOM_NAME));
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
        newUser.id = ref.id;
        setUser(newUser);
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
        ).withConverter(newRoom.converter);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const room = docSnap.data();
          room.id = newRoom.name;
          setRoom(room);
          return;
        }
        await setDoc(docRef, newRoom);
        setRoom((prev) => {
          prev.id = newRoom.name;
          return prev;
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    },
    [db]
  );

  useEffect(() => {
    if (room.exists()) return;
    console.log("adding room");
    getRoom(room);
  }, [getRoom, room, room?.id]);

  return { room };
};

export default useRoom;

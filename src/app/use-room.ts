import {
  doc,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import EntityBase from "../infrastructure/firebase/firebase-entity";

const ROOM_NAME = "Yggdrasil";

const ROOM_COLLECTION_PATH = "rooms";

export class Room extends EntityBase {
  public name: string;
  public version: number = 1;

  public constructor(name: string) {
    super();
    this.name = name;
  }

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

const useRoom = (db: Firestore | undefined): Props => {
  const { pathname } = useLocation();
  const roomName = useMemo<string>(() => {
    const roomNameRegex = /^\/(?<name>.*)/;
    const { name } = pathname.match(roomNameRegex)?.groups ?? {};
    return name ?? ROOM_NAME;
  }, [pathname]);

  const [room, setRoom] = useState<Room>(new Room(roomName));

  const ensureRoom = useCallback(async (newRoom: Room, db: Firestore) => {
    try {
      const docRef = doc(db, ROOM_COLLECTION_PATH, newRoom.name).withConverter(
        newRoom.converter
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Online room existed, using that one");
        const room = docSnap.data();
        room.id = newRoom.name;
        setRoom(room);
        return;
      }
      console.log("Online room did not exist, creating one");
      await setDoc(docRef, newRoom);
      setRoom((prev) => {
        prev.id = newRoom.name;
        return prev;
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, []);

  useEffect(() => {
    if (!!room.id || !db) return;
    ensureRoom(room, db);
  }, [db, ensureRoom, room, room.id]);

  return { room };
};

export default useRoom;

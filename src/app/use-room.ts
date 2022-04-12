import {
  doc,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
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

const useRoom = (db: Firestore): Props => {
  const [room, setRoom] = useState<Room>(new Room(ROOM_NAME));
  const ensureRoom = useCallback(
    async (newRoom: Room) => {
      try {
        const docRef = doc(
          db,
          ROOM_COLLECTION_PATH,
          newRoom.name
        ).withConverter(newRoom.converter);
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
    },
    [db]
  );

  useEffect(() => {
    if (room.exists()) return;
    ensureRoom(room);
  }, [ensureRoom, room, room?.id]);

  return { room };
};

export default useRoom;

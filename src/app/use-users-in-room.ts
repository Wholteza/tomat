import {
  arrayUnion,
  arrayRemove,
  doc,
  Firestore,
  FirestoreDataConverter,
  onSnapshot,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import EntityBase from "../infrastructure/firebase/firebase-entity";
import { User } from "../infrastructure/firebase/user.entity";
import { Room } from "./use-room";

const USERS_IN_ROOM_COLLECTION_PATH = "usersInRoom";

export class UsersInRoom extends EntityBase {
  public users: User[];

  public constructor(users: User[]) {
    super();
    this.users = users;
  }

  public static converter: FirestoreDataConverter<UsersInRoom> = {
    toFirestore: (user) => ({
      users: user.users,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const user = new UsersInRoom(data.users);
      return user;
    },
  };
}

const useUsersInRoom = (db: Firestore, room: Room, myUser: User): User[] => {
  const [usersInRoom, setUsersInRoom] = useState<UsersInRoom>();

  const createEmptyUsersInRoomInstance = useCallback(async () => {
    const listRef = doc(
      db,
      USERS_IN_ROOM_COLLECTION_PATH,
      room.name
    ).withConverter(UsersInRoom.converter);
    await setDoc(listRef, new UsersInRoom([]));
  }, [db, room.name]);

  const subscribeToUsersInRoom = useCallback(() => {
    const usersInRoomRef = doc(
      db,
      USERS_IN_ROOM_COLLECTION_PATH,
      room.name
    ).withConverter(UsersInRoom.converter);
    const unsubscribe = onSnapshot(usersInRoomRef, (doc) => {
      if (!doc.exists()) {
        createEmptyUsersInRoomInstance();
        return;
      }
      const newList = doc.data();
      setUsersInRoom(newList);
    });
    return unsubscribe;
  }, [createEmptyUsersInRoomInstance, db, room.name]);

  useEffect(() => {
    if (!room.exists()) return;
    const unsubscribe = subscribeToUsersInRoom();
    return () => unsubscribe?.();
  }, [room, subscribeToUsersInRoom]);

  const addSelf = useCallback((): (() => void) => {
    const listRef = doc(
      db,
      USERS_IN_ROOM_COLLECTION_PATH,
      room.name
    ).withConverter(UsersInRoom.converter);
    updateDoc(listRef, {
      users: arrayUnion(User.converter.toFirestore(myUser)),
    });
    const removeSelf = () => {
      const listRef = doc(
        db,
        USERS_IN_ROOM_COLLECTION_PATH,
        room.name
      ).withConverter(UsersInRoom.converter);
      updateDoc(listRef, {
        users: arrayRemove(User.converter.toFirestore(myUser)),
      });
    };
    return removeSelf;
  }, [db, myUser, room.name]);

  useEffect(() => {
    const removeSelf = () => {
      const listRef = doc(
        db,
        USERS_IN_ROOM_COLLECTION_PATH,
        room.name
      ).withConverter(UsersInRoom.converter);
      updateDoc(listRef, {
        users: arrayRemove(User.converter.toFirestore(myUser)),
      });
    };
    window.onbeforeunload = removeSelf;
  }, [db, myUser, room.name]);

  useEffect(() => {
    const removeSelf = addSelf();
    return removeSelf;
  }, [addSelf]);

  return usersInRoom?.users ?? [];
};

export default useUsersInRoom;

import {
  addDoc,
  collection,
  doc,
  Firestore,
  FirestoreDataConverter,
  setDoc,
} from "firebase/firestore";
import { useCallback, useState } from "react";
import EntityBase from "./infrastructure/firebase/firebase-entity";

const USER_NAME = "Anonymous User";

const USER_COLLECTION_PATH = "users";

class User extends EntityBase {
  public name: string;
  public lastSeen: Date;

  public constructor(name: string) {
    super();
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
      user.lastSeen = data.lastSeen;
      return user;
    },
  };
}

type Props = {
  user: User | undefined;
};

const useUser = (db: Firestore): Props => {
  const [user, setUser] = useState<User>();
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

  return { user };
};

export default useUser;

import { FirebaseApp } from "firebase/app";
import {
  Firestore,
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { useMemo } from "react";

const useDb = (app: FirebaseApp): Firestore => {
  const db = useMemo<Firestore>(() => {
    const db = getFirestore(app);
    //connectFirestoreEmulator(db, "localhost", 8080);
    return db;
  }, [app]);

  return db;
};

export default useDb;

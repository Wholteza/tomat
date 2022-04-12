import { FirebaseApp } from "firebase/app";
import {
  Firestore,
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { useMemo } from "react";
import environmentVariables from "../../app/environment-variables";

const useDb = (app: FirebaseApp): Firestore => {
  const db = useMemo<Firestore>(() => {
    const db = getFirestore(app);
    environmentVariables.DEV && connectFirestoreEmulator(db, "localhost", 8080);
    return db;
  }, [app]);

  return db;
};

export default useDb;

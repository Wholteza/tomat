import { FirebaseApp } from "firebase/app";
import {
  Firestore,
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import environmentVariables from "../../app/environment-variables";

const useDb = (app: FirebaseApp): Firestore | undefined => {
  const [db, setDb] = useState<Firestore>();

  useEffect(() => {
    if (db) return;

    const newDb = getFirestore(app);
    environmentVariables.DEV &&
      connectFirestoreEmulator(newDb, "localhost", 8080);
    setDb(newDb);
  }, [app, db]);
  return db;
};

export default useDb;

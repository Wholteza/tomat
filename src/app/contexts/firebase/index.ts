import { Firestore } from "@firebase/firestore";
import React from "react";

type FirebaseContextType = {
  db?: Firestore;
};

const FirebaseContext = React.createContext<FirebaseContextType>({});

export default FirebaseContext;

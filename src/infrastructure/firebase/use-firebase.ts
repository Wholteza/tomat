import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { useMemo } from "react";

type UseFirebaseProps = {
  app: FirebaseApp;
  analytics: Analytics;
};

const firebaseConfig = {
  apiKey: "AIzaSyBF9v-SACLjTGx7LtqbibemyiDSK53O6oY",
  authDomain: "tomat-d4561.firebaseapp.com",
  projectId: "tomat-d4561",
  storageBucket: "tomat-d4561.appspot.com",
  messagingSenderId: "543488032716",
  appId: "1:543488032716:web:8f8863fedcc592bfab2769",
  measurementId: "G-73RWN6THGC",
};

const useFirebase = (): UseFirebaseProps => {
  const app = useMemo(() => initializeApp(firebaseConfig), []);
  const analytics = useMemo(() => getAnalytics(app), [app]);

  return { app, analytics };
};

export default useFirebase;

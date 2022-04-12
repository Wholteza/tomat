import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { useMemo } from "react";

type UseFirebaseProps = {
  app: FirebaseApp;
  analytics: Analytics;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASECONFIG_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASECONFIG_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASECONFIG_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASECONFIG_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASECONFIG_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASECONFIG_APPID,
  measurementId: import.meta.env.VITE_FIREBASECONFIG_MEASUREMENTID,
};

const useFirebase = (): UseFirebaseProps => {
  const app = useMemo(() => initializeApp(firebaseConfig), []);
  const analytics = useMemo(() => getAnalytics(app), [app]);

  return { app, analytics };
};

export default useFirebase;

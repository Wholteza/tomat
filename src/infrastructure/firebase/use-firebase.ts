import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { useMemo } from "react";

type UseFirebaseProps = {
  app: FirebaseApp;
  analytics: Analytics;
};

const firebaseConfig = {
  apiKey: import.meta.env.firebaseConfigApiKey,
  authDomain: import.meta.env.firebaseConfigAuthDomain,
  projectId: import.meta.env.firebaseConfigProjectId,
  storageBucket: import.meta.env.firebaseConfigStorageBucket,
  messagingSenderId: import.meta.env.firebaseConfigMessagingSenderId,
  appId: import.meta.env.firebaseConfigAppId,
  measurementId: import.meta.env.firebaseConfigMeasurementId,
};

const useFirebase = (): UseFirebaseProps => {
  const app = useMemo(() => initializeApp(firebaseConfig), []);
  const analytics = useMemo(() => getAnalytics(app), [app]);

  return { app, analytics };
};

export default useFirebase;

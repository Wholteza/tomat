/// <reference types="vite/client" />
interface ImportMetaEnv {
  firebaseConfigApiKey: string;
  firebaseConfigAuthDomain: string;
  firebaseConfigProjectId: string;
  firebaseConfigStorageBucket: string;
  firebaseConfigMessagingSenderId: string;
  firebaseConfigAppId: string;
  firebaseConfigMeasurementId: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

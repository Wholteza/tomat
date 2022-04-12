/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_FIREBASECONFIG_APIKEY: string;
  VITE_FIREBASECONFIG_AUTHDOMAIN: string;
  VITE_FIREBASECONFIG_PROJECTID: string;
  VITE_FIREBASECONFIG_STORAGEBUCKET: string;
  VITE_FIREBASECONFIG_MESSAGINGSENDERID: string;
  VITE_FIREBASECONFIG_APPID: string;
  VITE_FIREBASECONFIG_MEASUREMENTID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

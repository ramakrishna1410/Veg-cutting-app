import { Platform } from "react-native";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
// getReactNativePersistence is exported from firebase/auth's React Native
// build only (resolved by Metro via the package.json "react-native" field
// on iOS/Android). On web that field isn't used, so this import comes back
// undefined there — never call it outside the Platform.OS !== "web" branch
// below. The plain `tsc` module resolution used by `npm run typecheck` also
// doesn't apply the "react-native" field, so its type declaration isn't
// visible there either — harmless, hence the ts-expect-error.
// @ts-expect-error - see note above
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Web falls back to Firebase's default browser persistence (IndexedDB/localStorage);
// only native (iOS/Android) needs the explicit AsyncStorage-backed persistence.
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);
export const functions = getFunctions(app);

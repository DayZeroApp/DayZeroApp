// lib/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 👇 bring in the types + fns we need
import type { Auth } from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';

// Try to load the RN persistence adapter at runtime
let getReactNativePersistence:
  | ((store: typeof AsyncStorage) => import('firebase/auth').Persistence)
  | undefined;

try {
  // Type the require so TS knows what this is
  ({ getReactNativePersistence } =
    require('firebase/auth/react-native') as typeof import('firebase/auth/react-native'));
} catch {
  // adapter not available (e.g., web) — we'll fall back below
}

const firebaseConfig = {
  apiKey:        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:     process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId:         process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  // measurementId optional; not needed for Auth/DB/Storage
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// --- Auth (typed) ---
let auth: Auth;
try {
  if (getReactNativePersistence) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('[firebase] Using React-Native persistence');
  } else {
    auth = getAuth(app);
    console.log('[firebase] RN adapter missing; using default auth');
  }
} catch {
  // Already initialized (Fast Refresh) — reuse it
  auth = getAuth(app);
  console.log('[firebase] Auth already initialized; reusing instance');
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

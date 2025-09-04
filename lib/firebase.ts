// lib/firebase.ts
/*import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';

const firebaseConfig = {
  apiKey:        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:     process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId:         process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Use initializeAuth exactly once (RN adapter) or getAuth if already initialized
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(app);
}
export const auth = _auth;*/

// lib/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Try RN persistence via subpath export; fallback so app can boot either way.
let auth: ReturnType<typeof initializeAuth>;
try {
  // Use require() so Metro resolves at runtime even if TS types were stubbed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getReactNativePersistence } = require('firebase/auth/react-native');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('[firebase] Using React-Native persistence');
} catch (e) {
  // Fallback: runs everywhere; user won’t stay signed in after a cold start
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
  console.log('[firebase] RN subpath unavailable; using in-memory persistence');
}

export { auth };


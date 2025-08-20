// lib/config.ts
type Maybe = string | undefined;

export const config = {
  google: {
    // Web OAuth client ID from Google Cloud (the one that returns an ID token)
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID as string,
    // Optional: if you made a separate iOS client
    iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID as Maybe,
  },
  firebase: {
    apiKey:        process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
    authDomain:    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
    projectId:     process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
    senderId:      process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID as string,
    appId:         process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
  },
} as const;

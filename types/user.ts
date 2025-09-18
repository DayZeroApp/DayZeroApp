// types/user.ts
//Intializer

export type Plan = 'free' | 'trial' | 'premium' | 'lifetime';

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  authProvider: 'google';

  timezone: string;              // IANA
  locale: string;                // e.g., "en-US"
  dailyResetHourLocal: number;   // 0..23
  lastLocalDayId: string | null;
  lastActivityAt?: any;          // Firestore Timestamp
  lastLoginAt?: any;             // Firestore Timestamp

  plan: Plan;
  // derive premium in code: const premium = doc.plan === 'premium' || doc.plan === 'lifetime';

  trial: {
    startedAt?: any;             // Firestore Timestamp
    endsAt?: any;                // Firestore Timestamp
    days: number;                // 0..31
    graceUntil?: any | null;     // optional
  };

  aiLimits: {
    dailyMax: number;            // 0..10
    usedToday: number;           // 0..10
    lastResetLocalDayId: string | null;
  };

  notifications: {
    checkInEnabled: boolean;
    checkInTimeLocal: string;    // "HH:mm"
    reflectEnabled: boolean;
    reflectTimeLocal: string;    // "HH:mm"
    pushTokens: string[];
  };

  theme: 'auto' | 'light' | 'dark';
  themeAutoSchedule?: { lightStart: string; darkStart: string }; // "HH:mm"

  createdAt?: any;               // Firestore Timestamp
  updatedAt?: any;               // Firestore Timestamp
}

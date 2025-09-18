// lib/users.ts
import { db } from '@/lib/firebase';
import type { UserDoc } from '@/types/user';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

function hhmm(h: number, m = 0) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

export async function ensureUserDoc(uid: string, profile: {
  displayName?: string | null; email?: string | null; timezone: string;
}) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const now = new Date();
  // compute a 7-day trial end aligned to the user’s reset hour (20:00) in their timezone if you like;
  // MVP: store a simple endsAt now + 7d; you can refine alignment later.
  const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const data: UserDoc = {
    uid,
    displayName: profile.displayName ?? '',
    email: profile.email ?? '',
    authProvider: 'google',

    timezone: profile.timezone,
    locale: 'en-US',
    dailyResetHourLocal: 20,
    lastLocalDayId: null,

    plan: 'trial',
    trial: { startedAt: serverTimestamp(), endsAt, days: 7, graceUntil: null },

    aiLimits: { dailyMax: 3, usedToday: 0, lastResetLocalDayId: null },

    notifications: {
      checkInEnabled: true,
      checkInTimeLocal: hhmm(8),
      reflectEnabled: true,
      reflectTimeLocal: hhmm(20),
      pushTokens: [],
    },

    theme: 'dark',
    themeAutoSchedule: { lightStart: hhmm(5), darkStart: hhmm(17) },

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(ref, data);
}

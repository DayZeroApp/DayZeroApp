// app/bootstrap.ts
import { auth, db } from '@/lib/firebase';
import { Local } from '@/lib/local';
import { ensureDailyReset } from '@/lib/time';
import { doc, getDoc } from 'firebase/firestore';

export async function hydrateApp() {
  const user = auth.currentUser;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 1) Read plan from Firestore (source of truth)
  if (user) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const plan = (snap.exists() ? (snap.data().plan as any) : 'free') ?? 'free';
      await Local.setPlan(plan);
    } catch {
      // network/offline → keep last cached plan
    }
  }

  // 2) Ensure profile exists locally
  const profile = await Local.getProfile();
  if (!profile) {
    await Local.setProfile({ timezone: tz, dailyResetHourLocal: 20, locale: 'en-US' });
  }

  // 3) Reset AI counters if we crossed the day boundary per reset hour
  try {
    const ai = ensureDailyReset(await Local.getAiLimits(), (profile?.timezone ?? tz), profile?.dailyResetHourLocal ?? 20);
    await Local.setAiLimits(ai);
  } catch (error) {
    console.log('AI limits not yet implemented, skipping...');
  }
}

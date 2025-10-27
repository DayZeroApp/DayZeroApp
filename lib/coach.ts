// lib/coach.ts
import { Local } from '@/lib/local';
import { ensureDailyReset } from '@/lib/time';

export async function canUseCoach(tz: string) {
  const limits = await Local.getAiLimits(); // { usedToday, lastResetLocalDayId }
  const profile = await Local.getProfile();
  const { aiPerDay } = await (await import('./entitlements')).getPlanLimits();

  // daily reset
  const fixed = ensureDailyReset(limits, profile?.timezone ?? tz, profile?.dailyResetHourLocal ?? 20);
  if (fixed !== limits) await Local.setAiLimits(fixed);

  return { allowed: fixed.usedToday < aiPerDay, used: fixed.usedToday, max: aiPerDay };
}

export async function markCoachUsed() {
  const limits = await Local.getAiLimits();
  const next = { ...limits, usedToday: (limits.usedToday ?? 0) + 1 };
  await Local.setAiLimits(next);
}

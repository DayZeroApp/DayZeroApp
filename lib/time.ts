// lib/time.ts
export function localDayId(tz: string, date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
}

export function ensureDailyReset(ai: {usedToday:number; lastResetLocalDayId:string|null}, tz: string, resetHourLocal=20) {
  const now = new Date();
  const local = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const dayId = local.toLocaleDateString('en-CA', { timeZone: tz });
  const afterReset = local.getHours() >= resetHourLocal;
  const effectiveDay = afterReset ? dayId : dayId; // (same day id; reset timing is handled by comparing lastResetLocalDayId)

  if (ai.lastResetLocalDayId !== effectiveDay) {
    return { usedToday: 0, lastResetLocalDayId: effectiveDay };
  }
  return ai;
}
  
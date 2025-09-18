// lib/entitlements.ts
import { Local } from '@/lib/local';

export async function getLimits() {
  const { plan } = await Local.getPlan();
  const premium = plan === 'premium' || plan === 'lifetime';
  return premium
    ? { maxHabits: Infinity, maxGoals: Infinity, aiPerDay: 3 }
    : { maxHabits: 1, maxGoals: 1, aiPerDay: 1 };
}

// lib/local.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generic get/set JSON
async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  const result = raw ? JSON.parse(raw) as T : fallback;
  console.log(`📖 Local.getJSON(${key}):`, result);
  return result;
}
async function setJSON<T>(key: string, val: T) {
  console.log(`💾 Local.setJSON(${key}):`, val);
  await AsyncStorage.setItem(key, JSON.stringify(val));
}

export const Local = {
  getVersion: () => AsyncStorage.getItem('dz:stateVersion'),
  setVersion: (v: string) => AsyncStorage.setItem('dz:stateVersion', v),

  getProfile: () => getJSON('dz:profile', null as any),
  setProfile: (p: any) => setJSON('dz:profile', p),

  getPlan: () => getJSON<{plan:'free'|'trial'|'premium'|'lifetime'; fetchedAt:number}>('dz:planCache', { plan:'free', fetchedAt:0 }),
  setPlan: (plan: 'free'|'trial'|'premium'|'lifetime') => setJSON('dz:planCache', { plan, fetchedAt: Date.now() }),

  getHabits: () => getJSON<any[]>('dz:habits', []),
  setHabits: (arr: any[]) => setJSON('dz:habits', arr),

  getGoals: () => getJSON<any[]>('dz:goals', []),
  setGoals: (arr: any[]) => setJSON('dz:goals', arr),

  getLog: (dayId: string) => getJSON<Record<string,'yes'|'no'|'none'>>(`dz:logs:${dayId}`, {}),
  setLog: (dayId: string, statuses: Record<string,'yes'|'no'|'none'>) => setJSON(`dz:logs:${dayId}`, statuses),

  getAiLimits: () => getJSON<{usedToday:number; lastResetLocalDayId:string|null}>('dz:aiLimits', { usedToday: 0, lastResetLocalDayId: null }),
  setAiLimits: (v: {usedToday:number; lastResetLocalDayId:string|null}) => setJSON('dz:aiLimits', v),

  getNotifications: () => getJSON('dz:notifications', { checkInEnabled:true, checkInTimeLocal:'08:00', reflectEnabled:true, reflectTimeLocal:'20:00', pushTokens: [] }),
  setNotifications: (v: any) => setJSON('dz:notifications', v),
};

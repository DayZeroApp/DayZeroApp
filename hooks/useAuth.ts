import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { ensureUserDoc } from '../lib/users';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      // Create user document after successful authentication
      if (user) {
        try {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          await ensureUserDoc(user.uid, {
            displayName: user.displayName,
            email: user.email,
            timezone: timezone,
          });
          console.log('User document ensured for:', user.uid);
        } catch (error) {
          console.error('Failed to ensure user document:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    displayName: user?.displayName || '',
    firstName: user?.displayName?.split(' ')[0] || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
  };
}

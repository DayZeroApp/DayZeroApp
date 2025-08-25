// app/oauth/callback.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { auth } from '../../lib/firebase';

export default function OAuthCallback() {
  const router = useRouter();
  const { id_token } = useLocalSearchParams<{ id_token?: string }>();

  useEffect(() => {
    // Only meaningful for web OAuth; on native we don't use this route.
    if (Platform.OS !== 'web') {
      router.replace('/login');
      return;
    }

    (async () => {
      try {
        if (!id_token) {
          router.replace('/login');
          return;
        }
        const cred = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, cred);
        router.replace('/(tabs)');
      } catch (e) {
        console.error('OAuth callback error:', e);
        router.replace('/login');
      }
    })();
  }, [id_token, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 12 }}>Completing sign in…</Text>
    </View>
  );
}

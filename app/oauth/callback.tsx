// app/oauth/callback.tsx
import auth from '@react-native-firebase/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log('OAuth callback triggered');
        console.log('URL params:', JSON.stringify(params));
        
        // Check if user is already signed in
        const currentUser = auth().currentUser;
        
        if (currentUser) {
          console.log('User already signed in, redirecting to tabs');
          router.replace('/(tabs)');
          return;
        }
        
        // For Firebase, the OAuth flow is typically handled by the Google Sign-In library
        // This callback is mainly for web OAuth flows, but we can handle it gracefully
        console.log('No user session found, redirecting to login');
        router.replace('/login');
      } catch (error) {
        console.error('Error in callback:', error);
        router.replace('/login');
      }
    }

    handleCallback();
  }, [router, params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 20 }}>Completing sign in...</Text>
    </View>
  );
}

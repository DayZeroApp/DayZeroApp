// login.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

    // Configure Google Sign-In
    GoogleSignin.configure({
      scopes: ['profile'],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!, // Web client ID
      iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID, // optional for iOS later
      offlineAccess: false,
    });
  }, [router, fadeAnim]);

  async function handleSignOut() {
    try {
      await signOut(auth);
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function handleSignInWithGoogle() {
    if (isSigninInProgress) return;

    try {
      setIsSigninInProgress(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = (userInfo as any).idToken;
      if (!idToken) throw new Error('No idToken from Google');
      const cred = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, cred);

      console.log('Firebase sign in successful');
      // Navigation can be handled here or by an auth-state listener elsewhere
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
    } finally {
      setIsSigninInProgress(false);
    }
  }

  const CustomGoogleButton = () => (
    <TouchableOpacity
      onPress={handleSignInWithGoogle}
      disabled={isSigninInProgress}
      style={{
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        width: '100%',
        maxWidth: 312,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        marginBottom: 16,
        opacity: isSigninInProgress ? 0.6 : 1,
      }}
    >
      <Ionicons name="logo-google" size={24} color="#4285F4" style={{ marginRight: 12 }} />
      <Text style={{ color: '#3c4043', fontSize: 16, fontWeight: '600' }}>
        {isSigninInProgress ? 'Signing in...' : 'Sign in with Google'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
      <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
        <ThemedText style={{ fontSize: 42, fontWeight: 'bold', color: 'white', marginBottom: 16, lineHeight: 50, paddingVertical: 4 }}>
          DAY ZERO
        </ThemedText>
        <ThemedText style={{ fontSize: 18, color: '#9ca3af', textAlign: 'center', marginBottom: 48, maxWidth: 300, lineHeight: 24 }}>
          Reset. Rebuild. Refocus.
        </ThemedText>

        <CustomGoogleButton />

        <TouchableOpacity
          onPress={handleSignOut}
          style={{ backgroundColor: '#dc2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Sign Out (Test)</Text>
        </TouchableOpacity>
      </Animated.View>
    </ThemedView>
  );
}

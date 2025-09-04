// login.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Helper function to check if error has a code property
function isErrorWithCode(error: any): error is { code: string } {
  return error && typeof error.code === 'string';
}

export default function LoginScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

    // Debug environment variables
    console.log('Environment variables check:');
    console.log('GOOGLE_CLIENT_ID exists:', !!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_ID length:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.length);
    console.log('GOOGLE_CLIENT_ID starts with:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 20));

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
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
      console.log('Starting Google Sign-in process...');
  
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      try {
        const res = await GoogleSignin.signIn();       // should show account picker
        const idToken = (res as any).idToken ?? (res as any).data?.idToken ?? null;

        let token = idToken;
        if (!token) {
          const t = await GoogleSignin.getTokens();    // fallback from Play Services
          token = t?.idToken ?? null;
        }
        if (!token) throw new Error('No idToken from Google');

        const cred = GoogleAuthProvider.credential(token);
        await signInWithCredential(auth, cred);
      } catch (e: any) {
        if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_REQUIRED) {
          console.log('No usable Google session. Ensure Google account added & Play image/updates.');
        } else {
          console.error('Google sign-in failed:', e);
        }
      }
  
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // … your existing error handling stays the same
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
        <ThemedText style={{ fontSize: 30, fontWeight: 'bold', color: 'white', marginBottom: 16, lineHeight: 50, paddingVertical: 4 }}>
          Start Your Journey
        </ThemedText>
        <ThemedText style={{ fontSize: 18, color: '#9ca3af', textAlign: 'center', marginBottom: 48, maxWidth: 300, lineHeight: 24 }}>
          Reset. Rebuild. Refocus.
        </ThemedText>

        <CustomGoogleButton />
      
      </Animated.View>
    </ThemedView>
  );
}

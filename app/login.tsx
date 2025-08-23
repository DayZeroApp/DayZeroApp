// login.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Conditionally import Google Sign-In
let GoogleSignin: any = null;
let GoogleSigninButton: any = null;
let statusCodes: any = null;

try {
  const GoogleSignInLib = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleSignInLib.GoogleSignin;
  GoogleSigninButton = GoogleSignInLib.GoogleSigninButton;
  statusCodes = GoogleSignInLib.statusCodes;
} catch (error) {
  console.log('Google Sign-In native module not available:', error);
}

export default function LoginScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);
  const [isExpoGo, setIsExpoGo] = useState(!GoogleSignin);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

    if (GoogleSignin) {
      // login.tsx (inside useEffect)
      GoogleSignin.configure({
        scopes: ['profile'],
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!, // Web client ID
        iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID, // optional for iOS later
        offlineAccess: false,
      });
      setIsExpoGo(false);
    } else {
      setIsExpoGo(true);
    }
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

      if (!GoogleSignin) {
        alert('Google Sign-In is not available in Expo Go. Please use a development build.');
        return;
      }

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const userInfo = await GoogleSignin.signIn();
      const idToken = (userInfo as any)?.idToken;
      if (!idToken) throw new Error('No ID token from Google Sign-In');

      // Create Firebase credential using the modular SDK
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      console.log('Firebase sign in successful:', userCredential.user?.email);
      // Navigation can be handled here or by an auth-state listener elsewhere
    } catch (error: any) {
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is already in progress');
      } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('Play services not available or outdated');
      } else {
        console.error('Error signing in with Google:', error);
      }
    } finally {
      setIsSigninInProgress(false);
    }
  }

  const CustomGoogleButton = () => (
    <TouchableOpacity
      onPress={() => alert('Google Sign-In requires a development build. Not available in Expo Go.')}
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
      }}
    >
      <Ionicons name="logo-google" size={24} color="#4285F4" style={{ marginRight: 12 }} />
      <Text style={{ color: '#3c4043', fontSize: 16, fontWeight: '600' }}>Sign in with Google</Text>
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

        {isExpoGo ? (
          <CustomGoogleButton />
        ) : GoogleSigninButton ? (
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleSignInWithGoogle}
            disabled={isSigninInProgress}
            style={{ width: 312, height: 48, marginBottom: 16 }}
          />
        ) : (
          <CustomGoogleButton />
        )}

        {isExpoGo && (
          <ThemedText style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center' }}>
            Google Sign-In requires a development build.{'\n'}This feature is not available in Expo Go.
          </ThemedText>
        )}

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

import Ionicons from '@expo/vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { config } from '../lib/config';

// Conditionally import Google Sign-In
let GoogleSignin: any = null;
let GoogleSigninButton: any = null;
let statusCodes: any = null;

// Try to import Google Sign-In - it will work in development builds, fail in Expo Go
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Configure Google Sign-In if available
    if (GoogleSignin) {
      console.log('Google Sign-In is available - configuring...');
      const googleConfig = {
        // Scopes for user data - email is included by default
        scopes: ['profile'],
        // Get this from your Google Cloud Console
        webClientId: config.google.webClientId,
        // iOS client ID (optional for iOS)
        iosClientId: config.google.iosClientId,
        // Whether to prompt for account selection
        offlineAccess: false,
      };
      console.log('GoogleSignin configuration:', googleConfig);
      GoogleSignin.configure(googleConfig);
      // Update state to show we're not in Expo Go
      setIsExpoGo(false);
      console.log('Set isExpoGo to false - using development build');
    } else {
      // Update state to show we are in Expo Go
      setIsExpoGo(true);
      console.log('Set isExpoGo to true - using Expo Go');
    }

    // Auth state is now handled in the root layout
  }, [router, fadeAnim]);

  async function handleSignOut() {
    try {
      await auth().signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function handleSignInWithGoogle() {
    if (isSigninInProgress) {
      console.log('Sign in already in progress');
      return;
    }

    try {
      setIsSigninInProgress(true);
      console.log('Button pressed - starting Google sign in...');

      // Check if Google Sign-In is available
      if (!GoogleSignin) {
        console.error('Google Sign-In is not available in Expo Go');
        alert('Google Sign-In is not available in Expo Go. Please create a development build to use this feature.');
        setIsSigninInProgress(false);
        return;
      }

      // Check if Play Services are available (Android only)
      if (Platform.OS === 'android') {
        try {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          console.log('Play Services check passed');
        } catch (error) {
          console.error('Play Services error:', error);
          setIsSigninInProgress(false);
          return;
        }
      }

      // Play Services check already done above

      // Start the sign-in flow
      console.log('Starting Google Sign-In...');
      console.log('Current configuration:', {
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        packageName: 'com.startdayzero.DayZero'
      });
      
      const userInfo = await GoogleSignin.signIn();
      // Cast to any to avoid TypeScript errors with the response structure
      const googleUser = userInfo as any;
      console.log('Google sign in successful:', googleUser.user ? 'User authenticated' : 'No user data');
      console.log('Full Google response:', JSON.stringify(googleUser, null, 2));

      // Get the ID token
      if (!googleUser.idToken) {
        throw new Error('No ID token present in Google Sign-In response');
      }
      const idToken = googleUser.idToken;

      console.log('Got ID token, signing in with Firebase...');
      
      // Sign in with Firebase using the ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      console.log('Firebase sign in successful:', userCredential.user?.email);
      // Auth state listener will handle navigation
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

  // Custom Google Sign-In button for Expo Go
  const CustomGoogleButton = () => (
    <TouchableOpacity
      onPress={() => alert('Google Sign-In requires a development build. This feature is not available in Expo Go.')}
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
      <Text style={{ color: '#3c4043', fontSize: 16, fontWeight: '600' }}>
        Sign in with Google
      </Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView
      style={{
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}
    >
      <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
        {/* Title */}
        <ThemedText
          style={{
            fontSize: 42,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 16,
            lineHeight: 50,
            paddingVertical: 4,
          }}
        >
          DAY ZERO
        </ThemedText>

        {/* Subtitle */}
        <ThemedText
          style={{
            fontSize: 18,
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: 48,
            maxWidth: 300,
            lineHeight: 24,
          }}
        >
          Reset. Rebuild. Refocus.
        </ThemedText>

        {/* Google Sign In Button - conditionally render based on environment */}
        {isExpoGo ? (
          <CustomGoogleButton />
        ) : GoogleSigninButton ? (
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleSignInWithGoogle}
            disabled={isSigninInProgress}
            style={{
              width: 312,
              height: 48,
              marginBottom: 16,
            }}
          />
        ) : (
          <CustomGoogleButton />
        )}

        {isExpoGo && (
          <ThemedText style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center' }}>
            Google Sign-In requires a development build.{'\n'}This feature is not available in Expo Go.
          </ThemedText>
        )}

        {/* Temporary sign out button for testing */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: '#dc2626',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 24,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Sign Out (Test)
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ThemedView>
  );
}
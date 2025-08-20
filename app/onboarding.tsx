import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

const DURATION_PRESETS = [7, 14, 21];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [habit, setHabit] = useState('');
  const [days, setDays] = useState(7);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: number, isBack: boolean = false) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isBack ? 100 : -100,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(isBack ? -100 : 100);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step < 3) {
      animateTransition(step + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      animateTransition(step - 1, true);
    }
  };

  const renderStep1 = () => (
    <>
      <ThemedText 
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 24,
          textAlign: 'center',
          lineHeight: 36,
          paddingVertical: 4,
          includeFontPadding: false
        }}
      >
        What&apos;s holding you back?
      </ThemedText>

      <TextInput
        style={{
          width: '100%',
          backgroundColor: '#1F2937',
          color: 'white',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 24,
          fontSize: 18
        }}
        placeholder="Being on my phone too long"
        placeholderTextColor="#9CA3AF"
        value={habit}
        onChangeText={setHabit}
        multiline
        maxLength={100}
      />

      <ThemedText 
        style={{
          color: '#9CA3AF',
          marginBottom: 32,
          textAlign: 'center',
          fontSize: 16
        }}
      >
        Start with one — you can add more later.
      </ThemedText>

      <TouchableOpacity
        style={{
          width: '100%',
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: habit.trim() ? '#2563EB' : '#374151',
          opacity: habit.trim() ? 1 : 0.5
        }}
        onPress={handleNext}
        disabled={!habit.trim()}
      >
        <ThemedText 
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '600'
          }}
        >
          Next
        </ThemedText>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <TouchableOpacity
        onPress={handleBack}
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          backgroundColor: '#2563EB',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 9999,
          zIndex: 10
        }}
      >
        <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
        Back
        </ThemedText>
      </TouchableOpacity>

      <ThemedText 
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 24,
          textAlign: 'center',
          lineHeight: 34
        }}
      >
        How long will you commit to this reset?
      </ThemedText>

      <ThemedText 
        style={{
          color: '#9CA3AF',
          marginBottom: 40,
          textAlign: 'center',
          fontSize: 16,
          lineHeight: 22
        }}
      >
        Choose a challenge that&apos;s doable — you&apos;ll grow from here.
      </ThemedText>

      <View 
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 40
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#1F2937',
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={() => setDays(prev => Math.max(1, prev - 1))}
        >
          <ThemedText style={{ fontSize: 28, color: 'white' }}>-</ThemedText>
        </TouchableOpacity>

        <ThemedText 
          style={{
            fontSize: 48,
            color: 'white',
            marginHorizontal: 40,
            fontWeight: 'bold',
            lineHeight: 56,
            paddingVertical: 8,
            includeFontPadding: false,
            textAlignVertical: 'center'
          }}
        >
          {days}
        </ThemedText>

        <TouchableOpacity
          style={{
            backgroundColor: '#1F2937',
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={() => setDays(prev => prev + 1)}
        >
          <ThemedText style={{ fontSize: 28, color: 'white' }}>+</ThemedText>
        </TouchableOpacity>
      </View>

      <View 
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 32,
          gap: 16
        }}
      >
        {DURATION_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset}
            style={{
              backgroundColor: days === preset ? '#2563EB' : '#1F2937',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12
            }}
            onPress={() => setDays(preset)}
          >
            <ThemedText 
              style={{
                color: 'white',
                fontWeight: '500'
              }}
            >
              {preset} days
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={{
          width: '100%',
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: '#2563EB'
        }}
        onPress={handleNext}
      >
        <ThemedText 
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '600'
          }}
        >
          Next
        </ThemedText>
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <TouchableOpacity
        onPress={handleBack}
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          backgroundColor: '#2563EB',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 9999,
          zIndex: 10
        }}
      >
        <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Back
        </ThemedText>
      </TouchableOpacity>

      <ThemedText 
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 24,
          textAlign: 'center',
          lineHeight: 40,
          paddingHorizontal: 20
        }}
      >
        You just made your Day Zero count
      </ThemedText>

      <ThemedText 
        style={{
          fontSize: 20,
          color: '#D1D5DB',
          marginBottom: 32,
          textAlign: 'center',
          lineHeight: 28,
          paddingHorizontal: 16
        }}
      >
        You&apos;re committing to stop{'\n\n'}
        <ThemedText 
          style={{ 
            fontSize: 35, 
            color: 'white', 
            fontWeight: '600',
            lineHeight: 42,
            paddingVertical: 4,
            includeFontPadding: false
          }}
        >
          {habit}
        </ThemedText>{'\n\n'}
        for{'\n\n'}
                 <ThemedText 
            style={{ 
              fontSize: 35, 
              color: 'white', 
              fontWeight: '600',
              lineHeight: 42,
              paddingVertical: 4,
              includeFontPadding: false
            }}
          >
            {days} days
          </ThemedText>
      </ThemedText>

      <ThemedText 
        style={{
          color: '#9CA3AF',
          marginBottom: 48,
          textAlign: 'center',
          fontSize: 16,
          lineHeight: 24
        }}
      >
        No perfection needed. Build consistency.
      </ThemedText>

      <TouchableOpacity
        style={{
          width: '100%',
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: '#2563EB'
        }}
        onPress={handleNext}
      >
        <ThemedText 
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '600'
          }}
        >
          Let&apos;s Start
        </ThemedText>
      </TouchableOpacity>
    </>
  );

  return (
    <ThemedView 
      style={{
        flex: 1,
        backgroundColor: 'black',
        paddingHorizontal: 24
      }}
    >
      <Animated.View 
        style={{
          flex: 1,
          justifyContent: 'center',
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Animated.View>
    </ThemedView>
  );
}

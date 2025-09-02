import { useTasks } from "@/context/TasksProvider";
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Keyboard, Pressable, TextInput, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

const DURATION_PRESETS = [7, 14, 21];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [habit, setHabit] = useState('');
  const [days, setDays] = useState(7);

  const { addTask } = useTasks();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: number) => {
    Keyboard.dismiss();
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -100, duration: 0, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(100);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  };

  async function handleFinishOnboarding(title: string) {
    await addTask(title.trim());
    // No persistence needed since we're using in-memory storage
    router.replace("/(tabs)");
  }

  const handlePrimary = async () => {
    console.log("ONBOARD: handlePrimary called, current step:", step);
    Keyboard.dismiss();
    if (step < 3) {
      console.log("ONBOARD: Moving to next step");
      animateTransition(step + 1);
      return;
    }
    console.log("ONBOARD: On final step, proceeding to save");
    // Step 3 -> save + route
    try {
      // Validate inputs before creating habit
      const trimmedTitle = habit.trim();
      
      console.log("ONBOARD: Validating inputs:", {
        rawHabit: habit,
        trimmedTitle,
        days
      });

      if (!trimmedTitle) {
        console.error("ONBOARD: Empty habit title");
        return;
      }

      if (days <= 0 || days > 365) {
        console.error("ONBOARD: Invalid days value:", days);
        return;
      }

      console.log("ONBOARD: About to finish onboarding with habit:", trimmedTitle);
      
      // Use the new handler
      await handleFinishOnboarding(trimmedTitle);
      
      console.log("ONBOARD: Onboarding completed successfully");
    } catch (e) {
      console.log("ONBOARD: save failed", e);
    }
  };

  const renderStep1 = () => (
    <>
      <ThemedText className="text-3xl font-bold text-white mb-8">What is it that you want to achieve?</ThemedText>
      <TextInput
        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-6 text-lg"
        placeholder="Add a habit or goal that you want to achieve"
        placeholderTextColor="#9CA3AF"
        value={habit}
        onChangeText={setHabit}
        multiline
        maxLength={100}
      />
      <ThemedText className="text-gray-400 mb-8 text-center">
        You can add more later — just start with one.
      </ThemedText>
    </>
  );

  const renderStep2 = () => (
    <>
      <ThemedText className="text-3xl font-bold text-white mb-4">How long are you committing to this goal?</ThemedText>
      <ThemedText className="text-gray-400 mb-8 text-center">
        Pick a number that feels challenging but doable. You can always come back stronger.
      </ThemedText>
      <View className="flex-row justify-center items-center mb-8">
        <Pressable className="bg-gray-800 w-12 h-12 rounded-full items-center justify-center" onPress={() => setDays(p => Math.max(1, p - 1))}>
          <ThemedText className="text-2xl text-white">-</ThemedText>
        </Pressable>
        <ThemedText className="text-4xl text-white mx-8 font-bold">{days}</ThemedText>
        <Pressable className="bg-gray-800 w-12 h-12 rounded-full items-center justify-center" onPress={() => setDays(p => p + 1)}>
          <ThemedText className="text-2xl text-white">+</ThemedText>
        </Pressable>
      </View>
      <View className="flex-row justify-center gap-4 mb-8">
        {DURATION_PRESETS.map(preset => (
          <Pressable
            key={preset}
            className={`px-4 py-2 rounded-lg ${days === preset ? 'bg-blue-600' : 'bg-gray-800'}`}
            onPress={() => setDays(preset)}
          >
            <ThemedText className="text-white font-medium">{preset} days</ThemedText>
          </Pressable>
        ))}
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <ThemedText className="text-3xl font-bold text-white mb-4">You just made your Day Zero count</ThemedText>
      <ThemedText className="text-xl text-gray-300 mb-6 text-center">
        You've committed to breaking free from <ThemedText className="text-white font-semibold">{habit.toLowerCase()}</ThemedText> for the next{" "}
        <ThemedText className="text-white font-semibold">{days} days</ThemedText>.
      </ThemedText>
      <ThemedText className="text-gray-400 mb-2 text-center">You're not aiming for perfect — you're building momentum.</ThemedText>
    </>
  );

  const canProceed = step === 1 ? !!habit.trim() : true;
  const ctaLabel = step < 3 ? "Next" : "Let's Start";
  
  console.log("ONBOARD: Button state -", {
    step,
    canProceed,
    ctaLabel,
    hasHabit: !!habit.trim(),
  });

  return (
    <ThemedView className="flex-1 bg-black px-6">
      <Animated.View
        pointerEvents="box-none"
        className="flex-1 justify-center"
        style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Animated.View>

             {/* Fixed footer button OUTSIDE the animated content */}
       <Pressable
         onPress={() => {
           console.log("ONBOARD: Button pressed!");
           handlePrimary();
         }}
         disabled={!canProceed}
         android_ripple={{ borderless: false }}
         style={{
           opacity: canProceed ? 1 : 0.5,
           marginBottom: 24,
           borderRadius: 12,
           paddingVertical: 16,
           alignItems: "center",
           justifyContent: "center",
           backgroundColor: "#2563EB",
         }}
       >
        <ThemedText className="text-white text-center text-lg font-semibold">{ctaLabel}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

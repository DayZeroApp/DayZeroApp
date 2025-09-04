// app/(tabs)/settings.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Linking, Modal, Pressable, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';

function Row({
  title,
  subtitle,
  right,
  onPress,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#111', // card
        borderWidth: 1,
        borderColor: '#1f2937',
        marginBottom: 10,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <ThemedText style={{ color: danger ? '#ef4444' : '#fff', fontSize: 16, fontWeight: '600' }}>
            {title}
          </ThemedText>
          {!!subtitle && (
            <ThemedText style={{ color: '#9ca3af', marginTop: 4, fontSize: 13 }}>{subtitle}</ThemedText>
          )}
        </View>
        {right}
      </View>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <ThemedText style={{ color: '#9ca3af', marginBottom: 8, fontSize: 12, letterSpacing: 0.6 }}>
        {title.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

// Simple "time picker" without adding native deps: choose from preset times (30-min steps)
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h24 = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const h12 = ((h24 + 11) % 12) + 1;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  return `${h12}:${m} ${ampm}`;
});

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Appearance
  const [useAutoTheme, setUseAutoTheme] = useState(true);

  // Notifications
  const [dailyCheckinOn, setDailyCheckinOn] = useState(false);
  const [dailyCheckinTime, setDailyCheckinTime] = useState('8:00 AM');
  const [eveningOn, setEveningOn] = useState(false);
  const [eveningTime, setEveningTime] = useState('8:00 PM');

  // Account
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Auto');
  const [dailyResetTime, setDailyResetTime] = useState('8:00 PM');

  // Time modal
  const [timeModal, setTimeModal] = useState<{
    visible: boolean;
    onSelect: (t: string) => void;
    title: string;
  }>({ visible: false, onSelect: () => {}, title: '' });

  const openTimeModal = (title: string, onSelect: (t: string) => void) =>
    setTimeModal({ visible: true, onSelect, title });

  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link');
    }
  };

  const versionLabel = useMemo(() => {
    const v = Constants.expoConfig?.version ?? '1.0.0';
    return `v${v}`;
  }, []);

  return (
    
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'black' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: '#1F2937',
              padding: 8,
              borderRadius: 8,
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#9CA3AF"/>
          </TouchableOpacity>
          <ThemedText style={{ color: '#fff', fontSize: 28, fontWeight: '800'}}>
            Settings
          </ThemedText>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }} 
        showsVerticalScrollIndicator={true}
        bounces={true}
      >

      {/* Appearance */}
      <Section title="Appearance">
        <Row
          title="Use Auto Theme"
          subtitle="Auto (5am–5pm Light, 5pm–5am Dark)"
          right={
            <Switch
              value={useAutoTheme}
              onValueChange={setUseAutoTheme}
              thumbColor={useAutoTheme ? '#22c55e' : '#374151'}
              trackColor={{ true: '#16a34a', false: '#111827' }}
            />
          }
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row
          title="Daily Check-in Reminder"
          subtitle={dailyCheckinOn ? `Time: ${dailyCheckinTime}` : 'Off'}
          right={<Switch value={dailyCheckinOn} onValueChange={setDailyCheckinOn} />}
          onPress={() => dailyCheckinOn && openTimeModal('Daily Check-in Time', setDailyCheckinTime)}
        />
        <Row
          title="Evening Reflection Reminder"
          subtitle={eveningOn ? `Time: ${eveningTime}` : 'Off'}
          right={<Switch value={eveningOn} onValueChange={setEveningOn} />}
          onPress={() => eveningOn && openTimeModal('Evening Reflection Time', setEveningTime)}
        />
      </Section>

      {/* AI Coach */}
      <Section title="AI Coach">
        <Row
          title="Daily Query Limit"
          subtitle='Free: 3 per day (resets 8 PM)'
          right={<ThemedText style={{ color: '#a3e635', fontWeight: '700' }}>3 / day</ThemedText>}
        />
        <Row
          title="Off-topic Guardrail"
          subtitle='Coach answers habit/goal topics only.'
        />
      </Section>

      {/* Plan & Billing */}
      <Section title="Plan & Billing">
        <Row
          title="Your Plan"
          subtitle="Free / Trial / Premium"
          right={<ThemedText style={{ color: '#60a5fa' }}>Free</ThemedText>}
        />
        <Row
          title="Manage Subscription"
          subtitle="Opens Google Play Billing"
          onPress={() => Alert.alert('Subscription', 'Hook up Play Billing here.')}
          right={<Ionicons name="chevron-forward" size={18} color="#9ca3af" />}
        />
        <Row
          title="Restore Purchases"
          onPress={() => Alert.alert('Restore', 'Trigger restore purchases here.')}
          right={<Ionicons name="refresh" size={18} color="#9ca3af" />}
        />
        <Row
          title="Redeem Code"
          onPress={() => Alert.alert('Redeem', 'Open redeem code UI here.')}
          right={<Ionicons name="pricetag-outline" size={18} color="#9ca3af" />}
        />
      </Section>

      {/* Account */}
      <Section title="Account">
        {isAuthenticated ? (
          <>
            <Row
              title={`Logged in as: ${user?.email ?? 'Unknown'}`}
              subtitle={user?.displayName ?? undefined}
            />
            <Row
              title="Sign Out"
              danger
              onPress={async () => {
                try {
                  await signOut(auth);
                  Alert.alert('Signed out');
                } catch (e) {
                  Alert.alert('Sign out failed', String(e));
                }
              }}
              right={<Ionicons name="log-out-outline" size={18} color="#ef4444" />}
            />
          </>
        ) : (
          <Row
            title="Sign in with Google"
            subtitle="Required to sync and back up your data"
            onPress={() => router.push('/login')}
            right={<Ionicons name="logo-google" size={20} color="#60a5fa" />}
          />
        )}

        <Row
          title="Timezone"
          subtitle={`${timezone} (tap to change)`}
          onPress={() => Alert.alert('Timezone', 'Implement manual timezone selection if needed.')}
          right={<Ionicons name="time-outline" size={18} color="#9ca3af" />}
        />
        <Row
          title="Daily Reset Time"
          subtitle={`${dailyResetTime} (resets streak window & AI query count)`}
          onPress={() => openTimeModal('Daily Reset Time', setDailyResetTime)}
          right={<Ionicons name="alarm-outline" size={18} color="#9ca3af" />}
        />
      </Section>

      {/* Data & Privacy */}
      <Section title="Data & Privacy">
        <Row
          title="Export Data"
          subtitle="CSV/JSON (Coming soon)"
          right={<Ionicons name="download-outline" size={18} color="#9ca3af" />}
        />
        <Row
          title="Delete Account & Data"
          danger
          onPress={() =>
            Alert.alert(
              'Delete Account',
              'This will permanently delete your Day Zero account and data.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deleted (stub)') },
              ]
            )
          }
          right={<Ionicons name="trash-outline" size={18} color="#ef4444" />}
        />
        <Row
          title="Privacy Policy"
          onPress={() => open('https://example.com/privacy')}
          right={<Ionicons name="open-outline" size={18} color="#9ca3af" />}
        />
        <Row
          title="Terms of Service"
          onPress={() => open('https://example.com/terms')}
          right={<Ionicons name="open-outline" size={18} color="#9ca3af" />}
        />
      </Section>

      {/* About */}
      <Section title="About">
        <Row
          title="App Version"
          subtitle={versionLabel}
        />
        <Row
          title="Contact Support"
          onPress={() => open('mailto:support@startdayzero.com')}
          right={<Ionicons name="mail-outline" size={18} color="#9ca3af" />}
        />
        <Row
          title="What's New"
          subtitle="Release notes (optional)"
          onPress={() => Alert.alert('Changelog', 'Show release notes here.')}
          right={<Ionicons name="sparkles-outline" size={18} color="#9ca3af" />}
        />
      </Section>
      </ScrollView>

      {/* Time picker modal */}
      <Modal
        visible={timeModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModal({ ...timeModal, visible: false })}
      >
        <Pressable
          onPress={() => setTimeModal({ ...timeModal, visible: false })}
          style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: 24 }}
        >
          <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 12, maxHeight: '70%' }}>
            <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '700', padding: 12 }}>
              {timeModal.title}
            </ThemedText>
            <FlatList
              data={TIMES}
              keyExtractor={(t) => t}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    timeModal.onSelect(item);
                    setTimeModal({ ...timeModal, visible: false });
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <ThemedText style={{ color: '#fff', fontSize: 15 }}>{item}</ThemedText>
                </Pressable>
              )}
            />
          </View>
                 </Pressable>
       </Modal>
     </View>
   );
 }

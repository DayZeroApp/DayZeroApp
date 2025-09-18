// components/DebugStorage.tsx
import { Local } from '@/lib/local';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function DebugStorage() {
  const [storageData, setStorageData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const loadStorageData = async () => {
    setLoading(true);
    try {
      const habits = await Local.getHabits();
      const profile = await Local.getProfile();
      const plan = await Local.getPlan();
      const aiLimits = await Local.getAiLimits();
      const notifications = await Local.getNotifications();
      
      // Get today's logs
      const today = new Date().toLocaleDateString('en-CA');
      const logs = await Local.getLog(today);
      
      setStorageData({
        habits,
        profile,
        plan,
        aiLimits,
        notifications,
        logs: { [today]: logs }
      });
    } catch (error) {
      console.error('Failed to load storage data:', error);
      Alert.alert('Error', 'Failed to load storage data');
    }
    setLoading(false);
  };

  const clearStorage = async () => {
    Alert.alert(
      'Clear Storage',
      'Are you sure you want to clear all local storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await Local.setHabits([]);
              await Local.setGoals([]);
              await Local.setLog(new Date().toLocaleDateString('en-CA'), {});
              await loadStorageData();
              Alert.alert('Success', 'Storage cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear storage');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <ThemedView style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          🐛 Storage Debug
        </ThemedText>
        
        <TouchableOpacity
          onPress={loadStorageData}
          style={{
            backgroundColor: '#3B82F6',
            padding: 15,
            borderRadius: 8,
            marginBottom: 20
          }}
          disabled={loading}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {loading ? 'Loading...' : '🔄 Refresh Storage Data'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearStorage}
          style={{
            backgroundColor: '#EF4444',
            padding: 15,
            borderRadius: 8,
            marginBottom: 20
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🗑️ Clear Storage
          </Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: '#1F2937', padding: 15, borderRadius: 8 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            📦 Storage Contents:
          </ThemedText>
          <Text style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
            {JSON.stringify(storageData, null, 2)}
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

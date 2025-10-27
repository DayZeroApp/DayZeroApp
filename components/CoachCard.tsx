// components/CoachCard.tsx
import { canUseCoach, markCoachUsed } from '@/lib/coach';
import { getPlanLimits } from '@/lib/entitlements';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default async function CoachCard() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(0);

  async function refreshQuota() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ok = await canUseCoach(tz);
    setRemaining(ok.max - ok.used);
  }

  useEffect(() => { refreshQuota(); }, []);

  async function ask() {
    if (!prompt.trim()) return;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ok = await canUseCoach(tz);
    if (!ok.allowed) { setAnswer('Daily AI limit reached. Try again after your reset.'); return; }

    setLoading(true);
    try {
      const res = await fetchCoach(prompt);               // ⬅️ implement below
      const clipped = clipTo150Words(res);
      setAnswer(clipped);
      await markCoachUsed();
      await refreshQuota();
    } catch (e) {
      setAnswer('Hmm, I had trouble answering. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ backgroundColor: '#111827', borderRadius: 16, padding: 16, borderColor:'#1f2937', borderWidth:1 }}>
      <Text style={{ color:'#fff', fontWeight:'700', fontSize:16, marginBottom:8 }}>AI Coach</Text>
      <Text style={{ color:'#9CA3AF', fontSize:12, marginBottom:8 }}>
        {remaining} / {(await getPlanLimits()).aiPerDay} left today
      </Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Ask about habits, motivation, or staying consistent…"
        placeholderTextColor="#64748B"
        multiline
        style={{ color:'#fff', backgroundColor:'#0A0F18', borderRadius:10, padding:12, minHeight:80, borderWidth:1, borderColor:'#1f2937' }}
      />
      <TouchableOpacity
        onPress={ask}
        disabled={loading}
        style={{ marginTop:10, backgroundColor:'#2563EB', borderRadius:10, paddingVertical:10, alignItems:'center', opacity: loading ? 0.7 : 1 }}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'700' }}>Ask coach</Text>}
      </TouchableOpacity>

      {answer && (
        <View style={{ marginTop:12, backgroundColor:'#0B0F1A', borderRadius:10, padding:12, borderWidth:1, borderColor:'#1f2937' }}>
          <Text style={{ color:'#fff' }}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

// --- helpers ---
function clipTo150Words(s: string) {
  const words = s.trim().split(/\s+/);
  if (words.length <= 150) return s.trim();
  return words.slice(0, 150).join(' ') + '…';
}

async function fetchCoach(userPrompt: string): Promise<string> {
  // OPTION A: call your backend
  // const r = await fetch('https://your.api/coach', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: userPrompt }) });
  // const { answer } = await r.json(); return answer;

  // OPTION B: direct OpenAI call (ok for internal/testing)
  // NOTE: Move this to a backend before public launch.
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY; // or SecureStore
  const sys = `You are Day Zero's tiny habit coach.
Only answer about habits, goals, motivation, reflection, and routines.
Refuse unrelated questions briefly and kindly. Keep answers under 150 words.`;

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // small, fast; swap as you like
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content?.trim() || 'No response.';
  return text;
}

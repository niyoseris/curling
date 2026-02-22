import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface GameMenuProps {
  onStart: () => void;
}

export default function GameMenu({ onStart }: GameMenuProps) {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  return (
    <LinearGradient colors={['#0D47A1', '#1565C0', '#1E88E5']} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + webTopInset + 40, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }]}>
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="curling" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>CURLING</Text>
          <Text style={styles.subtitle}>Olympic Ice Challenge</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="person" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.infoText}>1 Player</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="hardware-chip" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.infoText}>vs AI</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="target" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.infoText}>4 Ends</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
          onPress={handleStart}
        >
          <Ionicons name="play" size={28} color="#0D47A1" />
          <Text style={styles.playButtonText}>PLAY</Text>
        </Pressable>

        <View style={styles.rulesSection}>
          <Text style={styles.rulesTitle}>HOW TO PLAY</Text>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleDot, { backgroundColor: Colors.stoneRed }]} />
            <Text style={styles.ruleText}>Drag the power meter to set throw strength</Text>
          </View>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleDot, { backgroundColor: Colors.stoneYellow }]} />
            <Text style={styles.ruleText}>Slide the aim control to adjust direction</Text>
          </View>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleDot, { backgroundColor: '#FFFFFF' }]} />
            <Text style={styles.ruleText}>Get your stones closest to the center</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  infoSection: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  playButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  playButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  playButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D47A1',
    letterSpacing: 3,
  },
  rulesSection: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  rulesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ruleText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    flex: 1,
  },
});

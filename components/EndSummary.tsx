import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface EndSummaryProps {
  currentEnd: number;
  redScore: number;
  yellowScore: number;
  totalRedScore: number;
  totalYellowScore: number;
  onNext: () => void;
}

export default function EndSummary({
  currentEnd,
  redScore,
  yellowScore,
  totalRedScore,
  totalYellowScore,
  onNext,
}: EndSummaryProps) {
  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  const winner = redScore > yellowScore ? 'You scored!' : yellowScore > redScore ? 'AI scored!' : 'Blank end!';

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.endLabel}>END {currentEnd} COMPLETE</Text>
        <Text style={styles.resultText}>{winner}</Text>

        <View style={styles.scoresRow}>
          <View style={styles.scoreItem}>
            <View style={[styles.scoreDot, { backgroundColor: Colors.stoneRed }]} />
            <Text style={styles.scoreLabel}>YOU</Text>
            <Text style={styles.scoreEndValue}>+{redScore}</Text>
            <Text style={styles.scoreTotalValue}>Total: {totalRedScore}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreItem}>
            <View style={[styles.scoreDot, { backgroundColor: Colors.stoneYellow }]} />
            <Text style={styles.scoreLabel}>AI</Text>
            <Text style={styles.scoreEndValue}>+{yellowScore}</Text>
            <Text style={styles.scoreTotalValue}>Total: {totalYellowScore}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>NEXT END</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 16,
  },
  endLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#90A4AE',
    letterSpacing: 2,
  },
  resultText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  scoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#90A4AE',
    letterSpacing: 1,
  },
  scoreEndValue: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
  },
  scoreTotalValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B0BEC5',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  nextButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

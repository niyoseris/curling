import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface EndScore {
  red: number;
  yellow: number;
}

interface GameOverProps {
  totalRedScore: number;
  totalYellowScore: number;
  endScores: EndScore[];
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function GameOver({
  totalRedScore,
  totalYellowScore,
  endScores,
  onPlayAgain,
  onMenu,
}: GameOverProps) {
  const playerWon = totalRedScore > totalYellowScore;
  const isTie = totalRedScore === totalYellowScore;

  const handlePlayAgain = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPlayAgain();
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={playerWon ? ['#1B5E20', '#2E7D32'] : isTie ? ['#37474F', '#455A64'] : ['#B71C1C', '#C62828']}
        style={styles.card}
      >
        <MaterialCommunityIcons
          name={playerWon ? 'trophy' : isTie ? 'handshake' : 'robot'}
          size={56}
          color="rgba(255,255,255,0.9)"
        />
        <Text style={styles.resultTitle}>
          {playerWon ? 'YOU WIN!' : isTie ? 'TIE GAME!' : 'AI WINS!'}
        </Text>

        <View style={styles.finalScores}>
          <View style={styles.finalScoreItem}>
            <View style={[styles.teamDot, { backgroundColor: Colors.stoneRed }]} />
            <Text style={styles.finalScoreLabel}>YOU</Text>
            <Text style={styles.finalScoreValue}>{totalRedScore}</Text>
          </View>
          <Text style={styles.vs}>-</Text>
          <View style={styles.finalScoreItem}>
            <View style={[styles.teamDot, { backgroundColor: Colors.stoneYellow }]} />
            <Text style={styles.finalScoreLabel}>AI</Text>
            <Text style={styles.finalScoreValue}>{totalYellowScore}</Text>
          </View>
        </View>

        <View style={styles.endBreakdown}>
          <Text style={styles.breakdownTitle}>END BREAKDOWN</Text>
          {endScores.map((score, i) => (
            <View key={i} style={styles.breakdownRow}>
              <Text style={styles.breakdownEnd}>End {i + 1}</Text>
              <Text style={[styles.breakdownScore, score.red > score.yellow && styles.winningScore]}>
                {score.red}
              </Text>
              <Text style={styles.breakdownDash}>-</Text>
              <Text style={[styles.breakdownScore, score.yellow > score.red && styles.winningScore]}>
                {score.yellow}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.menuButton, pressed && { opacity: 0.8 }]}
            onPress={onMenu}
          >
            <Ionicons name="home" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.playAgainButton, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
            onPress={handlePlayAgain}
          >
            <Ionicons name="refresh" size={20} color="#0D47A1" />
            <Text style={styles.playAgainText}>PLAY AGAIN</Text>
          </Pressable>
        </View>
      </LinearGradient>
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
    borderRadius: 24,
    padding: 28,
    width: '88%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 16,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  finalScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  finalScoreItem: {
    alignItems: 'center',
    gap: 4,
  },
  teamDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  finalScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  finalScoreValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  vs: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  endBreakdown: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  breakdownTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  breakdownEnd: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    width: 50,
  },
  breakdownScore: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    width: 24,
    textAlign: 'center',
  },
  winningScore: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  breakdownDash: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  menuButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D47A1',
    letterSpacing: 1,
  },
});

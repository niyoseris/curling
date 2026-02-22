import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface ScoreboardProps {
  currentEnd: number;
  totalEnds: number;
  totalRedScore: number;
  totalYellowScore: number;
  playerStonesLeft: number;
  aiStonesLeft: number;
  currentTeamTurn: 'red' | 'yellow';
  isPlayerTurn: boolean;
}

export default function Scoreboard({
  currentEnd,
  totalEnds,
  totalRedScore,
  totalYellowScore,
  playerStonesLeft,
  aiStonesLeft,
  currentTeamTurn,
  isPlayerTurn,
}: ScoreboardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.scoresRow}>
        <View style={[styles.teamScore, currentTeamTurn === 'red' && styles.activeTeam]}>
          <View style={[styles.teamDot, { backgroundColor: Colors.stoneRed }]} />
          <Text style={styles.teamLabel}>YOU</Text>
          <Text style={styles.scoreValue}>{totalRedScore}</Text>
          <View style={styles.stonesLeft}>
            {Array.from({ length: playerStonesLeft }).map((_, i) => (
              <View key={i} style={[styles.miniStone, { backgroundColor: Colors.stoneRed }]} />
            ))}
          </View>
        </View>

        <View style={styles.endInfo}>
          <Text style={styles.endLabel}>END</Text>
          <Text style={styles.endValue}>{currentEnd}/{totalEnds}</Text>
          {isPlayerTurn ? (
            <View style={styles.turnBadge}>
              <Text style={styles.turnText}>YOUR TURN</Text>
            </View>
          ) : (
            <View style={[styles.turnBadge, styles.aiTurnBadge]}>
              <Ionicons name="hardware-chip" size={10} color="#FFFFFF" />
              <Text style={styles.turnText}>AI</Text>
            </View>
          )}
        </View>

        <View style={[styles.teamScore, currentTeamTurn === 'yellow' && styles.activeTeam]}>
          <View style={[styles.teamDot, { backgroundColor: Colors.stoneYellow }]} />
          <Text style={styles.teamLabel}>AI</Text>
          <Text style={styles.scoreValue}>{totalYellowScore}</Text>
          <View style={styles.stonesLeft}>
            {Array.from({ length: aiStonesLeft }).map((_, i) => (
              <View key={i} style={[styles.miniStone, { backgroundColor: Colors.stoneYellow }]} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.scoreBackground,
    borderRadius: 16,
    padding: 12,
  },
  teamScore: {
    alignItems: 'center',
    gap: 3,
    flex: 1,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTeam: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  teamDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  teamLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stonesLeft: {
    flexDirection: 'row',
    gap: 3,
    minHeight: 8,
  },
  miniStone: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  endInfo: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
  },
  endLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  endValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  turnBadge: {
    backgroundColor: Colors.stoneRed,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  aiTurnBadge: {
    backgroundColor: Colors.stoneYellow,
  },
  turnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

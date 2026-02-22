import { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';
import CurlingSheet from '@/components/CurlingSheet';
import Scoreboard from '@/components/Scoreboard';
import GameMenu from '@/components/GameMenu';
import EndSummary from '@/components/EndSummary';
import GameOver from '@/components/GameOver';
import { stepPhysics, isAnyStoneMoving } from '@/lib/physics';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_WIDTH = Math.min(SCREEN_WIDTH - 24, 360);
const SHEET_HEIGHT = Math.min(SHEET_WIDTH * 2, SCREEN_HEIGHT * 0.68);

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const game = useGame();
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const stonesRef = useRef(game.stones);
  const [aiThinking, setAiThinking] = useState(false);

  stonesRef.current = game.stones;

  const runPhysics = useCallback(() => {
    const currentStones = stonesRef.current;
    if (!isAnyStoneMoving(currentStones)) {
      animationRef.current = null;
      return;
    }

    const updated = stepPhysics(currentStones, game.config);
    game.updateStones(updated);
    stonesRef.current = updated;

    if (isAnyStoneMoving(updated)) {
      animationRef.current = requestAnimationFrame(runPhysics);
    } else {
      animationRef.current = null;
    }
  }, [game.config, game.updateStones]);

  useEffect(() => {
    if (game.phase === 'throwing' || game.phase === 'ai_throwing') {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(runPhysics);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [game.phase, runPhysics]);

  useEffect(() => {
    if ((game.phase === 'throwing' || game.phase === 'ai_throwing') && !isAnyStoneMoving(game.stones)) {
      if (game.phase === 'throwing') {
        game.onThrowComplete();
      } else {
        game.onAIThinkComplete();
      }
    }
  }, [game.stones, game.phase]);

  useEffect(() => {
    if (game.phase === 'ai_thinking') {
      setAiThinking(true);
      const timer = setTimeout(() => {
        setAiThinking(false);
        const shot = game.getAIShot();
        game.aiThrow(shot.power, shot.angle, shot.curl);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [game.phase]);

  const handleThrow = useCallback(
    (power: number, angle: number) => {
      game.playerThrow(power, angle, (Math.random() - 0.5) * 0.3);
    },
    [game.playerThrow]
  );

  if (game.phase === 'menu') {
    return (
      <>
        <StatusBar style="light" />
        <GameMenu onStart={game.startGame} />
      </>
    );
  }

  const isPlayerTurn = game.currentTeamTurn === game.playerTeam;
  const canThrow = game.phase === 'playing' && isPlayerTurn;
  const isBusy = game.phase === 'throwing' || game.phase === 'ai_throwing' || game.phase === 'ai_thinking';

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <StatusBar style="light" />

      <Scoreboard
        currentEnd={game.currentEnd}
        totalEnds={game.totalEnds}
        totalRedScore={game.totalRedScore}
        totalYellowScore={game.totalYellowScore}
        playerStonesLeft={game.playerStonesLeft}
        aiStonesLeft={game.aiStonesLeft}
        currentTeamTurn={game.currentTeamTurn}
        isPlayerTurn={isPlayerTurn}
      />

      <View style={styles.sheetContainer}>
        <CurlingSheet
          stones={game.stones}
          config={game.config}
          width={SHEET_WIDTH}
          height={SHEET_HEIGHT}
          canThrow={canThrow}
          onThrow={handleThrow}
          playerTeam={game.playerTeam}
        />
        {aiThinking && (
          <View style={styles.aiThinkingOverlay}>
            <View style={styles.aiThinkingBadge}>
              <Text style={styles.aiThinkingText}>AI is thinking...</Text>
            </View>
          </View>
        )}
      </View>

      {isBusy && !aiThinking && (
        <View style={[styles.statusBar, { paddingBottom: insets.bottom + webBottomInset + 8 }]}>
          <Text style={styles.statusText}>Stone in motion...</Text>
        </View>
      )}

      {game.phase === 'end_summary' && (
        <EndSummary
          currentEnd={game.currentEnd}
          redScore={game.lastEndRedScore}
          yellowScore={game.lastEndYellowScore}
          totalRedScore={game.totalRedScore}
          totalYellowScore={game.totalYellowScore}
          onNext={game.nextEnd}
        />
      )}

      {game.phase === 'game_over' && (
        <GameOver
          totalRedScore={game.totalRedScore}
          totalYellowScore={game.totalYellowScore}
          endScores={game.endScores}
          onPlayAgain={game.startGame}
          onMenu={game.returnToMenu}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  sheetContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#607D8B',
  },
  aiThinkingOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  aiThinkingBadge: {
    backgroundColor: 'rgba(255, 179, 0, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  aiThinkingText: {
    color: '#263238',
    fontSize: 13,
    fontWeight: '700',
  },
});

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Stone, createStone, throwStone, DEFAULT_CONFIG, calculateScores, PhysicsConfig } from '@/lib/physics';
import { calculateAIShot } from '@/lib/ai';
import * as Crypto from 'expo-crypto';

export type GamePhase = 'menu' | 'playing' | 'throwing' | 'ai_thinking' | 'ai_throwing' | 'end_summary' | 'game_over';

interface EndScore {
  red: number;
  yellow: number;
}

interface GameState {
  phase: GamePhase;
  stones: Stone[];
  currentEnd: number;
  totalEnds: number;
  playerTeam: 'red' | 'yellow';
  aiTeam: 'red' | 'yellow';
  currentTeamTurn: 'red' | 'yellow';
  playerStonesLeft: number;
  aiStonesLeft: number;
  endScores: EndScore[];
  totalRedScore: number;
  totalYellowScore: number;
  config: PhysicsConfig;
  lastEndRedScore: number;
  lastEndYellowScore: number;
}

interface GameContextValue extends GameState {
  startGame: () => void;
  playerThrow: (power: number, angle: number, curl: number) => void;
  updateStones: (stones: Stone[]) => void;
  onThrowComplete: () => void;
  onAIThinkComplete: () => void;
  getAIShot: () => { power: number; angle: number; curl: number };
  aiThrow: (power: number, angle: number, curl: number) => void;
  nextEnd: () => void;
  returnToMenu: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const STONES_PER_TEAM = 5;

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    phase: 'menu',
    stones: [],
    currentEnd: 1,
    totalEnds: 4,
    playerTeam: 'red',
    aiTeam: 'yellow',
    currentTeamTurn: 'red',
    playerStonesLeft: STONES_PER_TEAM,
    aiStonesLeft: STONES_PER_TEAM,
    endScores: [],
    totalRedScore: 0,
    totalYellowScore: 0,
    config: DEFAULT_CONFIG,
    lastEndRedScore: 0,
    lastEndYellowScore: 0,
  });

  const startGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'playing',
      stones: [],
      currentEnd: 1,
      currentTeamTurn: 'red',
      playerStonesLeft: STONES_PER_TEAM,
      aiStonesLeft: STONES_PER_TEAM,
      endScores: [],
      totalRedScore: 0,
      totalYellowScore: 0,
      lastEndRedScore: 0,
      lastEndYellowScore: 0,
    }));
  }, []);

  const playerThrow = useCallback((power: number, angle: number, curl: number) => {
    setState((prev) => {
      const id = Crypto.randomUUID();
      const startX = prev.config.sheetWidth / 2;
      const startY = prev.config.sheetHeight - 30;
      let stone = createStone(id, prev.playerTeam, startX, startY);
      stone = throwStone(stone, power, angle, curl);
      return {
        ...prev,
        phase: 'throwing',
        stones: [...prev.stones, stone],
        playerStonesLeft: prev.playerStonesLeft - 1,
      };
    });
  }, []);

  const aiThrow = useCallback((power: number, angle: number, curl: number) => {
    setState((prev) => {
      const id = Crypto.randomUUID();
      const startX = prev.config.sheetWidth / 2;
      const startY = prev.config.sheetHeight - 30;
      let stone = createStone(id, prev.aiTeam, startX, startY);
      stone = throwStone(stone, power, angle, curl);
      return {
        ...prev,
        phase: 'ai_throwing',
        stones: [...prev.stones, stone],
        aiStonesLeft: prev.aiStonesLeft - 1,
      };
    });
  }, []);

  const updateStones = useCallback((stones: Stone[]) => {
    setState((prev) => ({ ...prev, stones }));
  }, []);

  const onThrowComplete = useCallback(() => {
    setState((prev) => {
      if (prev.playerStonesLeft === 0 && prev.aiStonesLeft === 0) {
        const scores = calculateScores(prev.stones, prev.config);
        const newEndScores = [...prev.endScores, { red: scores.red, yellow: scores.yellow }];
        const newTotalRed = prev.totalRedScore + scores.red;
        const newTotalYellow = prev.totalYellowScore + scores.yellow;

        if (prev.currentEnd >= prev.totalEnds) {
          return {
            ...prev,
            phase: 'game_over',
            endScores: newEndScores,
            totalRedScore: newTotalRed,
            totalYellowScore: newTotalYellow,
            lastEndRedScore: scores.red,
            lastEndYellowScore: scores.yellow,
          };
        }

        return {
          ...prev,
          phase: 'end_summary',
          endScores: newEndScores,
          totalRedScore: newTotalRed,
          totalYellowScore: newTotalYellow,
          lastEndRedScore: scores.red,
          lastEndYellowScore: scores.yellow,
        };
      }

      if (prev.aiStonesLeft > 0) {
        return { ...prev, phase: 'ai_thinking', currentTeamTurn: prev.aiTeam };
      }

      return { ...prev, phase: 'playing', currentTeamTurn: prev.playerTeam };
    });
  }, []);

  const onAIThinkComplete = useCallback(() => {
    setState((prev) => {
      if (prev.playerStonesLeft === 0 && prev.aiStonesLeft === 0) {
        const scores = calculateScores(prev.stones, prev.config);
        const newEndScores = [...prev.endScores, { red: scores.red, yellow: scores.yellow }];
        const newTotalRed = prev.totalRedScore + scores.red;
        const newTotalYellow = prev.totalYellowScore + scores.yellow;

        if (prev.currentEnd >= prev.totalEnds) {
          return {
            ...prev,
            phase: 'game_over',
            endScores: newEndScores,
            totalRedScore: newTotalRed,
            totalYellowScore: newTotalYellow,
            lastEndRedScore: scores.red,
            lastEndYellowScore: scores.yellow,
          };
        }

        return {
          ...prev,
          phase: 'end_summary',
          endScores: newEndScores,
          totalRedScore: newTotalRed,
          totalYellowScore: newTotalYellow,
          lastEndRedScore: scores.red,
          lastEndYellowScore: scores.yellow,
        };
      }

      if (prev.playerStonesLeft > 0) {
        return { ...prev, phase: 'playing', currentTeamTurn: prev.playerTeam };
      }

      return { ...prev, phase: 'ai_thinking', currentTeamTurn: prev.aiTeam };
    });
  }, []);

  const getAIShot = useCallback(() => {
    return calculateAIShot(state.stones, state.aiTeam, state.config, state.aiStonesLeft);
  }, [state.stones, state.aiTeam, state.config, state.aiStonesLeft]);

  const nextEnd = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'playing',
      stones: [],
      currentEnd: prev.currentEnd + 1,
      currentTeamTurn: 'red',
      playerStonesLeft: STONES_PER_TEAM,
      aiStonesLeft: STONES_PER_TEAM,
      lastEndRedScore: 0,
      lastEndYellowScore: 0,
    }));
  }, []);

  const returnToMenu = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'menu',
      stones: [],
      currentEnd: 1,
      currentTeamTurn: 'red',
      playerStonesLeft: STONES_PER_TEAM,
      aiStonesLeft: STONES_PER_TEAM,
      endScores: [],
      totalRedScore: 0,
      totalYellowScore: 0,
      lastEndRedScore: 0,
      lastEndYellowScore: 0,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      startGame,
      playerThrow,
      updateStones,
      onThrowComplete,
      onAIThinkComplete,
      getAIShot,
      aiThrow,
      nextEnd,
      returnToMenu,
    }),
    [state, startGame, playerThrow, updateStones, onThrowComplete, onAIThinkComplete, getAIShot, aiThrow, nextEnd, returnToMenu]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

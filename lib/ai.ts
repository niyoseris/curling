import { Stone, PhysicsConfig, getDistanceToCenter } from './physics';

export interface AIShot {
  power: number;
  angle: number;
  curl: number;
}

function getClosestOpponentStone(stones: Stone[], aiTeam: 'red' | 'yellow', config: PhysicsConfig): Stone | null {
  const opponentTeam = aiTeam === 'red' ? 'yellow' : 'red';
  const opponentStones = stones.filter((s) => s.team === opponentTeam);
  if (opponentStones.length === 0) return null;

  return opponentStones.reduce((closest, s) => {
    const dist = getDistanceToCenter(s, config);
    const closestDist = getDistanceToCenter(closest, config);
    return dist < closestDist ? s : closest;
  }, opponentStones[0]);
}

export function calculateAIShot(
  stones: Stone[],
  aiTeam: 'red' | 'yellow',
  config: PhysicsConfig,
  stonesRemaining: number
): AIShot {
  const center = config.houseCenter;
  const closestOpponent = getClosestOpponentStone(stones, aiTeam, config);

  const randomFactor = () => (Math.random() - 0.5) * 0.08;

  if (!closestOpponent || getDistanceToCenter(closestOpponent, config) > 55) {
    const targetX = center.x + (Math.random() - 0.5) * 20;
    const startX = config.sheetWidth / 2;
    const dx = targetX - startX;
    const angle = Math.atan2(dx, config.sheetHeight - center.y) + randomFactor();
    const power = 0.38 + Math.random() * 0.12 + randomFactor();

    return { power, angle, curl: (Math.random() - 0.5) * 0.5 };
  }

  const opponentDist = getDistanceToCenter(closestOpponent, config);

  if (opponentDist < 25 && stonesRemaining > 2) {
    const startX = config.sheetWidth / 2;
    const dx = closestOpponent.x - startX;
    const dy = config.sheetHeight - closestOpponent.y;
    const angle = Math.atan2(dx, dy) + randomFactor();
    const power = 0.55 + Math.random() * 0.15 + randomFactor();

    return { power, angle, curl: (Math.random() - 0.5) * 0.3 };
  }

  const offsetX = (Math.random() - 0.5) * 15;
  const targetX = center.x + offsetX;
  const startX = config.sheetWidth / 2;
  const dx = targetX - startX;
  const angle = Math.atan2(dx, config.sheetHeight - center.y) + randomFactor();
  const power = 0.35 + Math.random() * 0.15 + randomFactor();

  return { power, angle, curl: (Math.random() - 0.5) * 0.4 };
}

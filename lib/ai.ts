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

function getAIStoneInHouse(stones: Stone[], aiTeam: 'red' | 'yellow', config: PhysicsConfig): Stone | null {
  const aiStones = stones.filter((s) => s.team === aiTeam);
  const inHouse = aiStones.filter((s) => getDistanceToCenter(s, config) <= 60);
  if (inHouse.length === 0) return null;
  return inHouse.reduce((closest, s) => {
    return getDistanceToCenter(s, config) < getDistanceToCenter(closest, config) ? s : closest;
  }, inHouse[0]);
}

function estimatePowerForTarget(targetY: number, config: PhysicsConfig): number {
  const startY = config.sheetHeight - 30;
  const distance = startY - targetY;
  const friction = config.friction;
  const neededSpeed = distance * (1 - friction) * 1.15;
  return Math.max(0.15, Math.min(1, neededSpeed / 8));
}

export function calculateAIShot(
  stones: Stone[],
  aiTeam: 'red' | 'yellow',
  config: PhysicsConfig,
  stonesRemaining: number
): AIShot {
  const center = config.houseCenter;
  const closestOpponent = getClosestOpponentStone(stones, aiTeam, config);
  const aiInHouse = getAIStoneInHouse(stones, aiTeam, config);

  const smallRandom = () => (Math.random() - 0.5) * 0.03;

  if (!closestOpponent || getDistanceToCenter(closestOpponent, config) > 60) {
    const offsetX = (Math.random() - 0.5) * 12;
    const targetX = center.x + offsetX;
    const targetY = center.y + (Math.random() - 0.5) * 10;
    const startX = config.sheetWidth / 2;
    const dx = targetX - startX;
    const angle = Math.atan2(dx, config.sheetHeight - targetY) + smallRandom();
    const power = estimatePowerForTarget(targetY, config) + smallRandom();

    return { power, angle, curl: (Math.random() - 0.5) * 0.2 };
  }

  const opponentDist = getDistanceToCenter(closestOpponent, config);

  if (opponentDist < 20 && (!aiInHouse || getDistanceToCenter(aiInHouse, config) > opponentDist)) {
    const startX = config.sheetWidth / 2;
    const dx = closestOpponent.x - startX;
    const dy = config.sheetHeight - closestOpponent.y;
    const angle = Math.atan2(dx, dy) + smallRandom();
    const power = estimatePowerForTarget(closestOpponent.y, config) * 1.3 + smallRandom();

    return { power: Math.min(power, 1), angle, curl: (Math.random() - 0.5) * 0.15 };
  }

  if (aiInHouse && getDistanceToCenter(aiInHouse, config) < opponentDist) {
    const guardY = aiInHouse.y + 60 + Math.random() * 20;
    const offsetX = (Math.random() - 0.5) * 30;
    const targetX = aiInHouse.x + offsetX;
    const startX = config.sheetWidth / 2;
    const dx = targetX - startX;
    const angle = Math.atan2(dx, config.sheetHeight - guardY) + smallRandom();
    const power = estimatePowerForTarget(guardY, config) + smallRandom();

    return { power, angle, curl: (Math.random() - 0.5) * 0.2 };
  }

  const offsetAngle = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10);
  const targetX = center.x + offsetAngle;
  const targetY = center.y + (Math.random() - 0.5) * 8;
  const startX = config.sheetWidth / 2;
  const dx = targetX - startX;
  const angle = Math.atan2(dx, config.sheetHeight - targetY) + smallRandom();
  const power = estimatePowerForTarget(targetY, config) + smallRandom();

  return { power, angle, curl: (Math.random() - 0.5) * 0.2 };
}

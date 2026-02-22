export interface Stone {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: 'red' | 'yellow';
  isMoving: boolean;
}

export interface PhysicsConfig {
  friction: number;
  stoneRadius: number;
  sheetWidth: number;
  sheetHeight: number;
  houseCenter: { x: number; y: number };
  hogLineY: number;
  backLineY: number;
  restitution: number;
}

export const DEFAULT_CONFIG: PhysicsConfig = {
  friction: 0.985,
  stoneRadius: 12,
  sheetWidth: 300,
  sheetHeight: 600,
  houseCenter: { x: 150, y: 120 },
  hogLineY: 200,
  backLineY: 50,
  restitution: 0.7,
};

export function createStone(id: string, team: 'red' | 'yellow', x: number, y: number): Stone {
  return { id, x, y, vx: 0, vy: 0, team, isMoving: false };
}

export function throwStone(stone: Stone, power: number, angle: number, curl: number): Stone {
  const speed = power * 8;
  return {
    ...stone,
    vx: Math.sin(angle) * speed + curl * 0.3,
    vy: -Math.cos(angle) * speed,
    isMoving: true,
  };
}

function distanceBetween(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function resolveCollision(a: Stone, b: Stone, config: PhysicsConfig): [Stone, Stone] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = config.stoneRadius * 2;

  if (dist >= minDist || dist === 0) return [a, b];

  const nx = dx / dist;
  const ny = dy / dist;

  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;
  const dvn = dvx * nx + dvy * ny;

  if (dvn <= 0) return [a, b];

  const impulse = dvn * config.restitution;

  const overlap = minDist - dist;
  const separateX = (overlap / 2) * nx;
  const separateY = (overlap / 2) * ny;

  return [
    {
      ...a,
      x: a.x - separateX,
      y: a.y - separateY,
      vx: a.vx - impulse * nx,
      vy: a.vy - impulse * ny,
      isMoving: true,
    },
    {
      ...b,
      x: b.x + separateX,
      y: b.y + separateY,
      vx: b.vx + impulse * nx,
      vy: b.vy + impulse * ny,
      isMoving: true,
    },
  ];
}

export function stepPhysics(stones: Stone[], config: PhysicsConfig): Stone[] {
  let updated = stones.map((s) => {
    if (!s.isMoving) return s;

    let newX = s.x + s.vx;
    let newY = s.y + s.vy;
    let newVx = s.vx * config.friction;
    let newVy = s.vy * config.friction;

    if (newX - config.stoneRadius < 0) {
      newX = config.stoneRadius;
      newVx = -newVx * config.restitution;
    }
    if (newX + config.stoneRadius > config.sheetWidth) {
      newX = config.sheetWidth - config.stoneRadius;
      newVx = -newVx * config.restitution;
    }

    if (newY - config.stoneRadius < config.backLineY - 30) {
      newY = config.backLineY - 30 + config.stoneRadius;
      newVy = -newVy * config.restitution;
    }

    const speed = Math.sqrt(newVx * newVx + newVy * newVy);
    const isMoving = speed > 0.08;

    if (!isMoving) {
      newVx = 0;
      newVy = 0;
    }

    return {
      ...s,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      isMoving,
    };
  });

  for (let i = 0; i < updated.length; i++) {
    for (let j = i + 1; j < updated.length; j++) {
      const dist = distanceBetween(updated[i], updated[j]);
      if (dist < config.stoneRadius * 2) {
        const [a, b] = resolveCollision(updated[i], updated[j], config);
        updated[i] = a;
        updated[j] = b;
      }
    }
  }

  updated = updated.filter((s) => {
    if (s.isMoving) return true;
    return s.y < config.hogLineY + 50;
  });

  return updated;
}

export function isAnyStoneMoving(stones: Stone[]): boolean {
  return stones.some((s) => s.isMoving);
}

export function calculateScores(
  stones: Stone[],
  config: PhysicsConfig
): { red: number; yellow: number; closestTeam: 'red' | 'yellow' | null } {
  const center = config.houseCenter;
  const maxRadius = 60;

  const inHouse = stones
    .map((s) => ({
      ...s,
      distance: distanceBetween({ x: s.x, y: s.y }, center),
    }))
    .filter((s) => s.distance <= maxRadius)
    .sort((a, b) => a.distance - b.distance);

  if (inHouse.length === 0) {
    return { red: 0, yellow: 0, closestTeam: null };
  }

  const closestTeam = inHouse[0].team;
  let score = 0;

  for (const stone of inHouse) {
    if (stone.team === closestTeam) {
      score++;
    } else {
      break;
    }
  }

  return {
    red: closestTeam === 'red' ? score : 0,
    yellow: closestTeam === 'yellow' ? score : 0,
    closestTeam,
  };
}

export function getDistanceToCenter(stone: Stone, config: PhysicsConfig): number {
  return distanceBetween({ x: stone.x, y: stone.y }, config.houseCenter);
}

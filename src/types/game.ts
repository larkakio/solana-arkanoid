export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isMega: boolean;
  id: string;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  hits: number;
  hitsRequired: number;
  points: number;
  id: string;
}

export type BrickType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PowerUpType = "enlarge" | "laser" | "slow" | "catch" | "disruption" | "break" | "extraLife" | "mega";

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  width: number;
  height: number;
  id: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface LevelData {
  id: number;
  name: string;
  brickLayout: number[][];
  enemyCount: number;
  powerUpChance: number;
}

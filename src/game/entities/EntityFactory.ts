// 实体工厂 - 创建和重置实体的中心化管理

import {
  Player,
  Enemy,
  Projectile,
  Drop,
  Effect,
  FloatingText,
  EnemyType,
  ProjectileType,
  DropType,
  EffectType,
  FloatingTextType,
  Vector2,
} from '../types';
import {
  PLAYER_INITIAL_HEALTH,
  PLAYER_MOVE_SPEED,
  PLAYER_RADIUS,
  PLAYER_INITIAL_PICKUP_RADIUS,
  ENEMY_CONFIGS,
} from '../constants';

let nextId = 1;
function getId(): number {
  return nextId++;
}

// ==================== Player ====================
export function createPlayer(x: number, y: number): Player {
  return {
    position: { x, y },
    velocity: { x: 0, y: 0 },
    facing: { x: 1, y: 0 }, // 初始朝向右
    health: PLAYER_INITIAL_HEALTH,
    maxHealth: PLAYER_INITIAL_HEALTH,
    level: 1,
    exp: 0,
    expToNext: 10,
    radius: PLAYER_RADIUS,
    invulnerable: 0,
    moveSpeed: PLAYER_MOVE_SPEED,
    pickupRadius: PLAYER_INITIAL_PICKUP_RADIUS,
  };
}

// ==================== Enemy ====================
export function createEnemy(type: EnemyType, position: Vector2): Enemy {
  const config = ENEMY_CONFIGS[type];

  return {
    id: getId(),
    type,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    health: config.health,
    maxHealth: config.health,
    damage: config.damage,
    moveSpeed: config.moveSpeed,
    radius: config.radius,
    alive: true,
    attackCooldown: 0,
    ai: type === EnemyType.RANGED ? 'ranged' : type.startsWith('boss') ? 'boss' : 'chase',
  };
}

export function resetEnemy(enemy: Enemy): void {
  enemy.alive = false;
  enemy.health = 0;
  enemy.velocity.x = 0;
  enemy.velocity.y = 0;
  enemy.attackCooldown = 0;
  if (enemy.explodeTimer !== undefined) {
    enemy.explodeTimer = 0;
  }
}

// ==================== Projectile ====================
export function createProjectile(
  type: ProjectileType,
  position: Vector2,
  velocity: Vector2,
  damage: number,
  pierce: number,
  lifetime: number,
  owner: 'player' | 'enemy',
): Projectile {
  return {
    id: getId(),
    type,
    position: { ...position },
    velocity: { ...velocity },
    damage,
    radius: 5, // 默认半径
    pierce,
    lifetime,
    alive: true,
    owner,
  };
}

export function resetProjectile(proj: Projectile): void {
  proj.alive = false;
  proj.pierce = 0;
  proj.lifetime = 0;
  proj.velocity.x = 0;
  proj.velocity.y = 0;
}

// ==================== Effect ====================
export function createEffect(
  type: EffectType,
  position: Vector2,
  damage: number,
  radius: number,
  duration: number,
  tickInterval: number,
): Effect {
  return {
    id: getId(),
    type,
    position: { ...position },
    damage,
    radius,
    duration,
    tickInterval,
    lastTick: 0,
    alive: true,
  };
}

export function resetEffect(effect: Effect): void {
  effect.alive = false;
  effect.duration = 0;
  effect.lastTick = 0;
}

// ==================== Drop ====================
export function createDrop(type: DropType, position: Vector2, value: number): Drop {
  return {
    id: getId(),
    type,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    value,
    radius: 6,
    alive: true,
    magnetized: false,
  };
}

export function resetDrop(drop: Drop): void {
  drop.alive = false;
  drop.magnetized = false;
  drop.velocity.x = 0;
  drop.velocity.y = 0;
}

// ==================== FloatingText ====================
export function createFloatingText(
  type: FloatingTextType,
  text: string,
  position: Vector2,
  velocityY: number = -50,
): FloatingText {
  return {
    id: getId(),
    type,
    text,
    position: { ...position },
    velocity: { x: 0, y: velocityY },
    lifetime: 1000, // 1秒
    maxLifetime: 1000,
    alive: true,
  };
}

export function resetFloatingText(text: FloatingText): void {
  text.alive = false;
  text.lifetime = 0;
  text.velocity.x = 0;
  text.velocity.y = 0;
}

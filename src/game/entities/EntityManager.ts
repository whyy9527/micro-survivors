// 实体管理器 - 使用对象池管理所有游戏实体

import {
  Enemy,
  Projectile,
  Drop,
  Effect,
  FloatingText,
  EnemyType,
  ProjectileType,
  EffectType,
  DropType,
  FloatingTextType,
  Vector2,
} from '../types';
import { ObjectPool } from '../utils/ObjectPool';
import {
  createEnemy,
  createProjectile,
  createEffect,
  createDrop,
  createFloatingText,
  resetEnemy,
  resetProjectile,
  resetEffect,
  resetDrop,
  resetFloatingText,
} from './EntityFactory';

export class EntityManager {
  private enemyPool: ObjectPool<Enemy>;
  private projectilePool: ObjectPool<Projectile>;
  private effectPool: ObjectPool<Effect>;
  private dropPool: ObjectPool<Drop>;
  private floatingTextPool: ObjectPool<FloatingText>;

  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  effects: Effect[] = [];
  drops: Drop[] = [];
  floatingTexts: FloatingText[] = [];

  constructor() {
    // 初始化对象池
    this.enemyPool = new ObjectPool(() => createEnemy(EnemyType.ZOMBIE, { x: 0, y: 0 }), resetEnemy, 100);
    this.projectilePool = new ObjectPool(
      () => createProjectile(ProjectileType.DAGGER, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 0, 0, 'player'),
      resetProjectile,
      200,
    );
    this.effectPool = new ObjectPool(
      () => createEffect(EffectType.FIRE_CIRCLE, { x: 0, y: 0 }, 0, 0, 0, 0),
      resetEffect,
      50,
    );
    this.dropPool = new ObjectPool(() => createDrop(DropType.EXP_BLUE, { x: 0, y: 0 }, 0), resetDrop, 300);
    this.floatingTextPool = new ObjectPool(
      () => createFloatingText(FloatingTextType.DAMAGE, '', { x: 0, y: 0 }),
      resetFloatingText,
      50,
    );
  }

  // ==================== Enemy ====================
  spawnEnemy(type: EnemyType, position: Vector2): Enemy {
    const enemy = this.enemyPool.acquire();
    const config = ENEMY_CONFIGS[type];

    enemy.type = type;
    enemy.position.x = position.x;
    enemy.position.y = position.y;
    enemy.velocity.x = 0;
    enemy.velocity.y = 0;
    enemy.health = config.health;
    enemy.maxHealth = config.health;
    enemy.damage = config.damage;
    enemy.moveSpeed = config.moveSpeed;
    enemy.radius = config.radius;
    enemy.alive = true;
    enemy.attackCooldown = 0;
    enemy.ai = type === EnemyType.RANGED ? 'ranged' : type.startsWith('boss') ? 'boss' : 'chase';

    if (type === EnemyType.EXPLODER) {
      const exploderConfig = config as (typeof ENEMY_CONFIGS)[EnemyType.EXPLODER];
      enemy.explodeTimer = exploderConfig.explodeTime;
    }

    this.enemies.push(enemy);
    return enemy;
  }

  removeDeadEnemies(): void {
    const dead = this.enemies.filter((e) => !e.alive);
    this.enemies = this.enemies.filter((e) => e.alive);
    this.enemyPool.releaseAll(dead);
  }

  // ==================== Projectile ====================
  spawnProjectile(
    type: ProjectileType,
    position: Vector2,
    velocity: Vector2,
    damage: number,
    pierce: number,
    lifetime: number,
    owner: 'player' | 'enemy',
  ): Projectile {
    const proj = this.projectilePool.acquire();

    proj.type = type;
    proj.position.x = position.x;
    proj.position.y = position.y;
    proj.velocity.x = velocity.x;
    proj.velocity.y = velocity.y;
    proj.damage = damage;
    proj.pierce = pierce;
    proj.lifetime = lifetime;
    proj.owner = owner;
    proj.alive = true;
    proj.radius = 5;

    // 清除回旋镖专用字段（避免对象池复用时残留）
    proj.returnToOwner = undefined;
    proj.initialLifetime = undefined;
    proj.ownerPosition = undefined;

    this.projectiles.push(proj);
    return proj;
  }

  removeDeadProjectiles(): void {
    const dead = this.projectiles.filter((p) => !p.alive);
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.projectilePool.releaseAll(dead);
  }

  // ==================== Effect ====================
  spawnEffect(
    type: EffectType,
    position: Vector2,
    damage: number,
    radius: number,
    duration: number,
    tickInterval: number,
  ): Effect {
    const effect = this.effectPool.acquire();

    effect.type = type;
    effect.position.x = position.x;
    effect.position.y = position.y;
    effect.damage = damage;
    effect.radius = radius;
    effect.duration = duration;
    effect.tickInterval = tickInterval;
    effect.lastTick = 0;
    effect.alive = true;

    this.effects.push(effect);
    return effect;
  }

  removeDeadEffects(): void {
    const dead = this.effects.filter((e) => !e.alive);
    this.effects = this.effects.filter((e) => e.alive);
    this.effectPool.releaseAll(dead);
  }

  // ==================== Drop ====================
  spawnDrop(type: DropType, position: Vector2, value: number): Drop {
    const drop = this.dropPool.acquire();

    drop.type = type;
    drop.position.x = position.x;
    drop.position.y = position.y;
    drop.value = value;
    drop.alive = true;
    drop.magnetized = false;
    drop.velocity.x = 0;
    drop.velocity.y = 0;
    drop.radius = 6;

    this.drops.push(drop);
    return drop;
  }

  removeDeadDrops(): void {
    const dead = this.drops.filter((d) => !d.alive);
    this.drops = this.drops.filter((d) => d.alive);
    this.dropPool.releaseAll(dead);
  }

  // ==================== FloatingText ====================
  spawnFloatingText(type: FloatingTextType, text: string, position: Vector2, velocityY: number = -50): FloatingText {
    const floatingText = this.floatingTextPool.acquire();

    floatingText.type = type;
    floatingText.text = text;
    floatingText.position.x = position.x;
    floatingText.position.y = position.y;
    floatingText.velocity.x = 0;
    floatingText.velocity.y = velocityY;
    floatingText.lifetime = 1000;
    floatingText.maxLifetime = 1000;
    floatingText.alive = true;

    this.floatingTexts.push(floatingText);
    return floatingText;
  }

  removeDeadFloatingTexts(): void {
    const dead = this.floatingTexts.filter((t) => !t.alive);
    this.floatingTexts = this.floatingTexts.filter((t) => t.alive);
    this.floatingTextPool.releaseAll(dead);
  }

  // ==================== 清理 ====================
  clear(): void {
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.drops = [];
    this.floatingTexts = [];
    this.enemyPool.clear();
    this.projectilePool.clear();
    this.effectPool.clear();
    this.dropPool.clear();
    this.floatingTextPool.clear();
  }

  // ==================== 统计 ====================
  getStats(): {
    enemies: number;
    projectiles: number;
    effects: number;
    drops: number;
    floatingTexts: number;
  } {
    return {
      enemies: this.enemies.length,
      projectiles: this.projectiles.length,
      effects: this.effects.length,
      drops: this.drops.length,
      floatingTexts: this.floatingTexts.length,
    };
  }
}

// 导入配置（避免循环依赖）
import { ENEMY_CONFIGS } from '../constants';

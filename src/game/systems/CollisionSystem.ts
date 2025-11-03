// 碰撞检测系统 - 使用空间网格优化性能

import { Player, Enemy, Projectile, Drop, Effect } from '../types';
import { SpatialGrid } from '../utils/SpatialGrid';
import { circlesCollide } from '../utils/MathUtils';
import { GRID_CELL_SIZE } from '../constants';

export class CollisionSystem {
  private grid: SpatialGrid;

  constructor() {
    this.grid = new SpatialGrid(GRID_CELL_SIZE);
  }

  // ==================== 玩家 vs 敌人 ====================
  checkPlayerEnemyCollisions(player: Player, enemies: Enemy[]): Enemy[] {
    if (player.invulnerable > 0) {
      return [];
    }

    const hits: Enemy[] = [];
    this.grid.clear();
    this.grid.insertAll(enemies.map((e) => ({ x: e.position.x, y: e.position.y, radius: e.radius })));

    const nearby = this.grid.query({
      x: player.position.x,
      y: player.position.y,
      radius: player.radius,
    });

    for (let i = 0; i < nearby.length; i++) {
      const idx = enemies.findIndex((e) => e.position.x === nearby[i].x && e.position.y === nearby[i].y);
      if (idx !== -1 && enemies[idx].alive) {
        if (
          circlesCollide(
            { x: player.position.x, y: player.position.y, radius: player.radius },
            { x: enemies[idx].position.x, y: enemies[idx].position.y, radius: enemies[idx].radius },
          )
        ) {
          hits.push(enemies[idx]);
        }
      }
    }

    return hits;
  }

  // ==================== 弹体 vs 敌人 ====================
  checkProjectileEnemyCollisions(projectiles: Projectile[], enemies: Enemy[]): Map<number, Enemy[]> {
    const hits = new Map<number, Enemy[]>();

    this.grid.clear();
    this.grid.insertAll(enemies.map((e) => ({ x: e.position.x, y: e.position.y, radius: e.radius })));

    for (const proj of projectiles) {
      if (!proj.alive || proj.owner !== 'player') continue;

      const nearby = this.grid.query({
        x: proj.position.x,
        y: proj.position.y,
        radius: proj.radius,
      });

      const projHits: Enemy[] = [];

      for (let i = 0; i < nearby.length; i++) {
        const idx = enemies.findIndex((e) => e.position.x === nearby[i].x && e.position.y === nearby[i].y);
        if (idx !== -1 && enemies[idx].alive) {
          if (
            circlesCollide(
              { x: proj.position.x, y: proj.position.y, radius: proj.radius },
              {
                x: enemies[idx].position.x,
                y: enemies[idx].position.y,
                radius: enemies[idx].radius,
              },
            )
          ) {
            projHits.push(enemies[idx]);
          }
        }
      }

      if (projHits.length > 0) {
        hits.set(proj.id, projHits);
      }
    }

    return hits;
  }

  // ==================== 效果区域 vs 敌人 ====================
  checkEffectEnemyCollisions(effects: Effect[], enemies: Enemy[]): Map<number, Enemy[]> {
    const hits = new Map<number, Enemy[]>();

    for (const effect of effects) {
      if (!effect.alive) continue;

      const effectHits: Enemy[] = [];

      for (const enemy of enemies) {
        if (!enemy.alive) continue;

        if (
          circlesCollide(
            { x: effect.position.x, y: effect.position.y, radius: effect.radius },
            { x: enemy.position.x, y: enemy.position.y, radius: enemy.radius },
          )
        ) {
          effectHits.push(enemy);
        }
      }

      if (effectHits.length > 0) {
        hits.set(effect.id, effectHits);
      }
    }

    return hits;
  }

  // ==================== 敌方弹体 vs 玩家 ====================
  checkEnemyProjectilePlayerCollisions(projectiles: Projectile[], player: Player): Projectile[] {
    if (player.invulnerable > 0) {
      return [];
    }

    const hits: Projectile[] = [];

    for (const proj of projectiles) {
      if (!proj.alive || proj.owner !== 'enemy') continue;

      if (
        circlesCollide(
          { x: proj.position.x, y: proj.position.y, radius: proj.radius },
          { x: player.position.x, y: player.position.y, radius: player.radius },
        )
      ) {
        hits.push(proj);
      }
    }

    return hits;
  }

  // ==================== 玩家 vs 掉落物 ====================
  checkPlayerDropCollisions(player: Player, drops: Drop[]): Drop[] {
    const hits: Drop[] = [];

    for (const drop of drops) {
      if (!drop.alive) continue;

      if (
        circlesCollide(
          { x: player.position.x, y: player.position.y, radius: player.radius },
          { x: drop.position.x, y: drop.position.y, radius: drop.radius },
        )
      ) {
        hits.push(drop);
      }
    }

    return hits;
  }

  // ==================== 玩家拾取范围检测 ====================
  getDropsInRange(player: Player, drops: Drop[]): Drop[] {
    const inRange: Drop[] = [];

    for (const drop of drops) {
      if (!drop.alive || drop.magnetized) continue;

      if (
        circlesCollide(
          { x: player.position.x, y: player.position.y, radius: player.pickupRadius },
          { x: drop.position.x, y: drop.position.y, radius: drop.radius },
        )
      ) {
        inRange.push(drop);
      }
    }

    return inRange;
  }
}

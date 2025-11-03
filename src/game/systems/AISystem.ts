// AI系统 - 敌人寻路和行为逻辑

import { Enemy, Player, EnemyType } from '../types';
import { subtract, normalize, distance } from '../utils/MathUtils';
import { ENEMY_CONFIGS } from '../constants';

export class AISystem {
  // 更新所有敌人AI
  update(enemies: Enemy[], player: Player, deltaTime: number): void {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      switch (enemy.ai) {
        case 'chase':
          this.chaseAI(enemy, player);
          break;
        case 'ranged':
          this.rangedAI(enemy, player, deltaTime);
          break;
        case 'boss':
          this.bossAI(enemy, player, deltaTime);
          break;
      }

      // 自爆者特殊逻辑
      if (enemy.type === EnemyType.EXPLODER && enemy.explodeTimer !== undefined) {
        const distToPlayer = distance(enemy.position, player.position);
        if (distToPlayer < 100) {
          enemy.explodeTimer -= deltaTime;
          if (enemy.explodeTimer <= 0) {
            // 标记为待爆炸（由伤害系统处理）
            enemy.health = 0;
          }
        }
      }
    }
  }

  // 追踪AI - 直接朝玩家移动
  private chaseAI(enemy: Enemy, player: Player): void {
    const direction = subtract(player.position, enemy.position);
    const normalized = normalize(direction);

    enemy.velocity.x = normalized.x * enemy.moveSpeed;
    enemy.velocity.y = normalized.y * enemy.moveSpeed;
  }

  // 远程AI - 保持距离并攻击
  private rangedAI(enemy: Enemy, player: Player, deltaTime: number): void {
    const config = ENEMY_CONFIGS[EnemyType.RANGED];
    const keepDistance = (config as (typeof ENEMY_CONFIGS)[EnemyType.RANGED]).keepDistance;
    const distToPlayer = distance(enemy.position, player.position);

    if (distToPlayer > keepDistance) {
      // 靠近玩家
      const direction = subtract(player.position, enemy.position);
      const normalized = normalize(direction);
      enemy.velocity.x = normalized.x * enemy.moveSpeed;
      enemy.velocity.y = normalized.y * enemy.moveSpeed;
    } else if (distToPlayer < keepDistance - 50) {
      // 远离玩家
      const direction = subtract(enemy.position, player.position);
      const normalized = normalize(direction);
      enemy.velocity.x = -normalized.x * enemy.moveSpeed;
      enemy.velocity.y = -normalized.y * enemy.moveSpeed;
    } else {
      // 保持距离，横向移动
      const direction = subtract(player.position, enemy.position);
      const perpendicular = { x: -direction.y, y: direction.x };
      const normalized = normalize(perpendicular);
      enemy.velocity.x = normalized.x * enemy.moveSpeed * 0.5;
      enemy.velocity.y = normalized.y * enemy.moveSpeed * 0.5;
    }

    // 攻击冷却
    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown -= deltaTime;
    }
  }

  // Boss AI - 简单冲锋模式
  private bossAI(enemy: Enemy, player: Player, deltaTime: number): void {
    const direction = subtract(player.position, enemy.position);
    const normalized = normalize(direction);

    // Boss移动速度略快
    const speedMultiplier = 1.2;
    enemy.velocity.x = normalized.x * enemy.moveSpeed * speedMultiplier;
    enemy.velocity.y = normalized.y * enemy.moveSpeed * speedMultiplier;

    // Boss攻击冷却（用于特殊技能）
    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown -= deltaTime;
    }
  }

  // 应用速度限制（避免边界碰撞）
  applyBoundaries(enemies: Enemy[], worldWidth: number, worldHeight: number): void {
    const margin = 50;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      // 碰撞边界时反弹
      if (enemy.position.x < margin || enemy.position.x > worldWidth - margin) {
        enemy.velocity.x *= -0.5;
      }
      if (enemy.position.y < margin || enemy.position.y > worldHeight - margin) {
        enemy.velocity.y *= -0.5;
      }

      // 限制在边界内
      enemy.position.x = Math.max(margin, Math.min(worldWidth - margin, enemy.position.x));
      enemy.position.y = Math.max(margin, Math.min(worldHeight - margin, enemy.position.y));
    }
  }
}

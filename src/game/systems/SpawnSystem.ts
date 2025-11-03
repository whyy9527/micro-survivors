// 敌人生成系统 - 根据波次配置生成敌人

import { EntityManager } from '../entities/EntityManager';
import { EnemyType, Vector2 } from '../types';
import { WAVE_CONFIGS } from '../constants';
import { randomFloat, weightedChoice } from '../utils/MathUtils';

export class SpawnSystem {
  private entityManager: EntityManager;
  private spawnAccumulator = 0;
  private currentWaveIndex = 0;
  private bossSpawned = false;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  // 更新生成系统
  update(deltaTime: number, gameTime: number, cameraCenter: Vector2): void {
    // 找到当前波次
    const currentWave = this.getCurrentWave(gameTime);
    if (!currentWave) return;

    // Boss波次特殊处理
    if (
      (currentWave.enemyTypes[0]?.type === EnemyType.BOSS_1 || currentWave.enemyTypes[0]?.type === EnemyType.BOSS_2) &&
      !this.bossSpawned
    ) {
      this.spawnBoss(currentWave.enemyTypes[0].type, cameraCenter);
      this.bossSpawned = true;
      return;
    }

    // 检查是否达到敌人上限
    if (this.entityManager.enemies.length >= currentWave.maxEnemies) {
      return;
    }

    // 累积生成
    this.spawnAccumulator += (deltaTime / 1000) * currentWave.spawnRate;

    while (this.spawnAccumulator >= 1 && this.entityManager.enemies.length < currentWave.maxEnemies) {
      this.spawnAccumulator -= 1;

      // 随机选择敌人类型
      const types = currentWave.enemyTypes.map((t) => t.type);
      const weights = currentWave.enemyTypes.map((t) => t.weight);
      const enemyType = weightedChoice(types, weights);

      // 在屏幕外生成
      const spawnPos = this.getSpawnPosition(cameraCenter);
      this.entityManager.spawnEnemy(enemyType, spawnPos);
    }
  }

  // 获取当前波次配置
  private getCurrentWave(gameTime: number): (typeof WAVE_CONFIGS)[number] | null {
    for (let i = 0; i < WAVE_CONFIGS.length; i++) {
      const wave = WAVE_CONFIGS[i];
      if (gameTime >= wave.startTime && gameTime < wave.endTime) {
        // 波次切换时重置Boss标记
        if (i !== this.currentWaveIndex) {
          this.currentWaveIndex = i;
          this.bossSpawned = false;
        }
        return wave;
      }
    }
    return null;
  }

  // 在屏幕外环带生成
  private getSpawnPosition(cameraCenter: Vector2): Vector2 {
    const spawnDistance = 400; // 距离摄像机中心的距离

    const angle = randomFloat(0, Math.PI * 2);
    const distance = spawnDistance + randomFloat(-50, 50);

    return {
      x: cameraCenter.x + Math.cos(angle) * distance,
      y: cameraCenter.y + Math.sin(angle) * distance,
    };
  }

  // 生成Boss
  private spawnBoss(bossType: EnemyType, cameraCenter: Vector2): void {
    const angle = randomFloat(0, Math.PI * 2);
    const distance = 300;

    const pos = {
      x: cameraCenter.x + Math.cos(angle) * distance,
      y: cameraCenter.y + Math.sin(angle) * distance,
    };

    this.entityManager.spawnEnemy(bossType, pos);
    console.log(`Boss spawned: ${bossType}`);
  }

  // 重置系统
  reset(): void {
    this.spawnAccumulator = 0;
    this.currentWaveIndex = 0;
    this.bossSpawned = false;
  }
}

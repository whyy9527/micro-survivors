// 游戏引擎核心 - 固定时间步长的游戏循环

import { Player, GameStats, InputState, EnemyType, DropType, Vector2, UpgradeType, FloatingTextType } from './types';
import { EntityManager } from './entities/EntityManager';
import { CollisionSystem } from './systems/CollisionSystem';
import { SpawnSystem } from './systems/SpawnSystem';
import { AISystem } from './systems/AISystem';
import { WeaponSystem } from './systems/WeaponSystem';
import { TaskSystem } from './systems/TaskSystem';
import { calculateTalentBonuses, TalentBonus } from './systems/TalentApplicator';
import { createPlayer } from './entities/EntityFactory';
import {
  FIXED_DELTA_TIME,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_INVULNERABLE_TIME,
  PLAYER_MAX_HEALTH,
  PLAYER_MOVE_SPEED,
  PLAYER_INITIAL_PICKUP_RADIUS,
  EXP_BLUE,
  EXP_GREEN,
  EXP_RED,
  EXP_TO_LEVEL_BASE,
  EXP_TO_LEVEL_GROWTH,
  ENEMY_CONFIGS,
  MAX_ENEMIES_HIGH,
  MAX_ENEMIES_LOW,
  PERF_THRESHOLD_FPS,
} from './constants';
import { clamp } from './utils/MathUtils';

export class GameEngine {
  // 实体和系统
  private player: Player;
  private entityManager: EntityManager;
  private collisionSystem: CollisionSystem;
  private spawnSystem: SpawnSystem;
  private aiSystem: AISystem;
  private weaponSystem: WeaponSystem;
  private taskSystem: TaskSystem;

  // 天赋加成
  private talentBonuses: TalentBonus;

  // 游戏状态
  private gameTime = 0; // 游戏时间（秒）
  private accumulator = 0; // 时间累积器
  private stats: GameStats;
  private currentMaxEnemies = MAX_ENEMIES_HIGH;

  // 性能监控
  private fpsHistory: number[] = [];
  private lastFrameTime = 0;

  // 摄像机
  private camera: Vector2 = { x: 0, y: 0 };

  // Dev模式
  private isDev = false;

  constructor(tasks: typeof import('./constants').DEFAULT_TASKS, activeTalents: Record<string, number> = {}) {
    // 检查是否为dev模式
    this.isDev = window.location.search.includes('dev') || window.location.hash.includes('dev');

    // 计算天赋加成
    this.talentBonuses = calculateTalentBonuses(activeTalents);

    // 初始化玩家（应用天赋加成）
    this.player = this.createPlayerWithTalents();

    // 初始化系统
    this.entityManager = new EntityManager();
    this.collisionSystem = new CollisionSystem();
    this.spawnSystem = new SpawnSystem(this.entityManager);
    this.aiSystem = new AISystem();
    this.weaponSystem = new WeaponSystem(
      this.entityManager,
      (enemy, damage, isCrit) => this.damageEnemy(enemy, damage, isCrit),
      this.talentBonuses,
    );
    this.taskSystem = new TaskSystem(tasks.map((t) => ({ ...t })));

    // 给玩家添加初始武器（匕首）
    this.weaponSystem.addWeapon(UpgradeType.DAGGER, 1);

    // 初始化统计
    this.stats = {
      survivalTime: 0,
      killCount: 0,
      maxCombo: 0,
      damageDealt: 0,
      damageTaken: 0,
      expCollected: 0,
    };
  }

  private createPlayerWithTalents(): Player {
    const base = createPlayer(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    // 应用天赋加成
    const maxHealthWithTalents = PLAYER_MAX_HEALTH + this.talentBonuses.healthBonus;
    base.health = maxHealthWithTalents;
    base.maxHealth = maxHealthWithTalents;
    base.moveSpeed = PLAYER_MOVE_SPEED * this.talentBonuses.moveSpeedMultiplier;
    base.pickupRadius = PLAYER_INITIAL_PICKUP_RADIUS + this.talentBonuses.pickupRangeBonus;

    return base;
  }

  // ==================== 主循环 ====================
  update(deltaTime: number, input: InputState): { needsLevelUp: boolean } {
    // 性能监控
    this.updatePerformanceMetrics(deltaTime);

    // 固定时间步长更新
    this.accumulator += deltaTime;
    const fixedDelta = FIXED_DELTA_TIME;

    let needsLevelUp = false;

    while (this.accumulator >= fixedDelta) {
      this.accumulator -= fixedDelta;
      this.gameTime += fixedDelta / 1000;

      // 更新玩家
      this.updatePlayer(fixedDelta, input);

      // 更新拾取半径（天赋 + 技能奖励）
      this.player.pickupRadius =
        PLAYER_INITIAL_PICKUP_RADIUS + this.talentBonuses.pickupRangeBonus + this.weaponSystem.getPickupRadiusBonus();

      // 更新武器系统
      this.weaponSystem.update(fixedDelta, this.player);

      // 更新生成系统
      this.spawnSystem.update(fixedDelta, this.gameTime, this.camera);

      // 更新AI
      this.aiSystem.update(this.entityManager.enemies, this.player, fixedDelta);
      this.aiSystem.applyBoundaries(this.entityManager.enemies, WORLD_WIDTH, WORLD_HEIGHT);

      // 更新物理
      this.updatePhysics(fixedDelta);

      // 碰撞检测和伤害
      this.handleCollisions();

      // 掉落物磁化
      this.updateDropMagnetism();

      // 清理死亡实体
      this.cleanupDeadEntities();

      // 检查升级
      if (this.checkLevelUp()) {
        needsLevelUp = true;
      }

      // 更新任务
      this.taskSystem.update(fixedDelta);
      this.stats.survivalTime = this.gameTime;
    }

    // 更新摄像机
    this.updateCamera();

    return { needsLevelUp };
  }

  // ==================== 玩家更新 ====================
  private updatePlayer(deltaTime: number, input: InputState): void {
    // 更新无敌帧
    if (this.player.invulnerable > 0) {
      this.player.invulnerable -= deltaTime;
    }

    // 移动输入
    const moveX = input.moveX;
    const moveY = input.moveY;

    // 归一化移动向量
    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
    if (magnitude > 0) {
      this.player.velocity.x = (moveX / magnitude) * this.player.moveSpeed;
      this.player.velocity.y = (moveY / magnitude) * this.player.moveSpeed;
      // 更新朝向
      this.player.facing.x = moveX / magnitude;
      this.player.facing.y = moveY / magnitude;
    } else {
      this.player.velocity.x = 0;
      this.player.velocity.y = 0;
    }
  }

  // ==================== 物理更新 ====================
  private updatePhysics(deltaTime: number): void {
    const dt = deltaTime / 1000;

    // 更新玩家位置
    this.player.position.x += this.player.velocity.x * dt;
    this.player.position.y += this.player.velocity.y * dt;

    // 限制在世界边界内
    const margin = 50;
    this.player.position.x = clamp(this.player.position.x, margin, WORLD_WIDTH - margin);
    this.player.position.y = clamp(this.player.position.y, margin, WORLD_HEIGHT - margin);

    // 更新敌人位置
    for (const enemy of this.entityManager.enemies) {
      enemy.position.x += enemy.velocity.x * dt;
      enemy.position.y += enemy.velocity.y * dt;
    }

    // 更新弹体位置
    for (const proj of this.entityManager.projectiles) {
      // 回旋镖特殊处理：到达一半生命值时反向飞回
      if (proj.returnToOwner && proj.initialLifetime && proj.ownerPosition) {
        const halfLife = proj.initialLifetime / 2;
        if (proj.lifetime <= halfLife) {
          // 计算回归方向
          const dx = proj.ownerPosition.x - proj.position.x;
          const dy = proj.ownerPosition.y - proj.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // 如果回到主角附近，直接消失
          if (dist < 20) {
            proj.alive = false;
            continue;
          }

          if (dist > 0) {
            const speed = Math.sqrt(proj.velocity.x ** 2 + proj.velocity.y ** 2);
            proj.velocity.x = (dx / dist) * speed;
            proj.velocity.y = (dy / dist) * speed;
          }
        }
      }

      proj.position.x += proj.velocity.x * dt;
      proj.position.y += proj.velocity.y * dt;
      proj.lifetime -= deltaTime;
      if (proj.lifetime <= 0) {
        proj.alive = false;
      }
    }

    // 更新掉落物位置（磁化吸引）
    for (const drop of this.entityManager.drops) {
      if (drop.magnetized) {
        const dx = this.player.position.x - drop.position.x;
        const dy = this.player.position.y - drop.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const speed = 300;
          drop.velocity.x = (dx / dist) * speed;
          drop.velocity.y = (dy / dist) * speed;
        }
      }
      drop.position.x += drop.velocity.x * dt;
      drop.position.y += drop.velocity.y * dt;
    }

    // 更新效果持续时间
    for (const effect of this.entityManager.effects) {
      effect.duration -= deltaTime;
      if (effect.duration <= 0) {
        effect.alive = false;
      }
    }

    // 更新浮动文字
    for (const text of this.entityManager.floatingTexts) {
      text.position.x += text.velocity.x * dt;
      text.position.y += text.velocity.y * dt;
      text.lifetime -= deltaTime;
      if (text.lifetime <= 0) {
        text.alive = false;
      }
    }
  }

  // ==================== 碰撞处理 ====================
  private handleCollisions(): void {
    // 玩家 vs 敌人
    const enemyHits = this.collisionSystem.checkPlayerEnemyCollisions(this.player, this.entityManager.enemies);
    for (const enemy of enemyHits) {
      this.damagePlayer(enemy.damage);
    }

    // 弹体 vs 敌人
    const projHits = this.collisionSystem.checkProjectileEnemyCollisions(
      this.entityManager.projectiles,
      this.entityManager.enemies,
    );
    for (const [projId, enemies] of projHits) {
      const proj = this.entityManager.projectiles.find((p) => p.id === projId);
      if (!proj) continue;

      for (const enemy of enemies) {
        this.damageEnemy(enemy, proj.damage);
        proj.pierce--;
        if (proj.pierce < 0) {
          proj.alive = false;
          break;
        }
      }
    }

    // 效果 vs 敌人
    const effectHits = this.collisionSystem.checkEffectEnemyCollisions(
      this.entityManager.effects,
      this.entityManager.enemies,
    );
    for (const [effectId, enemies] of effectHits) {
      const effect = this.entityManager.effects.find((e) => e.id === effectId);
      if (!effect) continue;

      const now = Date.now();
      if (now - effect.lastTick >= effect.tickInterval) {
        effect.lastTick = now;
        for (const enemy of enemies) {
          this.damageEnemy(enemy, effect.damage);
        }
      }
    }

    // 敌方弹体 vs 玩家
    const enemyProjHits = this.collisionSystem.checkEnemyProjectilePlayerCollisions(
      this.entityManager.projectiles,
      this.player,
    );
    for (const proj of enemyProjHits) {
      this.damagePlayer(proj.damage);
      proj.alive = false;
    }

    // 玩家拾取掉落物
    const pickups = this.collisionSystem.checkPlayerDropCollisions(this.player, this.entityManager.drops);
    for (const drop of pickups) {
      this.collectDrop(drop);
    }
  }

  // ==================== 伤害计算 ====================
  private damagePlayer(damage: number): void {
    if (this.player.invulnerable > 0) return;

    // 闪避判定
    if (Math.random() < this.talentBonuses.dodgeChance) {
      // 生成闪避文字
      this.entityManager.spawnFloatingText(FloatingTextType.DODGE, '闪避!', this.player.position, -80);
      return; // 完全闪避
    }

    this.player.health -= damage;
    this.player.invulnerable = PLAYER_INVULNERABLE_TIME;
    this.stats.damageTaken += damage;
    this.taskSystem.onDamaged();

    if (this.player.health <= 0) {
      this.player.health = 0;
      // 游戏结束由外部处理
    }
  }

  private damageEnemy(enemy: (typeof this.entityManager.enemies)[0], damage: number, isCrit?: boolean): void {
    enemy.health -= damage;
    this.stats.damageDealt += damage;

    // 暴击视觉反馈
    if (isCrit) {
      this.entityManager.spawnFloatingText(FloatingTextType.CRIT, `暴击 ${damage.toFixed(0)}!`, enemy.position, -80);
    }

    if (enemy.health <= 0) {
      enemy.alive = false;
      this.stats.killCount++;
      this.taskSystem.onKill();

      // 生成掉落物
      this.spawnDrops(enemy);

      // 检查Boss击败
      if (enemy.type === EnemyType.BOSS_2) {
        this.taskSystem.onFinalBossDefeated();
      }
    }
  }

  // ==================== 掉落物 ====================
  private spawnDrops(enemy: (typeof this.entityManager.enemies)[0]): void {
    const config = ENEMY_CONFIGS[enemy.type];
    const expDrop = config.expDrop;

    // 生成经验球
    for (let i = 0; i < expDrop.blue; i++) {
      const offset = { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 };
      this.entityManager.spawnDrop(
        DropType.EXP_BLUE,
        { x: enemy.position.x + offset.x, y: enemy.position.y + offset.y },
        EXP_BLUE,
      );
    }
    for (let i = 0; i < expDrop.green; i++) {
      const offset = { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 };
      this.entityManager.spawnDrop(
        DropType.EXP_GREEN,
        { x: enemy.position.x + offset.x, y: enemy.position.y + offset.y },
        EXP_GREEN,
      );
    }
    for (let i = 0; i < expDrop.red; i++) {
      const offset = { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 };
      this.entityManager.spawnDrop(
        DropType.EXP_RED,
        { x: enemy.position.x + offset.x, y: enemy.position.y + offset.y },
        EXP_RED,
      );
    }

    // 随机掉落回血（5%概率）
    if (Math.random() < 0.05) {
      this.entityManager.spawnDrop(DropType.HEALTH, { ...enemy.position }, 1);
    }
  }

  private collectDrop(drop: (typeof this.entityManager.drops)[0]): void {
    drop.alive = false;

    switch (drop.type) {
      case DropType.EXP_BLUE:
      case DropType.EXP_GREEN:
      case DropType.EXP_RED: {
        // 应用天赋经验加成和 dev 模式加成
        const expValue = drop.value * this.talentBonuses.expMultiplier * (this.isDev ? 10 : 1);
        this.player.exp += expValue;
        this.stats.expCollected += expValue;
        break;
      }
      case DropType.HEALTH:
        this.player.health = Math.min(this.player.health + 1, this.player.maxHealth);
        break;
      case DropType.SHIELD:
        // TODO: 实现护盾逻辑
        break;
    }
  }

  private updateDropMagnetism(): void {
    const inRange = this.collisionSystem.getDropsInRange(this.player, this.entityManager.drops);
    for (const drop of inRange) {
      drop.magnetized = true;
    }
  }

  // ==================== 升级系统 ====================
  private checkLevelUp(): boolean {
    if (this.player.exp >= this.player.expToNext) {
      this.player.exp -= this.player.expToNext;
      this.player.level++;
      this.player.expToNext = Math.floor(EXP_TO_LEVEL_BASE * Math.pow(EXP_TO_LEVEL_GROWTH, this.player.level - 1));
      return true;
    }
    return false;
  }

  // ==================== 清理 ====================
  private cleanupDeadEntities(): void {
    this.entityManager.removeDeadEnemies();
    this.entityManager.removeDeadProjectiles();
    this.entityManager.removeDeadEffects();
    this.entityManager.removeDeadDrops();
    this.entityManager.removeDeadFloatingTexts();
  }

  // ==================== 摄像机 ====================
  private updateCamera(): void {
    this.camera.x = this.player.position.x;
    this.camera.y = this.player.position.y;
  }

  // ==================== 性能监控 ====================
  private updatePerformanceMetrics(deltaTime: number): void {
    const fps = 1000 / deltaTime;
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    // 每秒检查一次性能
    if (Date.now() - this.lastFrameTime > 1000) {
      this.lastFrameTime = Date.now();
      const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

      // 动态调整敌人上限
      if (avgFps < PERF_THRESHOLD_FPS) {
        if (this.currentMaxEnemies > MAX_ENEMIES_LOW) {
          this.currentMaxEnemies = Math.max(MAX_ENEMIES_LOW, this.currentMaxEnemies - 20);
          console.log(`Performance: Reduced max enemies to ${this.currentMaxEnemies}`);
        }
      } else if (avgFps > 55) {
        if (this.currentMaxEnemies < MAX_ENEMIES_HIGH) {
          this.currentMaxEnemies = Math.min(MAX_ENEMIES_HIGH, this.currentMaxEnemies + 10);
        }
      }
    }
  }

  // ==================== 公共接口 ====================
  getPlayer(): Player {
    return this.player;
  }

  getEntities(): {
    enemies: typeof this.entityManager.enemies;
    projectiles: typeof this.entityManager.projectiles;
    effects: typeof this.entityManager.effects;
    drops: typeof this.entityManager.drops;
    floatingTexts: typeof this.entityManager.floatingTexts;
  } {
    return {
      enemies: this.entityManager.enemies,
      projectiles: this.entityManager.projectiles,
      effects: this.entityManager.effects,
      drops: this.entityManager.drops,
      floatingTexts: this.entityManager.floatingTexts,
    };
  }

  getCamera(): Vector2 {
    return this.camera;
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  getGameTime(): number {
    return this.gameTime;
  }

  getWeaponSystem(): WeaponSystem {
    return this.weaponSystem;
  }

  getTaskSystem(): TaskSystem {
    return this.taskSystem;
  }

  isGameOver(): boolean {
    return this.player.health <= 0;
  }

  isVictory(): boolean {
    return this.gameTime >= 600; // 10分钟胜利
  }
}

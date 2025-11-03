// 武器系统 - 管理玩家武器触发和效果

import { Player, WeaponInstance, UpgradeType, ProjectileType, EffectType, Enemy } from '../types';
import { EntityManager } from '../entities/EntityManager';
import { WEAPON_CONFIGS, PASSIVE_CONFIGS } from '../constants';
import { fromAngle, rotateVector } from '../utils/MathUtils';
import { TalentBonus } from './TalentApplicator';

export class WeaponSystem {
  private entityManager: EntityManager;
  private weapons: WeaponInstance[] = [];
  private onDamageEnemy?: (enemy: Enemy, damage: number, isCrit?: boolean) => void;

  // 天赋加成
  private talentBonuses: TalentBonus;

  // 被动等级跟踪
  private passives: Record<string, number> = {};

  // 被动效果累积
  private critChance = 0;
  private critMultiplier = 1;
  private cooldownReduction = 0;
  private projectileCount = 0;
  private areaMultiplier = 1;
  private durationMultiplier = 1;
  private pickupRadiusBonus = 0;

  constructor(
    entityManager: EntityManager,
    onDamageEnemy?: (enemy: Enemy, damage: number, isCrit?: boolean) => void,
    talentBonuses?: TalentBonus,
  ) {
    this.entityManager = entityManager;
    this.onDamageEnemy = onDamageEnemy;

    // 初始化天赋加成（如果没传则使用空加成）
    this.talentBonuses = talentBonuses || this.createEmptyBonuses();
  }

  private createEmptyBonuses(): TalentBonus {
    return {
      healthBonus: 0,
      healthRegen: 0,
      dodgeChance: 0,
      damageMultiplier: 1,
      attackSpeedMultiplier: 1,
      critChanceBonus: 0,
      critMultiplierBonus: 0,
      pierceBonus: 0,
      areaMultiplier: 1,
      durationMultiplier: 1,
      projectileCountBonus: 0,
      expMultiplier: 1,
      pickupRangeBonus: 0,
      moveSpeedMultiplier: 1,
    };
  }

  // 添加武器
  addWeapon(type: UpgradeType, level: number): void {
    const config = WEAPON_CONFIGS[type];
    // 限制等级不超过maxLevel
    const clampedLevel = Math.min(level, config.maxLevel);

    const existing = this.weapons.find((w) => w.type === type);
    if (existing) {
      existing.level = clampedLevel;
      this.updateWeaponStats(existing);
    } else {
      const cooldown = config.levels[clampedLevel - 1].cooldown;
      this.weapons.push({
        type,
        level: clampedLevel,
        cooldown,
        cooldownTimer: 0,
      });
    }
  }

  // 更新武器属性
  private updateWeaponStats(weapon: WeaponInstance): void {
    const config = WEAPON_CONFIGS[weapon.type];
    weapon.cooldown = config.levels[weapon.level - 1].cooldown;
  }

  // 应用被动效果
  applyPassive(type: UpgradeType, level: number): void {
    const config = PASSIVE_CONFIGS[type];
    // 限制等级不超过maxLevel
    const clampedLevel = Math.min(level, config.maxLevel);

    this.passives[type] = clampedLevel;
    const stats = config.levels[clampedLevel - 1];

    switch (type) {
      case UpgradeType.CRIT:
        this.critChance = stats.critChance;
        this.critMultiplier = stats.critMultiplier;
        break;
      case UpgradeType.COOLDOWN:
        this.cooldownReduction = stats.reduction;
        break;
      case UpgradeType.PROJECTILE_COUNT:
        this.projectileCount = stats.count;
        break;
      case UpgradeType.AREA:
        this.areaMultiplier = stats.multiplier;
        break;
      case UpgradeType.DURATION:
        this.durationMultiplier = stats.multiplier;
        break;
      case UpgradeType.PICKUP_RADIUS:
        this.pickupRadiusBonus = stats.bonus;
        break;
    }
  }

  // 更新所有武器
  update(deltaTime: number, player: Player): void {
    // 光环特殊处理：每帧更新位置
    const auraWeapon = this.weapons.find((w) => w.type === UpgradeType.AURA);
    if (auraWeapon) {
      const config = WEAPON_CONFIGS[auraWeapon.type];
      const levelStats = config.levels[auraWeapon.level - 1];
      this.updateAura(player, levelStats);
    }

    for (const weapon of this.weapons) {
      weapon.cooldownTimer -= deltaTime;

      if (weapon.cooldownTimer <= 0) {
        this.fireWeapon(weapon, player);

        // 重置冷却（应用被动缩减 + 天赋加速）
        weapon.cooldownTimer =
          weapon.cooldown * (1 - this.cooldownReduction) * this.talentBonuses.attackSpeedMultiplier;
      }
    }
  }

  // 触发武器
  private fireWeapon(weapon: WeaponInstance, player: Player): void {
    const config = WEAPON_CONFIGS[weapon.type];
    // 防御性检查：确保level在有效范围内
    const safeLevel = Math.min(weapon.level, config.levels.length);
    const levelStats = config.levels[safeLevel - 1];

    if (!levelStats) {
      console.error(`Invalid level stats for ${weapon.type} at level ${weapon.level}`);
      return;
    }

    switch (weapon.type) {
      case UpgradeType.DAGGER:
        this.fireDagger(player, levelStats);
        break;
      case UpgradeType.WHIP:
        this.fireWhip(player, levelStats);
        break;
      case UpgradeType.HOLY_WATER:
        this.fireHolyWater(player, levelStats);
        break;
      case UpgradeType.LIGHTNING:
        this.fireLightning(player, levelStats);
        break;
      case UpgradeType.CROSS:
        this.fireCross(player, levelStats);
        break;
      case UpgradeType.AURA:
        this.updateAura(player, levelStats);
        break;
    }
  }

  // 匕首 - 朝移动方向发射
  private fireDagger(player: Player, stats: { damage: number; speed: number; count: number; pierce: number }): void {
    // 弹幕数量叠加（被动 + 天赋）
    const baseCount = stats.count + this.projectileCount + this.talentBonuses.projectileCountBonus;
    const direction = player.facing; // 使用玩家朝向

    const spreadAngle = 0.3; // 扇形角度

    for (let i = 0; i < baseCount; i++) {
      const angle = (i - (baseCount - 1) / 2) * spreadAngle;
      const dir = rotateVector(direction, angle);

      // 穿透叠加（基础 + 天赋）
      const finalPierce = stats.pierce + this.talentBonuses.pierceBonus;

      const { damage } = this.applyDamageModifiers(stats.damage);

      this.entityManager.spawnProjectile(
        ProjectileType.DAGGER,
        { ...player.position },
        { x: dir.x * stats.speed, y: dir.y * stats.speed },
        damage,
        finalPierce,
        2000,
        'player',
      );
    }
  }

  // 鞭子 - 左右横扫AOE
  private fireWhip(player: Player, stats: { damage: number; radius: number; duration: number }): void {
    // 范围叠加（被动 × 天赋）
    const radius = stats.radius * this.areaMultiplier * this.talentBonuses.areaMultiplier;
    // 持续叠加（被动 × 天赋）
    const duration = stats.duration * this.durationMultiplier * this.talentBonuses.durationMultiplier;

    const { damage } = this.applyDamageModifiers(stats.damage);

    // 左右两侧
    this.entityManager.spawnEffect(
      EffectType.WHIP,
      { x: player.position.x + radius, y: player.position.y },
      damage,
      radius,
      duration,
      100,
    );
    this.entityManager.spawnEffect(
      EffectType.WHIP,
      { x: player.position.x - radius, y: player.position.y },
      damage,
      radius,
      duration,
      100,
    );
  }

  // 圣水 - 随机落地火圈
  private fireHolyWater(
    player: Player,
    stats: { damage: number; radius: number; duration: number; count: number },
  ): void {
    // 范围叠加（被动 × 天赋）
    const radius = stats.radius * this.areaMultiplier * this.talentBonuses.areaMultiplier;
    // 持续叠加（被动 × 天赋）
    const duration = stats.duration * this.durationMultiplier * this.talentBonuses.durationMultiplier;

    const { damage } = this.applyDamageModifiers(stats.damage);

    for (let i = 0; i < stats.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 200 + 100;
      const pos = {
        x: player.position.x + Math.cos(angle) * distance,
        y: player.position.y + Math.sin(angle) * distance,
      };

      this.entityManager.spawnEffect(EffectType.FIRE_CIRCLE, pos, damage, radius, duration, 200);
    }
  }

  // 电弧 - 直接打到最近的敌人
  private fireLightning(player: Player, stats: { damage: number; targets: number; chain: number }): void {
    // 找到最近的敌人
    const enemies = this.entityManager.enemies
      .filter((e) => e.alive)
      .sort((a, b) => {
        const distA = Math.hypot(a.position.x - player.position.x, a.position.y - player.position.y);
        const distB = Math.hypot(b.position.x - player.position.x, b.position.y - player.position.y);
        return distA - distB;
      });

    // 对前N个敌人释放电弧
    const targetCount = Math.min(stats.targets, enemies.length);
    const damageResult = this.applyDamageModifiers(stats.damage);

    for (let i = 0; i < targetCount; i++) {
      const enemy = enemies[i];

      // 通过回调造成伤害（保持游戏逻辑完整性）
      if (this.onDamageEnemy) {
        this.onDamageEnemy(enemy, damageResult.damage, damageResult.isCrit);
      }

      // 创建视觉效果（不造成伤害，纯视觉）
      const effect = this.entityManager.spawnEffect(
        EffectType.LIGHTNING,
        { ...player.position },
        0, // 不造成伤害，只是视觉效果
        0, // 不需要碰撞检测
        300, // 持续0.3秒
        999999, // 不触发tick伤害
      );
      // 设置目标位置用于渲染
      effect.targetPosition = { ...enemy.position };
    }
  }

  // 回旋十字 - 往返飞行
  private fireCross(
    player: Player,
    stats: { damage: number; speed: number; count: number; pierce: number; lifetime: number },
  ): void {
    // 弹幕数量叠加（被动 + 天赋）
    const baseCount = stats.count + this.projectileCount + this.talentBonuses.projectileCountBonus;
    // 穿透叠加（基础 + 天赋）
    const finalPierce = stats.pierce + this.talentBonuses.pierceBonus;

    const { damage } = this.applyDamageModifiers(stats.damage);

    for (let i = 0; i < baseCount; i++) {
      const angle = (i / baseCount) * Math.PI * 2;
      const dir = fromAngle(angle);

      const proj = this.entityManager.spawnProjectile(
        ProjectileType.CROSS,
        { ...player.position },
        { x: dir.x * stats.speed, y: dir.y * stats.speed },
        damage,
        finalPierce,
        stats.lifetime,
        'player',
      );

      // 标记为返回型弹幕
      proj.returnToOwner = true;
      proj.initialLifetime = stats.lifetime;
      proj.ownerPosition = player.position;
    }
  }

  // 光环 - 持续存在的环形伤害
  private updateAura(player: Player, stats: { damage: number; radius: number; tickInterval: number }): void {
    // 范围叠加（被动 × 天赋）
    const radius = stats.radius * this.areaMultiplier * this.talentBonuses.areaMultiplier;

    // 检查是否已有光环，没有则创建
    const existingAura = this.entityManager.effects.find((e) => e.type === EffectType.AURA && e.alive);

    if (!existingAura) {
      const { damage } = this.applyDamageModifiers(stats.damage);
      this.entityManager.spawnEffect(
        EffectType.AURA,
        { ...player.position },
        damage,
        radius,
        999999, // 持续到游戏结束
        stats.tickInterval,
      );
    } else {
      // 更新光环位置跟随玩家
      existingAura.position.x = player.position.x;
      existingAura.position.y = player.position.y;
    }
  }

  // 应用伤害修正（全局伤害 + 暴击）
  private applyDamageModifiers(baseDamage: number): { damage: number; isCrit: boolean } {
    // 1. 应用天赋全局伤害加成
    let damage = baseDamage * this.talentBonuses.damageMultiplier;

    // 2. 暴击判定（被动 + 天赋叠加）
    const finalCritChance = this.critChance + this.talentBonuses.critChanceBonus;
    const finalCritMultiplier = this.critMultiplier + this.talentBonuses.critMultiplierBonus;

    const isCrit = Math.random() < finalCritChance;
    if (isCrit) {
      damage *= finalCritMultiplier;
    }

    return { damage, isCrit };
  }

  // 获取武器列表
  getWeapons(): WeaponInstance[] {
    return this.weapons;
  }

  // 获取被动列表
  getPassives(): Record<string, number> {
    return { ...this.passives };
  }

  // 获取拾取半径奖励
  getPickupRadiusBonus(): number {
    return this.pickupRadiusBonus;
  }

  // 重置
  reset(): void {
    this.weapons = [];
    this.passives = {};
    this.critChance = 0;
    this.critMultiplier = 1;
    this.cooldownReduction = 0;
    this.projectileCount = 0;
    this.areaMultiplier = 1;
    this.durationMultiplier = 1;
    this.pickupRadiusBonus = 0;
  }
}

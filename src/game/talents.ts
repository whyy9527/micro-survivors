// 天赋系统配置

export enum TalentId {
  // 生存系
  HEALTH_BOOST = 'health_boost',
  DODGE = 'dodge',

  // 攻击系
  DAMAGE_BOOST = 'damage_boost',
  ATTACK_SPEED = 'attack_speed',
  CRIT_BOOST = 'crit_boost',
  PIERCE_BOOST = 'pierce_boost',

  // 效果系
  AREA_BOOST = 'area_boost',
  DURATION_BOOST = 'duration_boost',
  PROJECTILE_BOOST = 'projectile_boost',

  // 资源系
  EXP_BOOST = 'exp_boost',
  PICKUP_RANGE = 'pickup_range',
  MOVEMENT_SPEED = 'movement_speed',
}

export interface TalentConfig {
  id: TalentId;
  name: string;
  description: string;
  maxLevel: number;
  icon: string;
  category: 'survival' | 'attack' | 'effect' | 'resource';
  requires?: TalentId[]; // 前置天赋
  effects: {
    // 每级的效果
    [level: number]: TalentEffect;
  };
}

export interface TalentEffect {
  // 玩家属性加成
  healthBonus?: number;
  healthRegen?: number; // 每秒回血
  dodgeChance?: number; // 闪避率

  // 攻击加成
  damageMultiplier?: number;
  attackSpeedMultiplier?: number;
  critChanceBonus?: number;
  critMultiplierBonus?: number;
  pierceBonus?: number;

  // 效果加成
  areaMultiplier?: number;
  durationMultiplier?: number;
  projectileCountBonus?: number;

  // 资源加成
  expMultiplier?: number;
  pickupRangeBonus?: number;
  moveSpeedMultiplier?: number;
}

// 天赋配置表
export const TALENT_CONFIGS: Record<TalentId, TalentConfig> = {
  // ==================== 生存系 ====================
  [TalentId.HEALTH_BOOST]: {
    id: TalentId.HEALTH_BOOST,
    name: '生命强化',
    description: '增加最大生命值',
    maxLevel: 5,
    icon: '❤️',
    category: 'survival',
    effects: {
      1: { healthBonus: 1 },
      2: { healthBonus: 2 },
      3: { healthBonus: 3 },
      4: { healthBonus: 5 },
      5: { healthBonus: 8 },
    },
  },

  [TalentId.DODGE]: {
    id: TalentId.DODGE,
    name: '闪避',
    description: '概率完全闪避敌人攻击',
    maxLevel: 3,
    icon: '💨',
    category: 'survival',
    effects: {
      1: { dodgeChance: 0.05 },
      2: { dodgeChance: 0.1 },
      3: { dodgeChance: 0.15 },
    },
  },

  // ==================== 攻击系 ====================
  [TalentId.DAMAGE_BOOST]: {
    id: TalentId.DAMAGE_BOOST,
    name: '伤害强化',
    description: '增加所有伤害',
    maxLevel: 5,
    icon: '⚔️',
    category: 'attack',
    effects: {
      1: { damageMultiplier: 1.1 },
      2: { damageMultiplier: 1.15 },
      3: { damageMultiplier: 1.25 },
      4: { damageMultiplier: 1.35 },
      5: { damageMultiplier: 1.5 },
    },
  },

  [TalentId.ATTACK_SPEED]: {
    id: TalentId.ATTACK_SPEED,
    name: '攻击速度',
    description: '减少武器冷却时间',
    maxLevel: 5,
    icon: '⚡',
    category: 'attack',
    effects: {
      1: { attackSpeedMultiplier: 0.95 },
      2: { attackSpeedMultiplier: 0.9 },
      3: { attackSpeedMultiplier: 0.85 },
      4: { attackSpeedMultiplier: 0.8 },
      5: { attackSpeedMultiplier: 0.75 },
    },
  },

  [TalentId.CRIT_BOOST]: {
    id: TalentId.CRIT_BOOST,
    name: '暴击精通',
    description: '增加暴击率和暴击伤害',
    maxLevel: 5,
    icon: '💥',
    category: 'attack',
    requires: [TalentId.DAMAGE_BOOST],
    effects: {
      1: { critChanceBonus: 0.05, critMultiplierBonus: 0.1 },
      2: { critChanceBonus: 0.08, critMultiplierBonus: 0.15 },
      3: { critChanceBonus: 0.12, critMultiplierBonus: 0.25 },
      4: { critChanceBonus: 0.16, critMultiplierBonus: 0.35 },
      5: { critChanceBonus: 0.2, critMultiplierBonus: 0.5 },
    },
  },

  [TalentId.PIERCE_BOOST]: {
    id: TalentId.PIERCE_BOOST,
    name: '穿透',
    description: '增加投射物穿透次数',
    maxLevel: 3,
    icon: '🎯',
    category: 'attack',
    requires: [TalentId.DAMAGE_BOOST],
    effects: {
      1: { pierceBonus: 1 },
      2: { pierceBonus: 2 },
      3: { pierceBonus: 3 },
    },
  },

  // ==================== 效果系 ====================
  [TalentId.AREA_BOOST]: {
    id: TalentId.AREA_BOOST,
    name: '范围扩大',
    description: '增加技能范围',
    maxLevel: 5,
    icon: '🔷',
    category: 'effect',
    effects: {
      1: { areaMultiplier: 1.1 },
      2: { areaMultiplier: 1.15 },
      3: { areaMultiplier: 1.25 },
      4: { areaMultiplier: 1.35 },
      5: { areaMultiplier: 1.5 },
    },
  },

  [TalentId.DURATION_BOOST]: {
    id: TalentId.DURATION_BOOST,
    name: '持续延长',
    description: '增加效果持续时间',
    maxLevel: 5,
    icon: '⏱️',
    category: 'effect',
    effects: {
      1: { durationMultiplier: 1.1 },
      2: { durationMultiplier: 1.15 },
      3: { durationMultiplier: 1.25 },
      4: { durationMultiplier: 1.35 },
      5: { durationMultiplier: 1.5 },
    },
  },

  [TalentId.PROJECTILE_BOOST]: {
    id: TalentId.PROJECTILE_BOOST,
    name: '投射增幅',
    description: '增加投射物数量',
    maxLevel: 3,
    icon: '🌟',
    category: 'effect',
    requires: [TalentId.AREA_BOOST],
    effects: {
      1: { projectileCountBonus: 1 },
      2: { projectileCountBonus: 2 },
      3: { projectileCountBonus: 3 },
    },
  },

  // ==================== 资源系 ====================
  [TalentId.EXP_BOOST]: {
    id: TalentId.EXP_BOOST,
    name: '经验加成',
    description: '增加获得的经验值',
    maxLevel: 5,
    icon: '✨',
    category: 'resource',
    effects: {
      1: { expMultiplier: 1.1 },
      2: { expMultiplier: 1.15 },
      3: { expMultiplier: 1.25 },
      4: { expMultiplier: 1.35 },
      5: { expMultiplier: 1.5 },
    },
  },

  [TalentId.PICKUP_RANGE]: {
    id: TalentId.PICKUP_RANGE,
    name: '拾取半径',
    description: '增加经验吸附范围',
    maxLevel: 5,
    icon: '🌀',
    category: 'resource',
    effects: {
      1: { pickupRangeBonus: 8 },
      2: { pickupRangeBonus: 18 },
      3: { pickupRangeBonus: 30 },
      4: { pickupRangeBonus: 45 },
      5: { pickupRangeBonus: 65 },
    },
  },

  [TalentId.MOVEMENT_SPEED]: {
    id: TalentId.MOVEMENT_SPEED,
    name: '移动速度',
    description: '增加移动速度',
    maxLevel: 5,
    icon: '🏃',
    category: 'resource',
    effects: {
      1: { moveSpeedMultiplier: 1.05 },
      2: { moveSpeedMultiplier: 1.1 },
      3: { moveSpeedMultiplier: 1.15 },
      4: { moveSpeedMultiplier: 1.2 },
      5: { moveSpeedMultiplier: 1.3 },
    },
  },
};

// 计算可用天赋点（基于已完成任务数）
export function calculateTalentPoints(completedTaskCount: number): number {
  return completedTaskCount;
}

// 计算可用天赋点（基于任务奖励点数总和）
export function calculateTalentPointsFromTasks(
  tasks: Array<{ completed: boolean; rewardTalentPoints: number }>,
): number {
  return tasks.filter((t) => t.completed).reduce((sum, task) => sum + task.rewardTalentPoints, 0);
}

// 检查天赋是否可解锁
export function canUnlockTalent(
  talentId: TalentId,
  currentLevel: number,
  activeTalents: Record<TalentId, number>,
): boolean {
  const config = TALENT_CONFIGS[talentId];

  // 检查是否达到最大等级
  if (currentLevel >= config.maxLevel) {
    return false;
  }

  // 检查前置天赋
  if (config.requires) {
    for (const requiredId of config.requires) {
      const requiredLevel = activeTalents[requiredId] || 0;
      if (requiredLevel === 0) {
        return false;
      }
    }
  }

  return true;
}

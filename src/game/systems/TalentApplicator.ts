// 天赋效果应用器

import { TalentId, TALENT_CONFIGS, TalentEffect } from '../talents';

export interface TalentBonus {
  // 玩家属性
  healthBonus: number;
  healthRegen: number;
  dodgeChance: number;

  // 攻击属性
  damageMultiplier: number;
  attackSpeedMultiplier: number;
  critChanceBonus: number;
  critMultiplierBonus: number;
  pierceBonus: number;

  // 效果属性
  areaMultiplier: number;
  durationMultiplier: number;
  projectileCountBonus: number;

  // 资源属性
  expMultiplier: number;
  pickupRangeBonus: number;
  moveSpeedMultiplier: number;
}

export function calculateTalentBonuses(activeTalents: Record<string, number>): TalentBonus {
  const bonuses: TalentBonus = {
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

  // 遍历所有激活的天赋
  for (const [talentIdStr, level] of Object.entries(activeTalents)) {
    const talentId = talentIdStr as TalentId;
    const config = TALENT_CONFIGS[talentId];
    if (!config) continue;

    // 应用天赋效果
    for (let i = 1; i <= level; i++) {
      const effect = config.effects[i];
      if (!effect) continue;

      applyEffect(bonuses, effect);
    }
  }

  return bonuses;
}

function applyEffect(bonuses: TalentBonus, effect: TalentEffect): void {
  // 玩家属性
  if (effect.healthBonus !== undefined) {
    bonuses.healthBonus += effect.healthBonus;
  }
  if (effect.healthRegen !== undefined) {
    bonuses.healthRegen += effect.healthRegen;
  }
  if (effect.dodgeChance !== undefined) {
    bonuses.dodgeChance = Math.max(bonuses.dodgeChance, effect.dodgeChance);
  }

  // 攻击属性（乘法效果累乘）
  if (effect.damageMultiplier !== undefined) {
    bonuses.damageMultiplier *= effect.damageMultiplier;
  }
  if (effect.attackSpeedMultiplier !== undefined) {
    bonuses.attackSpeedMultiplier *= effect.attackSpeedMultiplier;
  }
  if (effect.critChanceBonus !== undefined) {
    bonuses.critChanceBonus += effect.critChanceBonus;
  }
  if (effect.critMultiplierBonus !== undefined) {
    bonuses.critMultiplierBonus += effect.critMultiplierBonus;
  }
  if (effect.pierceBonus !== undefined) {
    bonuses.pierceBonus += effect.pierceBonus;
  }

  // 效果属性（乘法效果累乘）
  if (effect.areaMultiplier !== undefined) {
    bonuses.areaMultiplier *= effect.areaMultiplier;
  }
  if (effect.durationMultiplier !== undefined) {
    bonuses.durationMultiplier *= effect.durationMultiplier;
  }
  if (effect.projectileCountBonus !== undefined) {
    bonuses.projectileCountBonus += effect.projectileCountBonus;
  }

  // 资源属性
  if (effect.expMultiplier !== undefined) {
    bonuses.expMultiplier *= effect.expMultiplier;
  }
  if (effect.pickupRangeBonus !== undefined) {
    bonuses.pickupRangeBonus += effect.pickupRangeBonus;
  }
  if (effect.moveSpeedMultiplier !== undefined) {
    bonuses.moveSpeedMultiplier *= effect.moveSpeedMultiplier;
  }
}

// 升级面板 - 三选一升级卡片

import React from 'react';
import { Upgrade, UpgradeType } from '../types';
import { WEAPON_CONFIGS, PASSIVE_CONFIGS } from '../constants';

interface LevelUpPanelProps {
  options: Upgrade[];
  onSelect: (upgrade: UpgradeType) => void;
}

export const LevelUpPanel: React.FC<LevelUpPanelProps> = ({ options, onSelect }) => {
  const getUpgradeDetails = (upgrade: Upgrade): string => {
    const config = upgrade.isWeapon ? WEAPON_CONFIGS[upgrade.id] : PASSIVE_CONFIGS[upgrade.id];

    if (!config) return '';

    const level = upgrade.level;
    // 确保索引在有效范围内
    const levelIndex = Math.min(level - 1, config.levels.length - 1);
    const stats = config.levels[levelIndex];

    if (!stats) {
      console.error(`Invalid stats for ${upgrade.id} at level ${level}`);
      return '';
    }

    // 根据不同类型显示不同信息
    if (upgrade.isWeapon) {
      const weaponStats = stats as Record<string, number>;
      const parts: string[] = [];

      if (weaponStats.damage !== undefined) parts.push(`伤害: ${weaponStats.damage}`);
      if (weaponStats.cooldown !== undefined) parts.push(`冷却: ${(weaponStats.cooldown / 1000).toFixed(1)}s`);
      if (weaponStats.count !== undefined) parts.push(`数量: ${weaponStats.count}`);
      if (weaponStats.radius !== undefined) parts.push(`范围: ${weaponStats.radius}`);
      if (weaponStats.pierce !== undefined) parts.push(`穿透: ${weaponStats.pierce}`);
      if (weaponStats.targets !== undefined) parts.push(`目标: ${weaponStats.targets}`);

      return parts.join(' · ');
    } else {
      const passiveStats = stats as Record<string, number>;
      const parts: string[] = [];

      if (passiveStats.critChance !== undefined) parts.push(`暴击率: ${(passiveStats.critChance * 100).toFixed(0)}%`);
      if (passiveStats.critMultiplier !== undefined) parts.push(`暴击倍率: ${passiveStats.critMultiplier}x`);
      if (passiveStats.reduction !== undefined) parts.push(`冷却缩减: ${(passiveStats.reduction * 100).toFixed(0)}%`);
      if (passiveStats.count !== undefined) parts.push(`+${passiveStats.count} 投射物`);
      if (passiveStats.multiplier !== undefined) parts.push(`${(passiveStats.multiplier * 100).toFixed(0)}%`);
      if (passiveStats.bonus !== undefined) parts.push(`+${passiveStats.bonus}`);

      return parts.join(' · ');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-white mb-2">升级！</h2>
          <p className="text-xl text-gray-300">选择一项强化</p>
        </div>

        {/* 卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="group relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 hover:border-amber-400 hover:scale-105 transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/50">
              {/* 卡片装饰 */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* 等级标记 */}
              <div className="absolute top-3 right-3 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-amber-300">
                {option.level}
              </div>

              {/* 武器/被动标签 */}
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  option.isWeapon
                    ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                }`}>
                {option.isWeapon ? '武器' : '被动'}
              </div>

              {/* 名称 */}
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                {option.name}
              </h3>

              {/* 描述 */}
              <p className="text-sm text-gray-400 mb-4">{option.description}</p>

              {/* 属性详情 */}
              <div className="text-xs text-cyan-300 font-mono bg-black/30 rounded p-2 border border-cyan-500/30">
                {getUpgradeDetails(option)}
              </div>

              {/* 满级标记 */}
              {option.level >= option.maxLevel && (
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-purple-500/80 text-white text-xs rounded">
                  MAX
                </div>
              )}

              {/* 悬停光效 */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent rounded-xl transition-all pointer-events-none" />
            </button>
          ))}
        </div>

        {/* 提示 */}
        <div className="text-center mt-6 text-gray-500 text-sm">点击卡片选择升级</div>
      </div>
    </div>
  );
};

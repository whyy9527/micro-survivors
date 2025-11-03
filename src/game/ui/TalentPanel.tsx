// 天赋面板组件

import React, { useState, useCallback } from 'react';
import { TalentId, TALENT_CONFIGS, calculateTalentPointsFromTasks, canUnlockTalent } from '../talents';
import { Task } from '../types';

interface TalentPanelProps {
  tasks: Task[];
  activeTalents: Record<string, number>;
  onActivateTalent: (talentId: TalentId) => void;
  onResetTalents: () => void;
  onClose: () => void;
}

export const TalentPanel: React.FC<TalentPanelProps> = ({
  tasks,
  activeTalents,
  onActivateTalent,
  onResetTalents,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'survival' | 'attack' | 'effect' | 'resource'>('survival');

  // 计算可用天赋点
  const totalPoints = calculateTalentPointsFromTasks(tasks);
  const usedPoints = Object.values(activeTalents).reduce((sum, level) => sum + level, 0);
  const availablePoints = totalPoints - usedPoints;

  // 分类天赋
  const talentsByCategory = Object.values(TALENT_CONFIGS).filter((config) => config.category === selectedCategory);

  // 点击天赋
  const handleTalentClick = useCallback(
    (talentId: TalentId) => {
      const currentLevel = activeTalents[talentId] || 0;
      const config = TALENT_CONFIGS[talentId];

      // 检查是否可升级
      if (availablePoints <= 0) {
        return; // 没有天赋点
      }

      if (currentLevel >= config.maxLevel) {
        return; // 已满级
      }

      if (!canUnlockTalent(talentId, currentLevel, activeTalents)) {
        return; // 不满足前置条件
      }

      onActivateTalent(talentId);
    },
    [activeTalents, availablePoints, onActivateTalent],
  );

  const categoryColors = {
    survival: 'from-green-700 to-emerald-700',
    attack: 'from-red-700 to-orange-700',
    effect: 'from-purple-700 to-indigo-700',
    resource: 'from-cyan-700 to-blue-700',
  };

  const categoryNames = {
    survival: '🛡️ 生存',
    attack: '⚔️ 攻击',
    effect: '✨ 效果',
    resource: '💎 资源',
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full px-6 max-h-[90vh] overflow-y-auto">
        {/* 标题和点数 */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2">🌟 天赋树</h2>
          <div className="flex items-center justify-center gap-4 text-lg">
            <div className="text-cyan-400 font-semibold">
              可用点数: <span className="text-2xl text-white">{availablePoints}</span>
            </div>
            <div className="text-gray-400">已用: {usedPoints}</div>
            <div className="text-gray-400">总计: {totalPoints}</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">完成任务获得天赋点</p>
        </div>

        {/* 分类切换 */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {(Object.entries(categoryNames) as Array<[keyof typeof categoryNames, string]>).map(([cat, name]) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                selectedCategory === cat
                  ? `bg-gradient-to-r ${categoryColors[cat]} text-white`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              {name}
            </button>
          ))}
        </div>

        {/* 天赋卡片列表 */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {talentsByCategory.map((config) => {
              const currentLevel = activeTalents[config.id] || 0;
              const isMaxLevel = currentLevel >= config.maxLevel;
              const canUnlock = canUnlockTalent(config.id, currentLevel, activeTalents);
              const hasPoints = availablePoints > 0;
              const canActivate = !isMaxLevel && canUnlock && hasPoints;

              // 获取当前等级效果
              const effect = config.effects[currentLevel + 1];
              const effectText = effect
                ? Object.entries(effect)
                    .map(([key, value]) => {
                      if (key.includes('Multiplier')) {
                        return `${((value - 1) * 100).toFixed(0)}%`;
                      } else if (key.includes('Chance') || key.includes('armor')) {
                        return `${(value * 100).toFixed(0)}%`;
                      } else if (key.includes('Bonus') || key.includes('bonus')) {
                        return `+${value}`;
                      } else {
                        return `${value}`;
                      }
                    })
                    .join(' ')
                : '';

              return (
                <button
                  key={config.id}
                  onClick={() => handleTalentClick(config.id)}
                  disabled={!canActivate}
                  className={`text-left rounded-xl p-4 border-2 transition-all ${
                    isMaxLevel
                      ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-700 cursor-default'
                      : canActivate
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-cyan-600 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] cursor-pointer'
                      : 'bg-gray-900/50 border-gray-700 cursor-not-allowed opacity-50'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{config.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-white font-semibold">{config.name}</div>
                        <div className="text-sm text-cyan-400 font-bold">
                          {currentLevel}/{config.maxLevel}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{config.description}</div>

                      {/* 效果预览 */}
                      {!isMaxLevel && effect && (
                        <div className="text-sm text-green-400 font-semibold">下一级: {effectText}</div>
                      )}

                      {isMaxLevel && <div className="text-sm text-yellow-400 font-semibold">★ 已满级</div>}

                      {/* 前置要求 */}
                      {config.requires && config.requires.length > 0 && currentLevel === 0 && (
                        <div className="text-xs text-orange-400 mt-1">
                          需要: {config.requires.map((id) => TALENT_CONFIGS[id].name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full transition-all ${isMaxLevel ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                      style={{ width: `${(currentLevel / config.maxLevel) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onResetTalents}
            disabled={usedPoints === 0}
            className={`flex-1 font-bold text-lg py-4 px-6 rounded-xl transition-all ${
              usedPoints > 0
                ? 'bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}>
            🔄 重置天赋
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

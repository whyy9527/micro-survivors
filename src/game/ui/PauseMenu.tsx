// 暂停面板

import React from 'react';
import { WeaponInstance } from '../types';
import { WEAPON_CONFIGS } from '../constants';

interface PauseMenuProps {
  weapons: WeaponInstance[];
  onResume: () => void;
  onQuit: () => void;
  onViewTasks: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ weapons, onResume, onQuit, onViewTasks }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40">
      <div className="max-w-xl w-full px-6">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2">⏸ 暂停</h2>
        </div>

        {/* 当前构筑 */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 mb-4">
          <h3 className="text-xl font-bold text-white mb-4">⚔️ 当前构筑</h3>
          {weapons.length === 0 ? (
            <p className="text-gray-400 text-center py-4">暂无武器</p>
          ) : (
            <div className="space-y-2">
              {weapons.map((weapon) => {
                const config = WEAPON_CONFIGS[weapon.type];
                return (
                  <div
                    key={weapon.type}
                    className="bg-black/30 rounded-lg p-3 border border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {weapon.level}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{config.name}</div>
                        <div className="text-xs text-gray-400">{config.description}</div>
                      </div>
                    </div>
                    <div className="text-cyan-400 text-sm font-semibold">
                      Lv.{weapon.level}/{config.maxLevel}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 任务概览 */}
        <button
          onClick={onViewTasks}
          className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all duration-200 mb-4">
          📋 查看任务进度
        </button>

        {/* 按钮 */}
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xl py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
            ▶️ 继续游戏
          </button>
          <button
            onClick={onQuit}
            className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xl py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
            🚪 退出游戏
          </button>
        </div>

        {/* 提示 */}
        <div className="text-center mt-4 text-gray-500 text-sm">按空格键继续</div>
      </div>
    </div>
  );
};

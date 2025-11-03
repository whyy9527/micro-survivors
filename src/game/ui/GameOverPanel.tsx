// 游戏结束面板 - 胜利/失败展示

import React from 'react';
import { GameStats, Task } from '../types';

interface GameOverPanelProps {
  isVictory: boolean;
  stats: GameStats;
  tasks: Task[];
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverPanel: React.FC<GameOverPanelProps> = ({ isVictory, stats, tasks, onRestart, onMenu }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}分${secs}秒`;
  };

  const completedTasks = tasks.filter((t) => t.completed && !t.redeemed);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="max-w-2xl w-full px-6">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1
            className={`text-6xl font-bold mb-4 ${
              isVictory
                ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]'
                : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
            }`}>
            {isVictory ? '🎉 胜利！' : '💀 失败'}
          </h1>
          <p className="text-xl text-gray-300">{isVictory ? '你成功挺过了血夜！' : '你倒在了无尽的血夜中...'}</p>
        </div>

        {/* 统计面板 */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">战斗统计</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">生存时间</div>
              <div className="text-2xl font-bold text-cyan-400">{formatTime(stats.survivalTime)}</div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">击杀数</div>
              <div className="text-2xl font-bold text-red-400">{stats.killCount}</div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">造成伤害</div>
              <div className="text-2xl font-bold text-orange-400">{Math.floor(stats.damageDealt)}</div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">承受伤害</div>
              <div className="text-2xl font-bold text-purple-400">{Math.floor(stats.damageTaken)}</div>
            </div>
          </div>

          {/* 经验收集 */}
          <div className="mt-4 bg-black/30 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">经验收集</div>
            <div className="text-2xl font-bold text-blue-400">{stats.expCollected}</div>
          </div>
        </div>

        {/* 完成的任务 */}
        {completedTasks.length > 0 && (
          <div className="bg-gradient-to-b from-amber-900/50 to-amber-950/50 rounded-xl p-6 border-2 border-amber-600 mb-6">
            <h2 className="text-xl font-bold text-amber-300 mb-3 flex items-center gap-2">
              <span>🏆</span>
              <span>任务完成 ({completedTasks.length})</span>
            </h2>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-black/30 rounded-lg p-3 border border-amber-700/50 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{task.title}</div>
                    <div className="text-sm text-gray-400">{task.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full font-semibold">
                      {task.rewardTitle}
                    </div>
                    <div className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full font-semibold">
                      +{task.rewardTalentPoints}点
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex gap-4">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl">
            🔄 再来一局
          </button>
          <button
            onClick={onMenu}
            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
            📋 返回菜单
          </button>
        </div>
      </div>
    </div>
  );
};

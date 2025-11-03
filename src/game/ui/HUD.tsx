// HUD组件 - 游戏内顶部显示

import React from 'react';
import { Player, GameStats } from '../types';

interface HUDProps {
  player: Player;
  gameTime: number;
  stats: GameStats;
  activeTitle: string | null;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ player, gameTime, stats, activeTitle, onPause }) => {
  // 格式化时间 MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 经验百分比
  const expPercent = (player.exp / player.expToNext) * 100;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-10">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        {/* 左侧：玩家信息 */}
        <div className="space-y-2 pointer-events-auto">
          {/* 头像和称号 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg">
              {player.level}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Level {player.level}</div>
              {activeTitle && (
                <div className="px-2 py-0.5 bg-amber-500/80 text-white text-xs rounded-full border border-amber-300 shadow">
                  {activeTitle}
                </div>
              )}
            </div>
          </div>

          {/* 血量条 */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: player.maxHealth }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded ${
                    i < player.health ? 'bg-red-500' : 'bg-gray-700'
                  } border border-white/50`}>
                  {i < player.health && (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">♥</div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-white text-sm font-semibold">
              {player.health}/{player.maxHealth}
            </span>
          </div>
        </div>

        {/* 中间：时间和统计 */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white drop-shadow-lg">{formatTime(gameTime)}</div>
          <div className="text-sm text-gray-300 mt-1">击杀: {stats.killCount}</div>
        </div>

        {/* 右侧：暂停按钮 */}
        <button
          onClick={onPause}
          className="pointer-events-auto w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white text-xl transition-colors">
          ⏸
        </button>
      </div>

      {/* 经验条 */}
      <div className="px-4 pb-2">
        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/20">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
            style={{ width: `${expPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// 主菜单组件

import React from 'react';

interface MainMenuProps {
  onStart: () => void;
  onViewTasks: () => void;
  onViewTalents: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onViewTasks, onViewTalents }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-red-950 to-black flex items-center justify-center">
      <div className="text-center">
        {/* 标题 */}
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse">
          血夜幸存者
        </h1>
        <p className="text-2xl text-gray-400 mb-2">Micro Survivors</p>
        <p className="text-sm text-gray-500 mb-12">生存10分钟，击败无尽敌潮</p>

        {/* 按钮组 */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onStart}
            className="w-80 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xl py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]">
            ⚔️ 开始游戏
          </button>

          <button
            onClick={onViewTasks}
            className="w-80 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xl py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
            📋 任务 & 成就
          </button>

          <button
            onClick={onViewTalents}
            className="w-80 bg-gradient-to-r from-yellow-700 to-orange-700 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-xl py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
            🌟 天赋树
          </button>

          {/* 说明 */}
          <div className="mt-8 bg-black/50 rounded-xl p-6 w-80 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3 text-center">📖 游戏说明</h3>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>
                <span className="text-cyan-400">PC:</span> WASD/方向键移动，空格暂停
              </li>
              <li>
                <span className="text-cyan-400">移动:</span> 触控摇杆/键盘控制
              </li>
              <li>
                <span className="text-cyan-400">武器:</span> 自动攻击，升级强化
              </li>
              <li>
                <span className="text-cyan-400">目标:</span> 生存10分钟获得胜利
              </li>
              <li>
                <span className="text-cyan-400">任务:</span> 完成任务解锁称号
              </li>
            </ul>
          </div>
        </div>

        {/* 版本信息 */}
        <div className="mt-8 text-xs text-gray-600">v1.0.0 · Made with React + Canvas</div>
      </div>
    </div>
  );
};

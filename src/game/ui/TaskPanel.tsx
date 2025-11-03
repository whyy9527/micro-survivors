// 任务面板组件

import React from 'react';
import { Task } from '../types';

interface TaskPanelProps {
  tasks: Task[];
  onClose: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ tasks, onClose }) => {
  // 按奖励点数从小到大排序
  const sortedTasks = [...tasks].sort((a, b) => a.rewardTalentPoints - b.rewardTalentPoints);
  const completedTasks = sortedTasks.filter((t) => t.completed);
  const inProgressTasks = sortedTasks.filter((t) => !t.completed);
  const totalCompleted = completedTasks.length;
  const totalTasks = tasks.length;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="max-w-2xl w-full px-6 max-h-[90vh] overflow-y-auto">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2">📋 任务 & 成就</h2>
          <p className="text-gray-400">
            已完成 {totalCompleted} / {totalTasks}
          </p>
        </div>

        {/* 进行中的任务 */}
        {inProgressTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 进行中</h3>
            <div className="space-y-3">
              {inProgressTasks.map((task) => {
                const progressPercent = Math.min((task.progress / task.goal) * 100, 100);
                return (
                  <div
                    key={task.id}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-white font-semibold text-lg">{task.title}</div>
                          <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full font-bold">
                            +{task.rewardTalentPoints}点
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{task.description}</div>
                        <div className="text-xs text-cyan-400 mt-2">奖励称号: {task.rewardTitle}</div>
                      </div>
                    </div>
                    {/* 进度条 */}
                    <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-400 mt-2 text-right">
                      {Math.floor(task.progress)} / {task.goal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 已完成的任务 */}
        {completedTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">✅ 已完成</h3>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border-2 border-green-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-semibold text-lg">{task.title}</div>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">完成</span>
                        <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full font-bold">
                          +{task.rewardTalentPoints}点
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{task.description}</div>
                      <div className="text-xs text-green-400 mt-2">已获得称号: {task.rewardTitle}</div>
                    </div>
                  </div>
                  <div className="w-full bg-green-700 rounded-full h-2 mt-3">
                    <div className="h-2 rounded-full bg-green-500 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 关闭按钮 */}
        <div className="mt-6 mb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xl py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

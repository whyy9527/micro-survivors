// 任务追踪系统 - 实时更新任务进度

import { Task } from '../types';

export class TaskSystem {
  private tasks: Task[];

  // 追踪变量
  private survivalTime = 0;
  private noDamageTime = 0;
  private killWindowStart = 0;
  private killWindowCount = 0;
  private totalKills = 0;

  constructor(tasks: Task[]) {
    this.tasks = tasks;
  }

  // 更新任务进度
  update(deltaTime: number): void {
    this.survivalTime += deltaTime / 1000;
    this.noDamageTime += deltaTime / 1000;

    // 更新生存时间任务
    this.updateTask('survive_5min', this.survivalTime);

    // 更新无伤任务
    this.updateTask('no_damage_90s', this.noDamageTime);

    // 更新连杀窗口（10秒窗口）
    if (Date.now() - this.killWindowStart > 10000) {
      this.killWindowCount = 0;
      this.killWindowStart = Date.now();
    }
  }

  // 记录击杀
  onKill(count = 1): void {
    this.totalKills += count;
    this.killWindowCount += count;

    // 更新累计击杀任务
    this.updateTask('kill_500', this.totalKills);

    // 更新连杀任务
    this.updateTask('kill_80_in_10s', this.killWindowCount);
  }

  // 记录受伤
  onDamaged(): void {
    this.noDamageTime = 0;
  }

  // 记录武器升到满级
  onWeaponMaxLevel(): void {
    this.updateTask('max_weapon', 1);
  }

  // 记录击败终局Boss
  onFinalBossDefeated(): void {
    this.updateTask('defeat_final_boss', 1);
  }

  // 更新指定任务进度
  private updateTask(taskId: string, progress: number): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      task.progress = Math.max(task.progress, progress);
      if (task.progress >= task.goal) {
        task.completed = true;
      }
    }
  }

  // 获取所有任务
  getTasks(): Task[] {
    return this.tasks;
  }

  // 获取已完成但未兑换的任务
  getCompletedUnredeemedTasks(): Task[] {
    return this.tasks.filter((t) => t.completed && !t.redeemed);
  }

  // 兑换任务
  redeemTask(taskId: string): boolean {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && task.completed && !task.redeemed) {
      task.redeemed = true;
      return true;
    }
    return false;
  }

  // 重置（用于新游戏）
  reset(): void {
    this.survivalTime = 0;
    this.noDamageTime = 0;
    this.killWindowStart = Date.now();
    this.killWindowCount = 0;
    this.totalKills = 0;
  }
}

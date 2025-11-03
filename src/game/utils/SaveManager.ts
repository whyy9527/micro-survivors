import { SaveData, Task, Title } from '../types';
import { SAVE_KEY, SCHEMA_VERSION, DEFAULT_TASKS } from '../constants';

// 加载存档
export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return createDefaultSave();
    }

    const data = JSON.parse(raw) as SaveData;

    // 版本校验与迁移
    if (data.schemaVersion !== SCHEMA_VERSION) {
      console.warn('Save schema version mismatch, migrating...');
      return migrateSave(data);
    }

    // 补齐缺失字段
    return ensureFields(data);
  } catch (error) {
    console.error('Failed to load save:', error);
    return createDefaultSave();
  }
}

// 保存存档
export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save:', error);
  }
}

// 创建默认存档
function createDefaultSave(): SaveData {
  return {
    schemaVersion: SCHEMA_VERSION,
    tasks: DEFAULT_TASKS.map((t) => ({ ...t })),
    titles: [],
    activeTitle: null,
    activeTalents: {}, // 初始无天赋
    highScore: {
      survivalTime: 0,
      killCount: 0,
      maxCombo: 0,
    },
    settings: {
      soundEnabled: true,
      lowPerfMode: false,
    },
  };
}

// 版本迁移
function migrateSave(data: Partial<SaveData>): SaveData {
  const newSave = createDefaultSave();

  // 保留已有数据
  if (data.tasks) {
    newSave.tasks = mergeTasks(data.tasks, DEFAULT_TASKS);
  }
  if (data.titles) {
    newSave.titles = data.titles;
  }
  if (data.activeTitle) {
    newSave.activeTitle = data.activeTitle;
  }
  if (data.activeTalents) {
    newSave.activeTalents = data.activeTalents;
  }
  if (data.highScore) {
    newSave.highScore = { ...data.highScore };
  }
  if (data.settings) {
    newSave.settings = { ...newSave.settings, ...data.settings };
  }

  return newSave;
}

// 合并任务列表（保留进度，补充新任务）
function mergeTasks(oldTasks: Task[], defaultTasks: Task[]): Task[] {
  const taskMap = new Map(oldTasks.map((t) => [t.id, t]));

  return defaultTasks.map((defTask) => {
    const existing = taskMap.get(defTask.id);
    if (existing) {
      // 合并已有任务，保留进度但更新配置（如新增的 rewardTalentPoints）
      return {
        ...defTask,
        progress: existing.progress,
        completed: existing.completed,
        redeemed: existing.redeemed,
      };
    }
    return { ...defTask };
  });
}

// 确保所有字段存在
function ensureFields(data: SaveData): SaveData {
  const defaults = createDefaultSave();

  return {
    schemaVersion: data.schemaVersion || defaults.schemaVersion,
    tasks: data.tasks || defaults.tasks,
    titles: data.titles || defaults.titles,
    activeTitle: data.activeTitle !== undefined ? data.activeTitle : defaults.activeTitle,
    activeTalents: data.activeTalents || {},
    highScore: {
      survivalTime: data.highScore?.survivalTime || 0,
      killCount: data.highScore?.killCount || 0,
      maxCombo: data.highScore?.maxCombo || 0,
    },
    settings: {
      soundEnabled: data.settings?.soundEnabled !== undefined ? data.settings.soundEnabled : true,
      lowPerfMode: data.settings?.lowPerfMode || false,
    },
  };
}

// 更新任务进度
export function updateTaskProgress(tasks: Task[], taskId: string, progress: number): Task[] {
  return tasks.map((task) => {
    if (task.id === taskId) {
      const newProgress = Math.max(task.progress, progress);
      return {
        ...task,
        progress: newProgress,
        completed: newProgress >= task.goal,
      };
    }
    return task;
  });
}

// 兑换任务奖励
export function redeemTask(
  tasks: Task[],
  titles: Title[],
  taskId: string,
): { tasks: Task[]; titles: Title[]; newTitle: string | null } {
  const task = tasks.find((t) => t.id === taskId);
  if (!task || !task.completed || task.redeemed) {
    return { tasks, titles, newTitle: null };
  }

  const newTasks = tasks.map((t) => (t.id === taskId ? { ...t, redeemed: true } : t));

  const titleExists = titles.some((t) => t.id === task.rewardTitle);
  const newTitles = titleExists
    ? titles
    : [...titles, { id: task.rewardTitle, name: task.rewardTitle, unlocked: true }];

  return { tasks: newTasks, titles: newTitles, newTitle: task.rewardTitle };
}

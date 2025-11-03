import { EnemyType, UpgradeType, WaveConfig } from './types';

// ==================== 世界配置 ====================
export const WORLD_WIDTH = 4000; // 从2000扩大到4000
export const WORLD_HEIGHT = 4000; // 从2000扩大到4000
export const GRID_CELL_SIZE = 100;

// ==================== 性能配置 ====================
export const TARGET_FPS = 60;
export const FIXED_DELTA_TIME = 1000 / 60; // 16.67ms
export const MAX_ENEMIES_HIGH = 300;
export const MAX_ENEMIES_MED = 220;
export const MAX_ENEMIES_LOW = 180;
export const PERF_THRESHOLD_FPS = 45;

// ==================== 玩家配置 ====================
export const PLAYER_INITIAL_HEALTH = 5; // 从3增加到5
export const PLAYER_MAX_HEALTH = 10;
export const PLAYER_MOVE_SPEED = 150; // 从120增加到150
export const PLAYER_RADIUS = 16;
export const PLAYER_INVULNERABLE_TIME = 1000; // 从600ms增加到1000ms
export const PLAYER_INITIAL_PICKUP_RADIUS = 80; // 从50增加到80

// ==================== 经验配置 ====================
export const EXP_BLUE = 1;
export const EXP_GREEN = 5;
export const EXP_RED = 25;
export const EXP_TO_LEVEL_BASE = 10;
export const EXP_TO_LEVEL_GROWTH = 1.2;

// ==================== 敌人配置 ====================
export const ENEMY_CONFIGS = {
  [EnemyType.ZOMBIE]: {
    health: 10,
    damage: 1,
    moveSpeed: 40,
    radius: 14,
    expDrop: { blue: 3, green: 0, red: 0 },
  },
  [EnemyType.RUNNER]: {
    health: 5,
    damage: 1,
    moveSpeed: 90,
    radius: 12,
    expDrop: { blue: 2, green: 0, red: 0 },
  },
  [EnemyType.GIANT]: {
    health: 40,
    damage: 2,
    moveSpeed: 30,
    radius: 24,
    expDrop: { blue: 5, green: 1, red: 0 },
  },
  [EnemyType.EXPLODER]: {
    health: 8,
    damage: 3,
    moveSpeed: 50,
    radius: 13,
    expDrop: { blue: 4, green: 0, red: 0 },
    explodeRadius: 60,
    explodeTime: 1000, // 1s后爆炸
  },
  [EnemyType.RANGED]: {
    health: 12,
    damage: 1,
    moveSpeed: 35,
    radius: 13,
    expDrop: { blue: 3, green: 1, red: 0 },
    attackCooldown: 2000,
    keepDistance: 200,
  },
  [EnemyType.BOSS_1]: {
    health: 500,
    damage: 2,
    moveSpeed: 60,
    radius: 40,
    expDrop: { blue: 0, green: 0, red: 10 },
  },
  [EnemyType.BOSS_2]: {
    health: 1000,
    damage: 3,
    moveSpeed: 50,
    radius: 50,
    expDrop: { blue: 0, green: 0, red: 20 },
  },
};

// ==================== 波次配置 ====================
export const WAVE_CONFIGS: WaveConfig[] = [
  // 0-60s: 行尸为主
  {
    startTime: 0,
    endTime: 60,
    spawnRate: 2,
    enemyTypes: [{ type: EnemyType.ZOMBIE, weight: 1 }],
    maxEnemies: 30,
  },
  // 60-180s: 加入疾奔者
  {
    startTime: 60,
    endTime: 180,
    spawnRate: 3,
    enemyTypes: [
      { type: EnemyType.ZOMBIE, weight: 0.7 },
      { type: EnemyType.RUNNER, weight: 0.3 },
    ],
    maxEnemies: 50,
  },
  // 180-300s: 加入自爆者
  {
    startTime: 180,
    endTime: 300,
    spawnRate: 3.5, // 提升刷新率增加压力
    enemyTypes: [
      { type: EnemyType.ZOMBIE, weight: 0.5 },
      { type: EnemyType.RUNNER, weight: 0.3 },
      { type: EnemyType.EXPLODER, weight: 0.2 },
    ],
    maxEnemies: 100, // 增加最大数量
  },
  // 300s: Boss 1 (单独波次，生成后暂停其他生成)
  {
    startTime: 300,
    endTime: 301,
    spawnRate: 0,
    enemyTypes: [{ type: EnemyType.BOSS_1, weight: 1 }],
    maxEnemies: 1,
  },
  // 301-420s: 巨尸成群
  {
    startTime: 301,
    endTime: 420,
    spawnRate: 5, // 中期大幅提升刷新率
    enemyTypes: [
      { type: EnemyType.ZOMBIE, weight: 0.4 },
      { type: EnemyType.RUNNER, weight: 0.2 },
      { type: EnemyType.GIANT, weight: 0.3 },
      { type: EnemyType.EXPLODER, weight: 0.1 },
    ],
    maxEnemies: 160, // 增加最大数量制造压力
  },
  // 420-540s: 加入远程
  {
    startTime: 420,
    endTime: 540,
    spawnRate: 6.5, // 后期高强度刷新
    enemyTypes: [
      { type: EnemyType.ZOMBIE, weight: 0.3 },
      { type: EnemyType.RUNNER, weight: 0.2 },
      { type: EnemyType.GIANT, weight: 0.2 },
      { type: EnemyType.RANGED, weight: 0.2 },
      { type: EnemyType.EXPLODER, weight: 0.1 },
    ],
    maxEnemies: 200, // 大幅增加同屏敌人数
  },
  // 540-570s: 精英潮 (30秒高压)
  {
    startTime: 540,
    endTime: 570,
    spawnRate: 9, // 精英潮极高刷新率
    enemyTypes: [
      { type: EnemyType.RUNNER, weight: 0.4 },
      { type: EnemyType.GIANT, weight: 0.3 },
      { type: EnemyType.RANGED, weight: 0.2 },
      { type: EnemyType.EXPLODER, weight: 0.1 },
    ],
    maxEnemies: 250, // 接近性能上限制造极限压力
  },
  // 570-600s: 缓和期
  {
    startTime: 570,
    endTime: 600,
    spawnRate: 5.5, // 缓和期仍保持较高压力
    enemyTypes: [
      { type: EnemyType.ZOMBIE, weight: 0.5 },
      { type: EnemyType.RUNNER, weight: 0.3 },
      { type: EnemyType.GIANT, weight: 0.2 },
    ],
    maxEnemies: 180, // 增加数量维持节奏
  },
  // 600s: Boss 2
  {
    startTime: 600,
    endTime: 601,
    spawnRate: 0,
    enemyTypes: [{ type: EnemyType.BOSS_2, weight: 1 }],
    maxEnemies: 1,
  },
];

// ==================== 武器配置 ====================
export const WEAPON_CONFIGS = {
  [UpgradeType.DAGGER]: {
    name: '匕首',
    description: '朝移动方向发射快速弹体',
    maxLevel: 5,
    levels: [
      { damage: 8, cooldown: 800, count: 1, speed: 350, pierce: 1 }, // 增强初始数值
      { damage: 12, cooldown: 700, count: 2, speed: 350, pierce: 1 },
      { damage: 16, cooldown: 600, count: 2, speed: 400, pierce: 2 },
      { damage: 22, cooldown: 500, count: 3, speed: 400, pierce: 2 },
      { damage: 30, cooldown: 400, count: 3, speed: 450, pierce: 3 },
    ],
  },
  [UpgradeType.WHIP]: {
    name: '鞭子',
    description: '左右横扫清理贴身敌人',
    maxLevel: 5,
    levels: [
      { damage: 8, cooldown: 1200, radius: 60, duration: 300 },
      { damage: 12, cooldown: 1100, radius: 70, duration: 350 },
      { damage: 16, cooldown: 1000, radius: 80, duration: 400 },
      { damage: 22, cooldown: 900, radius: 90, duration: 450 },
      { damage: 30, cooldown: 800, radius: 100, duration: 500 },
    ],
  },
  [UpgradeType.HOLY_WATER]: {
    name: '圣水',
    description: '随机落地生成火圈',
    maxLevel: 5,
    levels: [
      { damage: 3, cooldown: 2000, radius: 50, duration: 2000, count: 1 },
      { damage: 4, cooldown: 1900, radius: 60, duration: 2500, count: 1 },
      { damage: 5, cooldown: 1800, radius: 70, duration: 3000, count: 2 },
      { damage: 7, cooldown: 1700, radius: 80, duration: 3500, count: 2 },
      { damage: 10, cooldown: 1500, radius: 90, duration: 4000, count: 3 },
    ],
  },
  [UpgradeType.LIGHTNING]: {
    name: '电弧',
    description: '随机击中屏幕内敌人',
    maxLevel: 5,
    levels: [
      { damage: 8, cooldown: 2500, targets: 1, chain: 0 },
      { damage: 12, cooldown: 2300, targets: 2, chain: 0 },
      { damage: 16, cooldown: 2100, targets: 3, chain: 1 },
      { damage: 22, cooldown: 1900, targets: 4, chain: 1 },
      { damage: 30, cooldown: 1700, targets: 5, chain: 2 },
    ],
  },
  [UpgradeType.CROSS]: {
    name: '回旋十字',
    description: '往返飞行的穿透弹体',
    maxLevel: 5,
    levels: [
      { damage: 10, cooldown: 1500, count: 1, speed: 200, pierce: 2, lifetime: 3000 },
      { damage: 14, cooldown: 1400, count: 1, speed: 220, pierce: 3, lifetime: 3500 },
      { damage: 18, cooldown: 1300, count: 2, speed: 240, pierce: 4, lifetime: 4000 },
      { damage: 24, cooldown: 1200, count: 2, speed: 260, pierce: 5, lifetime: 4500 },
      { damage: 32, cooldown: 1000, count: 3, speed: 280, pierce: 6, lifetime: 5000 },
    ],
  },
  [UpgradeType.AURA]: {
    name: '血雾光环',
    description: '围绕玩家的持续伤害环',
    maxLevel: 5,
    levels: [
      { damage: 2, radius: 80, tickInterval: 500 },
      { damage: 3, radius: 90, tickInterval: 450 },
      { damage: 4, radius: 100, tickInterval: 400 },
      { damage: 6, radius: 120, tickInterval: 350 },
      { damage: 8, radius: 140, tickInterval: 300 },
    ],
  },
};

// ==================== 被动配置 ====================
export const PASSIVE_CONFIGS = {
  [UpgradeType.CRIT]: {
    name: '暴击律动',
    description: '增加暴击率和暴击伤害',
    maxLevel: 5,
    levels: [
      { critChance: 0.05, critMultiplier: 1.5 },
      { critChance: 0.08, critMultiplier: 1.6 },
      { critChance: 0.12, critMultiplier: 1.8 },
      { critChance: 0.16, critMultiplier: 2.0 },
      { critChance: 0.2, critMultiplier: 2.5 },
    ],
  },
  [UpgradeType.COOLDOWN]: {
    name: '冷却缩减',
    description: '减少所有武器冷却时间',
    maxLevel: 5,
    levels: [{ reduction: 0.08 }, { reduction: 0.14 }, { reduction: 0.2 }, { reduction: 0.26 }, { reduction: 0.35 }],
  },
  [UpgradeType.PROJECTILE_COUNT]: {
    name: '投射增幅',
    description: '增加投射物数量',
    maxLevel: 5,
    levels: [{ count: 1 }, { count: 1 }, { count: 2 }, { count: 2 }, { count: 3 }],
  },
  [UpgradeType.AREA]: {
    name: '范围扩张',
    description: '增加技能范围',
    maxLevel: 5,
    levels: [{ multiplier: 1.15 }, { multiplier: 1.25 }, { multiplier: 1.4 }, { multiplier: 1.6 }, { multiplier: 2.0 }],
  },
  [UpgradeType.DURATION]: {
    name: '持续延长',
    description: '增加效果持续时间',
    maxLevel: 5,
    levels: [{ multiplier: 1.2 }, { multiplier: 1.35 }, { multiplier: 1.5 }, { multiplier: 1.7 }, { multiplier: 2.0 }],
  },
  [UpgradeType.PICKUP_RADIUS]: {
    name: '拾取半径',
    description: '增加经验吸附范围',
    maxLevel: 5,
    levels: [{ bonus: 10 }, { bonus: 20 }, { bonus: 35 }, { bonus: 55 }, { bonus: 100 }],
  },
};

// ==================== 任务配置 ====================
export const DEFAULT_TASKS = [
  {
    id: 'survive_5min',
    title: '夜行者',
    description: '生存至少5分钟',
    goal: 300, // 300秒
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '夜行者',
    rewardTalentPoints: 2,
  },
  {
    id: 'kill_500',
    title: '长夜猎手',
    description: '累计击杀500个敌人',
    goal: 500,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '长夜猎手',
    rewardTalentPoints: 3,
  },
  {
    id: 'no_damage_90s',
    title: '无伤猎手',
    description: '连续90秒不受伤',
    goal: 90,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '无伤猎手',
    rewardTalentPoints: 4,
  },
  {
    id: 'max_weapon',
    title: '构筑大师',
    description: '将任意武器升到满级',
    goal: 1,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '构筑大师',
    rewardTalentPoints: 3,
  },
  {
    id: 'kill_80_in_10s',
    title: '血月行者',
    description: '10秒内击杀80个敌人',
    goal: 80,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '血月行者',
    rewardTalentPoints: 5,
  },
  {
    id: 'defeat_final_boss',
    title: '终末幸存者',
    description: '击败终局Boss',
    goal: 1,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '终末幸存者',
    rewardTalentPoints: 8,
  },
  {
    id: 'kill_100',
    title: '初级猎手',
    description: '累计击杀100个敌人',
    goal: 100,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '初级猎手',
    rewardTalentPoints: 1,
  },
  {
    id: 'survive_10min',
    title: '黎明守望者',
    description: '生存至少10分钟',
    goal: 600,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '黎明守望者',
    rewardTalentPoints: 4,
  },
  {
    id: 'collect_100_exp',
    title: '经验猎人',
    description: '单局收集100个经验球',
    goal: 100,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '经验猎人',
    rewardTalentPoints: 2,
  },
  {
    id: 'upgrade_weapon_5_times',
    title: '武器精通',
    description: '单局升级武器5次',
    goal: 5,
    progress: 0,
    completed: false,
    redeemed: false,
    rewardTitle: '武器精通',
    rewardTalentPoints: 2,
  },
];

// ==================== 存档配置 ====================
export const SAVE_KEY = 'bloodnight.v1';
export const SCHEMA_VERSION = 2; // v2: 添加任务奖励天赋点字段

// ==================== 颜色配置 ====================
export const COLORS = {
  player: '#4ade80',
  enemy: {
    [EnemyType.ZOMBIE]: '#ef4444',
    [EnemyType.RUNNER]: '#f97316',
    [EnemyType.GIANT]: '#dc2626',
    [EnemyType.EXPLODER]: '#a855f7',
    [EnemyType.RANGED]: '#eab308',
    [EnemyType.BOSS_1]: '#b91c1c',
    [EnemyType.BOSS_2]: '#7f1d1d',
  },
  projectile: {
    player: '#60a5fa',
    enemy: '#f87171',
  },
  exp: {
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
  },
  health: '#f43f5e',
  shield: '#a78bfa',
  effect: '#fbbf24',
};

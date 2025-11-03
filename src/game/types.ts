// 核心游戏类型定义

export interface Vector2 {
  x: number;
  y: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// ==================== 玩家 ====================
export interface Player {
  position: Vector2;
  velocity: Vector2;
  facing: Vector2; // 玩家朝向（最后的移动方向）
  health: number;
  maxHealth: number;
  level: number;
  exp: number;
  expToNext: number;
  radius: number;
  invulnerable: number; // 无敌帧剩余时间
  moveSpeed: number;
  pickupRadius: number;
}

// ==================== 敌人 ====================
export enum EnemyType {
  ZOMBIE = 'zombie',
  RUNNER = 'runner',
  GIANT = 'giant',
  EXPLODER = 'exploder',
  RANGED = 'ranged',
  BOSS_1 = 'boss_1',
  BOSS_2 = 'boss_2',
}

export interface Enemy {
  id: number;
  type: EnemyType;
  position: Vector2;
  velocity: Vector2;
  health: number;
  maxHealth: number;
  damage: number;
  moveSpeed: number;
  radius: number;
  alive: boolean;
  // AI特定字段
  attackCooldown: number;
  explodeTimer?: number; // 自爆者
  ai?: 'chase' | 'ranged' | 'boss';
}

// ==================== 弹体/效果 ====================
export enum ProjectileType {
  DAGGER = 'dagger',
  CROSS = 'cross',
  LIGHTNING = 'lightning',
  HOLY_WATER = 'holy_water',
  ENEMY_BULLET = 'enemy_bullet',
}

export interface Projectile {
  id: number;
  type: ProjectileType;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  radius: number;
  pierce: number; // 穿透次数
  lifetime: number;
  alive: boolean;
  owner: 'player' | 'enemy';
  // 回旋镖专用
  returnToOwner?: boolean; // 是否返回主人
  initialLifetime?: number; // 初始生命值（用于判断返回时机）
  ownerPosition?: Vector2; // 主人位置引用
}

export enum EffectType {
  WHIP = 'whip',
  AURA = 'aura',
  FIRE_CIRCLE = 'fire_circle',
  LIGHTNING = 'lightning', // 电弧效果
}

export interface Effect {
  id: number;
  type: EffectType;
  position: Vector2;
  damage: number;
  radius: number;
  duration: number;
  tickInterval: number;
  lastTick: number;
  alive: boolean;
  // 电弧专用
  targetPosition?: Vector2; // 目标位置（用于绘制曲线）
}

// ==================== 掉落物 ====================
export enum DropType {
  EXP_BLUE = 'exp_blue',
  EXP_GREEN = 'exp_green',
  EXP_RED = 'exp_red',
  HEALTH = 'health',
  SHIELD = 'shield',
}

export interface Drop {
  id: number;
  type: DropType;
  position: Vector2;
  velocity: Vector2;
  value: number;
  radius: number;
  alive: boolean;
  magnetized: boolean; // 是否被玩家吸引
}

// ==================== 浮动文字 ====================
export enum FloatingTextType {
  DAMAGE = 'damage',
  CRIT = 'crit',
  DODGE = 'dodge',
  ARMOR = 'armor',
}

export interface FloatingText {
  id: number;
  type: FloatingTextType;
  text: string;
  position: Vector2;
  velocity: Vector2;
  lifetime: number;
  maxLifetime: number;
  alive: boolean;
}

// ==================== 升级系统 ====================
export enum UpgradeType {
  // 武器
  DAGGER = 'dagger',
  WHIP = 'whip',
  HOLY_WATER = 'holy_water',
  LIGHTNING = 'lightning',
  CROSS = 'cross',
  AURA = 'aura',

  // 被动
  CRIT = 'crit',
  COOLDOWN = 'cooldown',
  PROJECTILE_COUNT = 'projectile_count',
  AREA = 'area',
  DURATION = 'duration',
  PICKUP_RADIUS = 'pickup_radius',
}

export interface Upgrade {
  id: UpgradeType;
  name: string;
  description: string;
  isWeapon: boolean;
  level: number;
  maxLevel: number;
  icon?: string;
}

export interface UpgradeOption {
  upgrade: Upgrade;
  description: string; // 当前等级的描述
}

// ==================== 武器实例 ====================
export interface WeaponInstance {
  type: UpgradeType;
  level: number;
  cooldown: number;
  cooldownTimer: number;
}

// ==================== 任务与称号 ====================
export interface Task {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  completed: boolean;
  redeemed: boolean;
  rewardTitle: string;
  rewardTalentPoints: number;
}

export interface Title {
  id: string;
  name: string;
  unlocked: boolean;
}

// ==================== 游戏状态 ====================
export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LEVEL_UP = 'level_up',
  GAME_OVER = 'game_over',
  VICTORY = 'victory',
}

export interface GameStats {
  survivalTime: number;
  killCount: number;
  maxCombo: number;
  damageDealt: number;
  damageTaken: number;
  expCollected: number;
}

// ==================== 波次配置 ====================
export interface WaveConfig {
  startTime: number;
  endTime: number;
  spawnRate: number; // 每秒生成数量
  enemyTypes: Array<{
    type: EnemyType;
    weight: number;
  }>;
  maxEnemies: number;
}

// ==================== 存档 ====================
export interface SaveData {
  schemaVersion: number;
  tasks: Task[];
  titles: Title[];
  activeTitle: string | null;
  activeTalents: Record<string, number>; // TalentId -> level
  highScore: {
    survivalTime: number;
    killCount: number;
    maxCombo: number;
  };
  settings: {
    soundEnabled: boolean;
    lowPerfMode: boolean;
  };
}

// ==================== 游戏配置 ====================
export interface GameConfig {
  worldWidth: number;
  worldHeight: number;
  targetFPS: number;
  fixedDeltaTime: number;
  maxEnemies: number;
  gridCellSize: number;
}

// ==================== 输入状态 ====================
export interface InputState {
  moveX: number;
  moveY: number;
  keys?: Set<string>; // 用于键盘输入追踪
}

# Micro Survivors 🎮

一个基于 React + TypeScript 构建的微缩幸存者游戏，灵感来自 Vampire Survivors 类游戏。

## 游戏特色

- 🎯 自动攻击的幸存者游戏玩法
- 🎨 精美的 Canvas 渲染效果
- 📱 支持移动端触控操作
- ⚔️ 多种武器和技能系统
- 🎯 天赋和升级系统
- 💾 本地存档功能

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **游戏引擎**: 自定义 Canvas 渲染引擎
- **状态管理**: React Hooks
- **包管理器**: pnpm

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000 查看游戏。

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 游戏玩法

1. **移动**: 使用 WASD 或方向键移动角色
2. **自动攻击**: 角色会自动攻击附近的敌人
3. **升级**: 击败敌人获得经验，升级时选择新的武器或技能
4. **生存**: 尽可能长时间生存，击败更多敌人

## 项目结构

```
src/
├── MicroSurvivors/     # 游戏核心代码
│   ├── entities/       # 游戏实体
│   ├── systems/        # 游戏系统
│   ├── ui/            # 用户界面组件
│   ├── utils/         # 工具函数
│   ├── Game.tsx       # 游戏主组件
│   ├── GameEngine.ts  # 游戏引擎
│   └── GameRenderer.ts # 渲染器
├── App.tsx            # 应用根组件
└── main.tsx           # 应用入口
```

## 开发说明

- 游戏使用 Canvas 进行高性能渲染
- 采用组件化架构，便于扩展和维护
- 支持移动端触控操作
- 包含完整的游戏状态管理

## 许可证

MIT License
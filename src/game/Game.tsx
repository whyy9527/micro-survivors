import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './GameEngine';
import { GameRenderer } from './GameRenderer';
import { GameState, InputState, SaveData, Upgrade, UpgradeType } from './types';
import { WEAPON_CONFIGS, PASSIVE_CONFIGS } from './constants';
import { loadSave, saveSave } from './utils/SaveManager';

import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { LevelUpPanel } from './ui/LevelUpPanel';
import { PauseMenu } from './ui/PauseMenu';
import { GameOverPanel } from './ui/GameOverPanel';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { TaskPanel } from './ui/TaskPanel';
import { TalentPanel } from './ui/TalentPanel';
import { TalentId } from './talents';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [upgradeOptions, setUpgradeOptions] = useState<Upgrade[]>([]);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [showTalentPanel, setShowTalentPanel] = useState(false);
  const [, forceUpdate] = useState(0); // 用于强制UI更新

  // 输入状态
  const inputState = useRef<InputState>({
    moveX: 0,
    moveY: 0,
    keys: new Set(),
  });

  // 检测移动设备
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载存档
  useEffect(() => {
    const data = loadSave();
    setSaveData(data);
  }, []);

  // 初始化 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 键盘输入监听
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      const key = e.key.toLowerCase();
      inputState.current.keys?.add(key);

      // 更新移动向量
      updateMovementFromKeys();

      // 暂停
      if (key === ' ' || key === 'escape') {
        e.preventDefault();
        setGameState(GameState.PAUSED);
      }
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      const key = e.key.toLowerCase();
      inputState.current.keys?.delete(key);
      updateMovementFromKeys();
    };

    const updateMovementFromKeys = (): void => {
      const keys = inputState.current.keys;
      if (!keys) return;

      let x = 0;
      let y = 0;

      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;

      // 归一化斜向移动
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude > 0) {
        inputState.current.moveX = x / magnitude;
        inputState.current.moveY = y / magnitude;
      } else {
        inputState.current.moveX = 0;
        inputState.current.moveY = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // 生成升级选项
  const generateUpgradeOptions = useCallback((): Upgrade[] => {
    const engine = engineRef.current;
    if (!engine) return [];

    const weaponSystem = engine.getWeaponSystem();
    const currentWeapons = weaponSystem.getWeapons();
    const currentPassives = weaponSystem.getPassives();
    const available: Upgrade[] = [];

    // 收集已有武器的升级选项（跳过满级武器）
    for (const weapon of currentWeapons) {
      const config = WEAPON_CONFIGS[weapon.type];
      if (!config) {
        console.error(`Missing config for weapon type: ${weapon.type}`);
        continue;
      }
      if (weapon.level < config.maxLevel) {
        available.push({
          id: weapon.type,
          name: config.name,
          description: config.description,
          isWeapon: true,
          level: weapon.level + 1,
          maxLevel: config.maxLevel,
        });
      }
    }

    // 收集新武器选项
    const allWeaponTypes = Object.keys(WEAPON_CONFIGS) as UpgradeType[];
    for (const type of allWeaponTypes) {
      if (!currentWeapons.some((w) => w.type === type)) {
        const config = WEAPON_CONFIGS[type];
        if (!config) {
          console.error(`Missing config for weapon type: ${type}`);
          continue;
        }
        available.push({
          id: type,
          name: config.name,
          description: config.description,
          isWeapon: true,
          level: 1,
          maxLevel: config.maxLevel,
        });
      }
    }

    // 收集已有被动的升级选项（跳过满级被动）
    for (const [type, level] of Object.entries(currentPassives)) {
      const config = PASSIVE_CONFIGS[type as UpgradeType];
      if (!config) {
        console.error(`Missing passive config for type: ${type}`);
        continue;
      }
      const numLevel = level as number;
      if (numLevel < config.maxLevel) {
        available.push({
          id: type as UpgradeType,
          name: config.name,
          description: config.description,
          isWeapon: false,
          level: numLevel + 1,
          maxLevel: config.maxLevel,
        });
      }
    }

    // 收集新被动选项
    const allPassiveTypes = Object.keys(PASSIVE_CONFIGS) as UpgradeType[];
    for (const type of allPassiveTypes) {
      if (currentPassives[type] === undefined) {
        const config = PASSIVE_CONFIGS[type];
        if (!config) {
          console.error(`Missing passive config for type: ${type}`);
          continue;
        }
        available.push({
          id: type,
          name: config.name,
          description: config.description,
          isWeapon: false,
          level: 1,
          maxLevel: config.maxLevel,
        });
      }
    }

    // 检查URL是否包含dev参数
    const isDev = window.location.search.includes('dev') || window.location.hash.includes('dev');

    // dev模式返回所有选项，否则随机选择3个
    if (isDev) {
      return available;
    }

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }, []);

  // 选择升级
  const handleSelectUpgrade = useCallback(
    (upgradeType: UpgradeType) => {
      const engine = engineRef.current;
      if (!engine) return;

      const upgrade = upgradeOptions.find((u) => u.id === upgradeType);
      if (!upgrade) return;

      const weaponSystem = engine.getWeaponSystem();
      const taskSystem = engine.getTaskSystem();

      if (upgrade.isWeapon) {
        // 添加或升级武器
        weaponSystem.addWeapon(upgrade.id, upgrade.level);

        // 检查武器是否升到满级
        const config = WEAPON_CONFIGS[upgrade.id];
        if (config && upgrade.level === config.maxLevel) {
          taskSystem.onWeaponMaxLevel();
        }
      } else {
        // 添加或升级被动
        weaponSystem.applyPassive(upgrade.id, upgrade.level);
      }

      // 清空输入状态，防止自动移动
      inputState.current.keys?.clear();
      inputState.current.moveX = 0;
      inputState.current.moveY = 0;

      // 继续游戏
      setGameState(GameState.PLAYING);
    },
    [upgradeOptions],
  );

  // 虚拟摇杆输入
  const handleJoystickMove = useCallback((x: number, y: number) => {
    inputState.current.moveX = x;
    inputState.current.moveY = y;
  }, []);

  // 游戏主循环
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const engine = engineRef.current;
    const renderer = rendererRef.current;
    if (!engine || !renderer) return;

    let lastTime = performance.now();
    let frameCount = 0;

    const gameLoop = (currentTime: number): void => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // 更新引擎
      const result = engine.update(deltaTime, inputState.current);

      // 渲染
      const player = engine.getPlayer();
      const entities = engine.getEntities();
      const camera = engine.getCamera();
      renderer.render(player, entities, camera);

      // 每10帧强制更新一次React UI（约每167ms）
      frameCount++;
      if (frameCount % 10 === 0) {
        forceUpdate((n) => n + 1);
      }

      // 检查升级
      if (result.needsLevelUp) {
        const options = generateUpgradeOptions();
        setUpgradeOptions(options);
        setGameState(GameState.LEVEL_UP);
        return;
      }

      // 检查游戏结束
      if (engine.isGameOver()) {
        setGameState(GameState.GAME_OVER);
        handleGameEnd();
        return;
      }

      // 检查胜利
      if (engine.isVictory()) {
        setGameState(GameState.VICTORY);
        handleGameEnd();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  // 开始游戏
  const handleStartGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !saveData) return;

    // 创建引擎和渲染器（传递天赋配置）
    const engine = new GameEngine(saveData.tasks, saveData.activeTalents || {});
    const renderer = new GameRenderer(canvas);

    engineRef.current = engine;
    rendererRef.current = renderer;

    // 重置输入状态
    inputState.current = { moveX: 0, moveY: 0, keys: new Set() };

    setGameState(GameState.PLAYING);
  }, [saveData]);

  // 游戏结束处理
  const handleGameEnd = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !saveData) return;

    // 更新任务进度
    const taskSystem = engine.getTaskSystem();
    const updatedTasks = taskSystem.getTasks();

    // 将任务进度更新到saveData
    const newSaveData: SaveData = {
      ...saveData,
      tasks: updatedTasks,
    };

    // 保存进度
    saveSave(newSaveData);
    setSaveData(newSaveData);
  }, [saveData]);

  // 暂停/恢复
  const handleResume = useCallback(() => {
    setGameState(GameState.PLAYING);
  }, []);

  const handlePause = useCallback(() => {
    setGameState(GameState.PAUSED);
  }, []);

  // 返回主菜单
  const handleQuitToMenu = useCallback(() => {
    // 停止游戏循环
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // 清理引擎和渲染器
    engineRef.current = null;
    rendererRef.current = null;

    // 重置输入
    inputState.current = { moveX: 0, moveY: 0, keys: new Set() };

    setGameState(GameState.MENU);
  }, []);

  // 重新开始
  const handleRestart = useCallback(() => {
    handleQuitToMenu();
    setTimeout(() => handleStartGame(), 100);
  }, [handleQuitToMenu, handleStartGame]);

  // 查看任务
  const handleViewTasks = useCallback(() => {
    setShowTaskPanel(true);
  }, []);

  const handleCloseTaskPanel = useCallback(() => {
    setShowTaskPanel(false);
  }, []);

  // 暂停时查看任务（使用实时任务数据）
  const handleViewTasksInGame = useCallback(() => {
    setShowTaskPanel(true);
  }, []);

  // 查看天赋
  const handleViewTalents = useCallback(() => {
    setShowTalentPanel(true);
  }, []);

  const handleCloseTalentPanel = useCallback(() => {
    setShowTalentPanel(false);
  }, []);

  // 激活天赋
  const handleActivateTalent = useCallback(
    (talentId: TalentId) => {
      if (!saveData) return;

      const currentLevel = saveData.activeTalents[talentId] || 0;
      const newSaveData: SaveData = {
        ...saveData,
        activeTalents: {
          ...saveData.activeTalents,
          [talentId]: currentLevel + 1,
        },
      };

      saveSave(newSaveData);
      setSaveData(newSaveData);
    },
    [saveData],
  );

  // 重置天赋
  const handleResetTalents = useCallback(() => {
    if (!saveData) return;

    const newSaveData: SaveData = {
      ...saveData,
      activeTalents: {},
    };

    saveSave(newSaveData);
    setSaveData(newSaveData);
  }, [saveData]);

  // 渲染UI
  const renderUI = (): React.ReactNode => {
    const engine = engineRef.current;

    switch (gameState) {
      case GameState.MENU:
        return (
          <>
            <MainMenu onStart={handleStartGame} onViewTasks={handleViewTasks} onViewTalents={handleViewTalents} />
            {showTaskPanel && <TaskPanel tasks={saveData?.tasks || []} onClose={handleCloseTaskPanel} />}
            {showTalentPanel && (
              <TalentPanel
                tasks={saveData?.tasks || []}
                activeTalents={saveData?.activeTalents || {}}
                onActivateTalent={handleActivateTalent}
                onResetTalents={handleResetTalents}
                onClose={handleCloseTalentPanel}
              />
            )}
          </>
        );

      case GameState.PLAYING:
        return (
          <>
            {engine && (
              <HUD
                player={engine.getPlayer()}
                gameTime={engine.getGameTime()}
                stats={engine.getStats()}
                onPause={handlePause}
                activeTitle={saveData?.activeTitle || null}
              />
            )}
            {isMobile && <VirtualJoystick onMove={handleJoystickMove} />}
          </>
        );

      case GameState.LEVEL_UP:
        return <LevelUpPanel options={upgradeOptions} onSelect={handleSelectUpgrade} />;

      case GameState.PAUSED:
        return engine ? (
          <>
            <PauseMenu
              weapons={engine.getWeaponSystem().getWeapons()}
              onResume={handleResume}
              onQuit={handleQuitToMenu}
              onViewTasks={handleViewTasksInGame}
            />
            {showTaskPanel && <TaskPanel tasks={engine.getTaskSystem().getTasks()} onClose={handleCloseTaskPanel} />}
          </>
        ) : null;

      case GameState.GAME_OVER:
      case GameState.VICTORY:
        return engine ? (
          <GameOverPanel
            isVictory={gameState === GameState.VICTORY}
            stats={engine.getStats()}
            tasks={saveData?.tasks || []}
            onRestart={handleRestart}
            onMenu={handleQuitToMenu}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ touchAction: 'none' }} />
      {renderUI()}
    </div>
  );
};

export default Game;

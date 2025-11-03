// 游戏渲染器 - Canvas 2D渲染

import { Player, Enemy, Projectile, Drop, Effect, FloatingText, Vector2, FloatingTextType } from './types';
import { COLORS } from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
  }

  // 清空画布
  clear(): void {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 渲染主函数
  render(
    player: Player,
    entities: {
      enemies: Enemy[];
      projectiles: Projectile[];
      effects: Effect[];
      drops: Drop[];
      floatingTexts: FloatingText[];
    },
    camera: Vector2,
  ): void {
    this.clear();

    // 计算视口偏移
    const offsetX = this.canvas.width / 2 - camera.x;
    const offsetY = this.canvas.height / 2 - camera.y;

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);

    // 绘制草地背景
    this.drawGrass(camera);

    // 绘制网格（可选，调试用）
    // this.drawGrid(camera);

    // 绘制掉落物
    for (const drop of entities.drops) {
      this.drawDrop(drop);
    }

    // 绘制效果
    for (const effect of entities.effects) {
      this.drawEffect(effect);
    }

    // 绘制弹体
    for (const proj of entities.projectiles) {
      this.drawProjectile(proj);
    }

    // 绘制敌人
    for (const enemy of entities.enemies) {
      this.drawEnemy(enemy);
    }

    // 绘制玩家
    this.drawPlayer(player);

    // 绘制浮动文字（在最上层）
    for (const text of entities.floatingTexts) {
      this.drawFloatingText(text);
    }

    this.ctx.restore();
  }

  // ==================== 绘制玩家 ====================
  private drawPlayer(player: Player): void {
    this.ctx.save();

    // 无敌帧闪烁
    if (player.invulnerable > 0 && Math.floor(player.invulnerable / 100) % 2 === 0) {
      this.ctx.globalAlpha = 0.5;
    }

    // 玩家圆形
    this.ctx.fillStyle = COLORS.player;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 方向指示（使用朝向）
    const angle = Math.atan2(player.facing.y, player.facing.x);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(player.position.x, player.position.y);
    this.ctx.lineTo(
      player.position.x + Math.cos(angle) * player.radius * 1.5,
      player.position.y + Math.sin(angle) * player.radius * 1.5,
    );
    this.ctx.stroke();

    // 拾取范围（增强视觉效果）
    // 外圈：虚线边框
    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.pickupRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]); // 重置虚线

    this.ctx.restore();
  }

  // ==================== 绘制敌人 ====================
  private drawEnemy(enemy: Enemy): void {
    this.ctx.save();

    // 敌人圆形
    this.ctx.fillStyle = COLORS.enemy[enemy.type];
    this.ctx.beginPath();
    this.ctx.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 血条
    if (enemy.health < enemy.maxHealth) {
      const barWidth = enemy.radius * 2;
      const barHeight = 3;
      const barY = enemy.position.y - enemy.radius - 5;

      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(enemy.position.x - barWidth / 2, barY, barWidth, barHeight);

      const healthPercent = enemy.health / enemy.maxHealth;
      this.ctx.fillStyle = '#4ade80';
      this.ctx.fillRect(enemy.position.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }

    // Boss额外标记
    if (enemy.type.startsWith('boss')) {
      this.ctx.strokeStyle = '#fbbf24';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(enemy.position.x, enemy.position.y, enemy.radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // ==================== 绘制弹体 ====================
  private drawProjectile(proj: Projectile): void {
    this.ctx.save();

    const color = proj.owner === 'player' ? COLORS.projectile.player : COLORS.projectile.enemy;

    // 根据弹幕类型绘制不同效果
    switch (proj.type) {
      case 'cross': {
        // 回旋镖 - 十字形旋转
        this.drawCross(proj, color);
        break;
      }
      case 'lightning': {
        // 电弧 - 闪电效果
        this.drawLightning(proj);
        break;
      }
      default: {
        // 默认圆形弹幕
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(proj.position.x, proj.position.y, proj.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // 轨迹效果
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.5;
        const angle = Math.atan2(proj.velocity.y, proj.velocity.x);
        this.ctx.beginPath();
        this.ctx.moveTo(proj.position.x, proj.position.y);
        this.ctx.lineTo(proj.position.x - Math.cos(angle) * 10, proj.position.y - Math.sin(angle) * 10);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  // 绘制回旋镖（十字形）
  private drawCross(proj: Projectile, color: string): void {
    const time = Date.now() / 100;
    const rotation = time + proj.id; // 旋转动画
    const size = proj.radius * 2;

    this.ctx.save();
    this.ctx.translate(proj.position.x, proj.position.y);
    this.ctx.rotate(rotation);

    // 发光外圈
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = color;

    // 绘制十字
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';

    // 横线
    this.ctx.beginPath();
    this.ctx.moveTo(-size, 0);
    this.ctx.lineTo(size, 0);
    this.ctx.stroke();

    // 竖线
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(0, size);
    this.ctx.stroke();

    // 中心点
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // 绘制电弧效果
  private drawLightning(proj: Projectile): void {
    this.ctx.save();

    // 发光效果
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#00ffff';

    // 中心球
    const gradient = this.ctx.createRadialGradient(
      proj.position.x,
      proj.position.y,
      0,
      proj.position.x,
      proj.position.y,
      proj.radius * 2,
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(proj.position.x, proj.position.y, proj.radius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 电弧闪烁
    const time = Date.now() / 50;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + time;
      const length = proj.radius * 1.5;
      const endX = proj.position.x + Math.cos(angle) * length;
      const endY = proj.position.y + Math.sin(angle) * length;

      this.ctx.strokeStyle = '#00ffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(proj.position.x, proj.position.y);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // ==================== 绘制效果 ====================
  private drawEffect(effect: Effect): void {
    this.ctx.save();

    // 根据效果类型绘制
    switch (effect.type) {
      case 'lightning': {
        // 电弧 - 曲线连接
        this.drawLightningEffect(effect);
        break;
      }
      default: {
        // 默认圆形效果（光环、火圈、鞭子）
        this.ctx.fillStyle = COLORS.effect;
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(effect.position.x, effect.position.y, effect.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = COLORS.effect;
        this.ctx.globalAlpha = 0.6;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(effect.position.x, effect.position.y, effect.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  // 绘制电弧效果 - 曲线连接
  private drawLightningEffect(effect: Effect): void {
    if (!effect.targetPosition) return;

    this.ctx.save();

    // 发光效果
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#00ffff';

    // 计算控制点（弧线中点偏移）
    const midX = (effect.position.x + effect.targetPosition.x) / 2;
    const midY = (effect.position.y + effect.targetPosition.y) / 2;
    const dx = effect.targetPosition.x - effect.position.x;
    const dy = effect.targetPosition.y - effect.position.y;
    const offset = Math.random() * 30 - 15; // 随机偏移
    const controlX = midX - dy * 0.2 + offset;
    const controlY = midY + dx * 0.2 + offset;

    // 绘制主电弧
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(effect.position.x, effect.position.y);
    this.ctx.quadraticCurveTo(controlX, controlY, effect.targetPosition.x, effect.targetPosition.y);
    this.ctx.stroke();

    // 绘制次级电弧（更细）
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.7;
    this.ctx.beginPath();
    this.ctx.moveTo(effect.position.x, effect.position.y);
    this.ctx.quadraticCurveTo(controlX + 10, controlY - 10, effect.targetPosition.x, effect.targetPosition.y);
    this.ctx.stroke();

    // 起点和终点发光球
    const gradient1 = this.ctx.createRadialGradient(
      effect.position.x,
      effect.position.y,
      0,
      effect.position.x,
      effect.position.y,
      10,
    );
    gradient1.addColorStop(0, '#ffffff');
    gradient1.addColorStop(1, 'rgba(0, 255, 255, 0)');
    this.ctx.fillStyle = gradient1;
    this.ctx.beginPath();
    this.ctx.arc(effect.position.x, effect.position.y, 10, 0, Math.PI * 2);
    this.ctx.fill();

    const gradient2 = this.ctx.createRadialGradient(
      effect.targetPosition.x,
      effect.targetPosition.y,
      0,
      effect.targetPosition.x,
      effect.targetPosition.y,
      10,
    );
    gradient2.addColorStop(0, '#ffffff');
    gradient2.addColorStop(1, 'rgba(0, 255, 255, 0)');
    this.ctx.fillStyle = gradient2;
    this.ctx.beginPath();
    this.ctx.arc(effect.targetPosition.x, effect.targetPosition.y, 10, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // ==================== 绘制掉落物 ====================
  private drawDrop(drop: Drop): void {
    this.ctx.save();

    let color = COLORS.exp.blue;
    if (drop.type === 'exp_green') color = COLORS.exp.green;
    else if (drop.type === 'exp_red') color = COLORS.exp.red;
    else if (drop.type === 'health') color = COLORS.health;
    else if (drop.type === 'shield') color = COLORS.shield;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(drop.position.x, drop.position.y, drop.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 闪烁效果
    if (drop.magnetized) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(drop.position.x, drop.position.y, drop.radius + 3, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // ==================== 绘制草地 ====================
  private drawGrass(camera: Vector2): void {
    this.ctx.save();

    // 草地基础颜色（深绿）
    this.ctx.fillStyle = '#1a2f1a';
    this.ctx.fillRect(
      camera.x - this.canvas.width / 2,
      camera.y - this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height,
    );

    // 绘制草地纹理点
    const grassDensity = 30; // 每30像素一个草点
    const startX = Math.floor((camera.x - this.canvas.width / 2) / grassDensity) * grassDensity;
    const startY = Math.floor((camera.y - this.canvas.height / 2) / grassDensity) * grassDensity;
    const endX = camera.x + this.canvas.width / 2;
    const endY = camera.y + this.canvas.height / 2;

    // 使用位置生成伪随机草点，确保草地稳定不闪烁
    for (let x = startX; x < endX; x += grassDensity) {
      for (let y = startY; y < endY; y += grassDensity) {
        // 基于位置的伪随机数
        const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const random = seed - Math.floor(seed);

        // 60%概率绘制草点
        if (random > 0.4) {
          const offsetX = (random * 20 - 10) % grassDensity;
          const offsetY = ((random * 100) % 1) * 20 - 10;

          // 草点颜色变化
          const brightness = Math.floor(random * 40 + 60);
          this.ctx.fillStyle = `rgba(${brightness}, ${brightness + 100}, ${brightness}, 0.4)`;

          // 绘制小草点
          this.ctx.beginPath();
          this.ctx.arc(x + offsetX, y + offsetY, 1.5, 0, Math.PI * 2);
          this.ctx.fill();

          // 部分草点添加短线条
          if (random > 0.7) {
            this.ctx.strokeStyle = `rgba(${brightness}, ${brightness + 100}, ${brightness}, 0.3)`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x + offsetX, y + offsetY);
            this.ctx.lineTo(x + offsetX + (random * 6 - 3), y + offsetY + (random * 8 - 4));
            this.ctx.stroke();
          }
        }
      }
    }

    this.ctx.restore();
  }

  // ==================== 调试网格 ====================
  private drawGrid(camera: Vector2): void {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    const gridSize = 100;
    const startX = Math.floor(camera.x / gridSize) * gridSize - 500;
    const startY = Math.floor(camera.y / gridSize) * gridSize - 500;

    for (let x = startX; x < camera.x + 1000; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, camera.y + 1000);
      this.ctx.stroke();
    }

    for (let y = startY; y < camera.y + 1000; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(camera.x + 1000, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // ==================== 绘制浮动文字 ====================
  private drawFloatingText(text: FloatingText): void {
    this.ctx.save();

    // 根据类型设置颜色和样式
    let color: string;
    let fontSize: number;
    const fontWeight = 'bold';

    switch (text.type) {
      case FloatingTextType.DODGE:
        color = '#FFD700'; // 金色
        fontSize = 20;
        break;
      case FloatingTextType.ARMOR:
        color = '#4A90E2'; // 蓝色
        fontSize = 16;
        break;
      case FloatingTextType.CRIT:
        color = '#FF4444'; // 红色
        fontSize = 22;
        break;
      case FloatingTextType.DAMAGE:
      default:
        color = '#FFFFFF'; // 白色
        fontSize = 18;
        break;
    }

    // 根据生命周期计算透明度（淡出效果）
    const alpha = text.lifetime / text.maxLifetime;
    this.ctx.globalAlpha = alpha;

    // 绘制文字
    this.ctx.font = `${fontWeight} ${fontSize}px Arial`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // 添加黑色描边增强可读性
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(text.text, text.position.x, text.position.y);
    this.ctx.fillText(text.text, text.position.x, text.position.y);

    this.ctx.restore();
  }

  // 调整画布大小
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

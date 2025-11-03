import { Circle } from '../types';

// 网格分桶碰撞检测系统 - 优化O(n²)碰撞检测

export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Circle[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  // 清空网格
  clear(): void {
    this.grid.clear();
  }

  // 获取网格坐标
  private getCellKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  // 获取对象所在的所有网格（考虑半径）
  private getCellKeys(circle: Circle): string[] {
    const minX = circle.x - circle.radius;
    const maxX = circle.x + circle.radius;
    const minY = circle.y - circle.radius;
    const maxY = circle.y + circle.radius;

    const minCellX = Math.floor(minX / this.cellSize);
    const maxCellX = Math.floor(maxX / this.cellSize);
    const minCellY = Math.floor(minY / this.cellSize);
    const maxCellY = Math.floor(maxY / this.cellSize);

    const keys: string[] = [];
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        keys.push(`${cx},${cy}`);
      }
    }
    return keys;
  }

  // 插入对象
  insert(circle: Circle): void {
    const keys = this.getCellKeys(circle);
    for (const key of keys) {
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(circle);
    }
  }

  // 批量插入
  insertAll(circles: Circle[]): void {
    for (const circle of circles) {
      this.insert(circle);
    }
  }

  // 查询邻近对象
  query(circle: Circle): Circle[] {
    const keys = this.getCellKeys(circle);
    const nearby = new Set<Circle>();

    for (const key of keys) {
      const cells = this.grid.get(key);
      if (cells) {
        for (const obj of cells) {
          if (obj !== circle) {
            nearby.add(obj);
          }
        }
      }
    }

    return Array.from(nearby);
  }

  // 查询半径范围内的对象
  queryRadius(x: number, y: number, radius: number): Circle[] {
    return this.query({ x, y, radius });
  }

  // 获取统计信息（用于调试）
  getStats(): { cells: number; totalObjects: number; avgPerCell: number } {
    let totalObjects = 0;
    for (const cell of this.grid.values()) {
      totalObjects += cell.length;
    }
    return {
      cells: this.grid.size,
      totalObjects,
      avgPerCell: this.grid.size > 0 ? totalObjects / this.grid.size : 0,
    };
  }
}

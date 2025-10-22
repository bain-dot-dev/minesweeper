/**
 * Performance Optimization Utilities
 * Tools for monitoring and optimizing game performance
 */

import { GameState, CellState } from "@/types/game";

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number; // in MB
  loadTime: number; // in ms
  renderTime: number; // in ms
  cpuUsage: number; // percentage
  networkLatency: number; // in ms
  cacheHitRate: number; // percentage
  timestamp: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxMemory: number;
  maxLoadTime: number;
  maxRenderTime: number;
  maxCPU: number;
  maxNetworkLatency: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxHistory: number = 100;
  private thresholds: PerformanceThresholds;
  private warningCallback?: (issue: string, metric: PerformanceMetrics) => void;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fpsInterval: NodeJS.Timeout | null = null;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      minFPS: thresholds?.minFPS ?? 30,
      maxMemory: thresholds?.maxMemory ?? 200, // 200 MB
      maxLoadTime: thresholds?.maxLoadTime ?? 3000, // 3 seconds
      maxRenderTime: thresholds?.maxRenderTime ?? 16, // 60 FPS target
      maxCPU: thresholds?.maxCPU ?? 80, // 80% CPU
      maxNetworkLatency: thresholds?.maxNetworkLatency ?? 500, // 500ms
    };
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(): void {
    // Start FPS monitoring
    this.startFPSMonitoring();

    // Monitor memory every 5 seconds
    setInterval(() => {
      this.recordMetrics();
    }, 5000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
      this.fpsInterval = null;
    }
  }

  /**
   * Record current metrics
   */
  recordMetrics(): void {
    const metrics: PerformanceMetrics = {
      fps: this.getCurrentFPS(),
      memoryUsage: this.getMemoryUsage(),
      loadTime: this.getLoadTime(),
      renderTime: this.getRenderTime(),
      cpuUsage: this.getCPUUsage(),
      networkLatency: this.getNetworkLatency(),
      cacheHitRate: this.getCacheHitRate(),
      timestamp: Date.now(),
    };

    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxHistory) {
      this.metrics.shift();
    }

    // Check thresholds
    this.checkThresholds(metrics);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.getCurrentFPS(),
      memoryUsage: this.getMemoryUsage(),
      loadTime: this.getLoadTime(),
      renderTime: this.getRenderTime(),
      cpuUsage: this.getCPUUsage(),
      networkLatency: this.getNetworkLatency(),
      cacheHitRate: this.getCacheHitRate(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get performance report
   */
  getReport(): {
    current: PerformanceMetrics;
    average: PerformanceMetrics;
    min: PerformanceMetrics;
    max: PerformanceMetrics;
    issues: string[];
  } {
    if (this.metrics.length === 0) {
      const current = this.getCurrentMetrics();
      return {
        current,
        average: current,
        min: current,
        max: current,
        issues: [],
      };
    }

    const current = this.getCurrentMetrics();
    const average = this.calculateAverageMetrics();
    const min = this.calculateMinMetrics();
    const max = this.calculateMaxMetrics();
    const issues = this.detectIssues(current);

    return { current, average, min, max, issues };
  }

  /**
   * Set warning callback
   */
  onWarning(callback: (issue: string, metric: PerformanceMetrics) => void): void {
    this.warningCallback = callback;
  }

  /**
   * Clear metrics history
   */
  clearHistory(): void {
    this.metrics = [];
  }

  /**
   * Export metrics
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Private methods
   */

  private startFPSMonitoring(): void {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    const countFrame = () => {
      this.frameCount++;
      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);

    // Calculate FPS every second
    this.fpsInterval = setInterval(() => {
      const currentTime = performance.now();
      const delta = currentTime - this.lastFrameTime;
      const fps = Math.round((this.frameCount * 1000) / delta);

      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }, 1000);
  }

  private getCurrentFPS(): number {
    if (this.lastFrameTime === 0) return 60;
    const currentTime = performance.now();
    const delta = currentTime - this.lastFrameTime;
    return delta > 0 ? Math.round((this.frameCount * 1000) / delta) : 60;
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
    }
    return 0;
  }

  private getLoadTime(): number {
    if (performance.timing) {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    return 0;
  }

  private getRenderTime(): number {
    // This would measure actual render time in a real implementation
    return 0;
  }

  private getCPUUsage(): number {
    // This would measure CPU usage in a real implementation
    return 0;
  }

  private getNetworkLatency(): number {
    // This would measure network latency in a real implementation
    return 0;
  }

  private getCacheHitRate(): number {
    // This would measure cache hit rate in a real implementation
    return 100;
  }

  private calculateAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) return this.getCurrentMetrics();

    const sum = this.metrics.reduce(
      (acc, m) => ({
        fps: acc.fps + m.fps,
        memoryUsage: acc.memoryUsage + m.memoryUsage,
        loadTime: acc.loadTime + m.loadTime,
        renderTime: acc.renderTime + m.renderTime,
        cpuUsage: acc.cpuUsage + m.cpuUsage,
        networkLatency: acc.networkLatency + m.networkLatency,
        cacheHitRate: acc.cacheHitRate + m.cacheHitRate,
        timestamp: 0,
      }),
      { fps: 0, memoryUsage: 0, loadTime: 0, renderTime: 0, cpuUsage: 0, networkLatency: 0, cacheHitRate: 0, timestamp: 0 }
    );

    const count = this.metrics.length;
    return {
      fps: Math.round(sum.fps / count),
      memoryUsage: Math.round(sum.memoryUsage / count),
      loadTime: Math.round(sum.loadTime / count),
      renderTime: Math.round(sum.renderTime / count),
      cpuUsage: Math.round(sum.cpuUsage / count),
      networkLatency: Math.round(sum.networkLatency / count),
      cacheHitRate: Math.round(sum.cacheHitRate / count),
      timestamp: Date.now(),
    };
  }

  private calculateMinMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) return this.getCurrentMetrics();

    return this.metrics.reduce((min, m) => ({
      fps: Math.min(min.fps, m.fps),
      memoryUsage: Math.min(min.memoryUsage, m.memoryUsage),
      loadTime: Math.min(min.loadTime, m.loadTime),
      renderTime: Math.min(min.renderTime, m.renderTime),
      cpuUsage: Math.min(min.cpuUsage, m.cpuUsage),
      networkLatency: Math.min(min.networkLatency, m.networkLatency),
      cacheHitRate: Math.min(min.cacheHitRate, m.cacheHitRate),
      timestamp: 0,
    }));
  }

  private calculateMaxMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) return this.getCurrentMetrics();

    return this.metrics.reduce((max, m) => ({
      fps: Math.max(max.fps, m.fps),
      memoryUsage: Math.max(max.memoryUsage, m.memoryUsage),
      loadTime: Math.max(max.loadTime, m.loadTime),
      renderTime: Math.max(max.renderTime, m.renderTime),
      cpuUsage: Math.max(max.cpuUsage, m.cpuUsage),
      networkLatency: Math.max(max.networkLatency, m.networkLatency),
      cacheHitRate: Math.max(max.cacheHitRate, m.cacheHitRate),
      timestamp: 0,
    }));
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    const issues: string[] = [];

    if (metrics.fps < this.thresholds.minFPS) {
      issues.push(`Low FPS: ${metrics.fps} (threshold: ${this.thresholds.minFPS})`);
    }

    if (metrics.memoryUsage > this.thresholds.maxMemory) {
      issues.push(`High memory usage: ${metrics.memoryUsage}MB (threshold: ${this.thresholds.maxMemory}MB)`);
    }

    if (metrics.loadTime > this.thresholds.maxLoadTime) {
      issues.push(`Slow load time: ${metrics.loadTime}ms (threshold: ${this.thresholds.maxLoadTime}ms)`);
    }

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      issues.push(`Slow render time: ${metrics.renderTime}ms (threshold: ${this.thresholds.maxRenderTime}ms)`);
    }

    if (metrics.cpuUsage > this.thresholds.maxCPU) {
      issues.push(`High CPU usage: ${metrics.cpuUsage}% (threshold: ${this.thresholds.maxCPU}%)`);
    }

    if (metrics.networkLatency > this.thresholds.maxNetworkLatency) {
      issues.push(`High network latency: ${metrics.networkLatency}ms (threshold: ${this.thresholds.maxNetworkLatency}ms)`);
    }

    if (issues.length > 0 && this.warningCallback) {
      issues.forEach((issue) => this.warningCallback!(issue, metrics));
    }
  }

  private detectIssues(metrics: PerformanceMetrics): string[] {
    const issues: string[] = [];

    if (metrics.fps < this.thresholds.minFPS) {
      issues.push("Low FPS detected");
    }

    if (metrics.memoryUsage > this.thresholds.maxMemory) {
      issues.push("High memory usage detected");
    }

    if (metrics.loadTime > this.thresholds.maxLoadTime) {
      issues.push("Slow load time detected");
    }

    return issues;
  }
}

// ============================================================================
// OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Memoization cache for expensive calculations
 */
export class MemoizationCache<K, V> {
  private cache: Map<string, { value: V; timestamp: number }> = new Map();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 1000, ttl: number = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: K): V | null {
    const keyStr = JSON.stringify(key);
    const cached = this.cache.get(keyStr);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(keyStr);
      return null;
    }

    return cached.value;
  }

  set(key: K, value: V): void {
    const keyStr = JSON.stringify(key);

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(keyStr, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }

  getHitRate(): number {
    // This would track hits/misses in a real implementation
    return 0;
  }
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch updates for performance
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private batchSize: number;
  private batchDelay: number;
  private processor: (batch: T[]) => void;
  private timer: NodeJS.Timeout | null = null;

  constructor(processor: (batch: T[]) => void, batchSize: number = 50, batchDelay: number = 100) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  add(item: T): void {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.queue.length);
      this.processor(batch);
    }
  }

  private scheduleFlush(): void {
    if (this.timer) return;

    this.timer = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }
}

/**
 * Optimize board rendering
 */
export function optimizeBoardRender(board: CellState[][]): {
  visibleCells: Set<string>;
  batchUpdates: CellState[][];
} {
  const visibleCells = new Set<string>();
  const batchUpdates: CellState[][] = [];

  // Only render visible cells (for large boards)
  // This would integrate with viewport calculations

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      visibleCells.add(`${x},${y}`);
    }
  }

  return { visibleCells, batchUpdates };
}

/**
 * Lazy load game assets
 */
export class AssetLoader {
  private loadedAssets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  async load(assetId: string, loader: () => Promise<any>): Promise<any> {
    // Return cached asset
    if (this.loadedAssets.has(assetId)) {
      return this.loadedAssets.get(assetId);
    }

    // Return in-progress loading promise
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId);
    }

    // Start loading
    const loadingPromise = loader().then((asset) => {
      this.loadedAssets.set(assetId, asset);
      this.loadingPromises.delete(assetId);
      return asset;
    });

    this.loadingPromises.set(assetId, loadingPromise);
    return loadingPromise;
  }

  preload(assetIds: string[], loaders: Map<string, () => Promise<any>>): Promise<void[]> {
    const promises = assetIds.map((assetId) => {
      const loader = loaders.get(assetId);
      if (!loader) {
        console.warn(`No loader found for asset: ${assetId}`);
        return Promise.resolve();
      }
      return this.load(assetId, loader);
    });

    return Promise.all(promises);
  }

  unload(assetId: string): void {
    this.loadedAssets.delete(assetId);
    this.loadingPromises.delete(assetId);
  }

  clear(): void {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
  }
}

/**
 * Virtual scrolling for large boards
 */
export interface VirtualScrollConfig {
  containerHeight: number;
  containerWidth: number;
  itemHeight: number;
  itemWidth: number;
  overscan: number; // Number of extra items to render
}

export function calculateVirtualScroll(config: VirtualScrollConfig, scrollTop: number, scrollLeft: number): {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  totalRows: number;
  totalCols: number;
} {
  const { containerHeight, containerWidth, itemHeight, itemWidth, overscan } = config;

  const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endRow = Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan;

  const startCol = Math.max(0, Math.floor(scrollLeft / itemWidth) - overscan);
  const endCol = Math.ceil((scrollLeft + containerWidth) / itemWidth) + overscan;

  return {
    startRow,
    endRow,
    startCol,
    endCol,
    totalRows: endRow - startRow,
    totalCols: endCol - startCol,
  };
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let performanceMonitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

export function createPerformanceMonitor(thresholds?: Partial<PerformanceThresholds>): PerformanceMonitor {
  return new PerformanceMonitor(thresholds);
}

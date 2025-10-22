/**
 * Performance Optimization System
 * Comprehensive performance monitoring and optimization
 */

import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
  inputLatency: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  fps: { warning: number; critical: number };
  frameTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  renderTime: { warning: number; critical: number };
  updateTime: { warning: number; critical: number };
  inputLatency: { warning: number; critical: number };
}

export interface OptimizationConfig {
  enableAdaptiveQuality: boolean;
  enableMemoryManagement: boolean;
  enableFrameRateLimiting: boolean;
  enableLazyLoading: boolean;
  enableObjectPooling: boolean;
  maxMemoryUsage: number; // MB
  targetFPS: number;
  qualityLevel: "low" | "medium" | "high" | "ultra";
}

export interface PerformanceReport {
  averageFPS: number;
  averageFrameTime: number;
  peakMemoryUsage: number;
  averageRenderTime: number;
  averageUpdateTime: number;
  averageInputLatency: number;
  droppedFrames: number;
  performanceScore: number;
  recommendations: string[];
  timestamp: number;
}

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isMonitoring: boolean = false;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private droppedFrames: number = 0;
  private thresholds: PerformanceThresholds;
  private config: OptimizationConfig;

  constructor() {
    this.thresholds = this.getDefaultThresholds();
    this.config = this.getDefaultConfig();
    this.startMonitoring();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.droppedFrames = 0;

    // Start frame monitoring
    this.monitorFrame();
    
    console.log("📊 Performance monitoring started");
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log("📊 Performance monitoring stopped");
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Partial<PerformanceMetrics>): void {
    if (!this.isMonitoring) return;

    const fullMetric: PerformanceMetrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      updateTime: 0,
      inputLatency: 0,
      timestamp: performance.now(),
      ...metric,
    };

    this.metrics.push(fullMetric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check for performance issues
    this.checkPerformanceIssues(fullMetric);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return this.getEmptyReport();
    }

    const recentMetrics = this.metrics.slice(-100); // Last 100 frames
    const averageFPS = this.calculateAverageFPS(recentMetrics);
    const averageFrameTime = this.calculateAverageFrameTime(recentMetrics);
    const peakMemoryUsage = this.calculatePeakMemoryUsage(recentMetrics);
    const averageRenderTime = this.calculateAverageRenderTime(recentMetrics);
    const averageUpdateTime = this.calculateAverageUpdateTime(recentMetrics);
    const averageInputLatency = this.calculateAverageInputLatency(recentMetrics);
    const performanceScore = this.calculatePerformanceScore(recentMetrics);
    const recommendations = this.generateRecommendations(recentMetrics);

      return {
      averageFPS,
      averageFrameTime,
      peakMemoryUsage,
      averageRenderTime,
      averageUpdateTime,
      averageInputLatency,
      droppedFrames: this.droppedFrames,
      performanceScore,
      recommendations,
      timestamp: Date.now(),
    };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Clear performance data
   */
  clearMetrics(): void {
    this.metrics = [];
    this.droppedFrames = 0;
    console.log("📊 Performance metrics cleared");
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private monitorFrame(): void {
    if (!this.isMonitoring) return;

      const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    const fps = 1000 / frameTime;

    // Check for dropped frames
    if (frameTime > 16.67) { // More than 60fps threshold
      this.droppedFrames++;
    }

    // Record frame metrics
    this.recordMetric({
      fps,
      frameTime,
      memoryUsage: this.getMemoryUsage(),
    });

    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Continue monitoring
    requestAnimationFrame(() => this.monitorFrame());
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  private checkPerformanceIssues(metric: PerformanceMetrics): void {
    const issues: string[] = [];

    if (metric.fps < this.thresholds.fps.critical) {
      issues.push(`Critical FPS drop: ${metric.fps.toFixed(1)}fps`);
    } else if (metric.fps < this.thresholds.fps.warning) {
      issues.push(`FPS warning: ${metric.fps.toFixed(1)}fps`);
    }

    if (metric.frameTime > this.thresholds.frameTime.critical) {
      issues.push(`Critical frame time: ${metric.frameTime.toFixed(1)}ms`);
    } else if (metric.frameTime > this.thresholds.frameTime.warning) {
      issues.push(`Frame time warning: ${metric.frameTime.toFixed(1)}ms`);
    }

    if (metric.memoryUsage > this.thresholds.memoryUsage.critical) {
      issues.push(`Critical memory usage: ${metric.memoryUsage.toFixed(1)}MB`);
    } else if (metric.memoryUsage > this.thresholds.memoryUsage.warning) {
      issues.push(`Memory warning: ${metric.memoryUsage.toFixed(1)}MB`);
    }

    if (issues.length > 0) {
      console.warn("⚠️ Performance issues detected:", issues);
    }
  }

  private calculateAverageFPS(metrics: PerformanceMetrics[]): number {
    const fpsSum = metrics.reduce((sum, metric) => sum + metric.fps, 0);
    return fpsSum / metrics.length;
  }

  private calculateAverageFrameTime(metrics: PerformanceMetrics[]): number {
    const frameTimeSum = metrics.reduce((sum, metric) => sum + metric.frameTime, 0);
    return frameTimeSum / metrics.length;
  }

  private calculatePeakMemoryUsage(metrics: PerformanceMetrics[]): number {
    return Math.max(...metrics.map(metric => metric.memoryUsage));
  }

  private calculateAverageRenderTime(metrics: PerformanceMetrics[]): number {
    const renderTimeSum = metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return renderTimeSum / metrics.length;
  }

  private calculateAverageUpdateTime(metrics: PerformanceMetrics[]): number {
    const updateTimeSum = metrics.reduce((sum, metric) => sum + metric.updateTime, 0);
    return updateTimeSum / metrics.length;
  }

  private calculateAverageInputLatency(metrics: PerformanceMetrics[]): number {
    const inputLatencySum = metrics.reduce((sum, metric) => sum + metric.inputLatency, 0);
    return inputLatencySum / metrics.length;
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics[]): number {
    const avgFPS = this.calculateAverageFPS(metrics);
    const avgFrameTime = this.calculateAverageFrameTime(metrics);
    const peakMemory = this.calculatePeakMemoryUsage(metrics);

    // Calculate score based on FPS, frame time, and memory usage
    let score = 100;

    // FPS scoring (0-40 points)
    if (avgFPS >= 60) score += 40;
    else if (avgFPS >= 45) score += 30;
    else if (avgFPS >= 30) score += 20;
    else if (avgFPS >= 15) score += 10;

    // Frame time scoring (0-30 points)
    if (avgFrameTime <= 16.67) score += 30;
    else if (avgFrameTime <= 33.33) score += 20;
    else if (avgFrameTime <= 50) score += 10;

    // Memory scoring (0-30 points)
    if (peakMemory <= 50) score += 30;
    else if (peakMemory <= 100) score += 20;
    else if (peakMemory <= 200) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(metrics: PerformanceMetrics[]): string[] {
    const recommendations: string[] = [];
    const avgFPS = this.calculateAverageFPS(metrics);
    const avgFrameTime = this.calculateAverageFrameTime(metrics);
    const peakMemory = this.calculatePeakMemoryUsage(metrics);

    if (avgFPS < 30) {
      recommendations.push("Consider reducing visual effects or lowering quality settings");
    }

    if (avgFrameTime > 33.33) {
      recommendations.push("Optimize rendering pipeline or reduce draw calls");
    }

    if (peakMemory > 100) {
      recommendations.push("Implement object pooling or reduce memory allocations");
    }

    if (this.droppedFrames > 10) {
      recommendations.push("Check for performance bottlenecks in game loop");
    }

    if (recommendations.length === 0) {
      recommendations.push("Performance is optimal");
    }

    return recommendations;
  }

  private getEmptyReport(): PerformanceReport {
    return {
      averageFPS: 0,
      averageFrameTime: 0,
      peakMemoryUsage: 0,
      averageRenderTime: 0,
      averageUpdateTime: 0,
      averageInputLatency: 0,
      droppedFrames: 0,
      performanceScore: 0,
      recommendations: ["No data available"],
      timestamp: Date.now(),
    };
  }

  private getDefaultThresholds(): PerformanceThresholds {
    return {
      fps: { warning: 45, critical: 30 },
      frameTime: { warning: 22.22, critical: 33.33 },
      memoryUsage: { warning: 100, critical: 200 },
      renderTime: { warning: 10, critical: 20 },
      updateTime: { warning: 5, critical: 10 },
      inputLatency: { warning: 50, critical: 100 },
    };
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      enableAdaptiveQuality: true,
      enableMemoryManagement: true,
      enableFrameRateLimiting: true,
      enableLazyLoading: true,
      enableObjectPooling: true,
      maxMemoryUsage: 150,
      targetFPS: 60,
      qualityLevel: "high",
    };
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZER
// ============================================================================

export class PerformanceOptimizer {
  private monitor: PerformanceMonitor;
  private config: OptimizationConfig;
  private optimizations: Map<string, boolean> = new Map();

  constructor() {
    this.monitor = new PerformanceMonitor();
    this.config = this.getDefaultConfig();
    this.initializeOptimizations();
  }

  /**
   * Apply performance optimizations based on current metrics
   */
  applyOptimizations(): void {
    const report = this.monitor.getPerformanceReport();
    
    if (report.performanceScore < 50) {
      this.enableCriticalOptimizations();
    } else if (report.performanceScore < 75) {
      this.enableModerateOptimizations();
    } else {
      this.enableLightOptimizations();
    }
  }

  /**
   * Enable critical optimizations
   */
  enableCriticalOptimizations(): void {
    this.setOptimization("reduceParticles", true);
    this.setOptimization("disableShadows", true);
    this.setOptimization("reduceTextureQuality", true);
    this.setOptimization("limitFrameRate", true);
    this.setOptimization("enableObjectPooling", true);
    this.setOptimization("disablePostProcessing", true);
    
    console.log("🔧 Critical optimizations enabled");
  }

  /**
   * Enable moderate optimizations
   */
  enableModerateOptimizations(): void {
    this.setOptimization("reduceParticles", true);
    this.setOptimization("limitFrameRate", true);
    this.setOptimization("enableObjectPooling", true);
    this.setOptimization("optimizeRendering", true);
    
    console.log("🔧 Moderate optimizations enabled");
  }

  /**
   * Enable light optimizations
   */
  enableLightOptimizations(): void {
    this.setOptimization("enableObjectPooling", true);
    this.setOptimization("optimizeRendering", true);
    
    console.log("🔧 Light optimizations enabled");
  }

  /**
   * Set a specific optimization
   */
  setOptimization(name: string, enabled: boolean): void {
    this.optimizations.set(name, enabled);
    console.log(`🔧 Optimization ${name}: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get optimization status
   */
  getOptimization(name: string): boolean {
    return this.optimizations.get(name) || false;
  }

  /**
   * Get all optimizations
   */
  getAllOptimizations(): Map<string, boolean> {
    return new Map(this.optimizations);
  }

  /**
   * Reset all optimizations
   */
  resetOptimizations(): void {
    this.optimizations.clear();
    this.initializeOptimizations();
    console.log("🔧 All optimizations reset");
  }

  /**
   * Get performance monitor
   */
  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeOptimizations(): void {
    const defaultOptimizations = [
      "reduceParticles",
      "disableShadows",
      "reduceTextureQuality",
      "limitFrameRate",
      "enableObjectPooling",
      "disablePostProcessing",
      "optimizeRendering",
      "enableLazyLoading",
      "enableMemoryManagement",
    ];

    for (const optimization of defaultOptimizations) {
      this.optimizations.set(optimization, false);
    }
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      enableAdaptiveQuality: true,
      enableMemoryManagement: true,
      enableFrameRateLimiting: true,
      enableLazyLoading: true,
      enableObjectPooling: true,
      maxMemoryUsage: 150,
      targetFPS: 60,
      qualityLevel: "high",
    };
  }
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Object pool for performance optimization
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  size(): number {
    return this.pool.length;
  }

  clear(): void {
    this.pool = [];
  }
}

/**
 * Memory manager for performance optimization
 */
export class MemoryManager {
  private allocations: Map<string, number> = new Map();
  private maxMemory: number;

  constructor(maxMemory: number = 100) {
    this.maxMemory = maxMemory;
  }

  allocate(id: string, size: number): boolean {
    const currentUsage = this.getCurrentUsage();
    if (currentUsage + size > this.maxMemory) {
      console.warn(`Memory allocation failed: ${id} (${size}MB)`);
      return false;
    }

    this.allocations.set(id, size);
    return true;
  }

  deallocate(id: string): void {
    this.allocations.delete(id);
  }

  getCurrentUsage(): number {
    return Array.from(this.allocations.values()).reduce((sum, size) => sum + size, 0);
  }

  getMaxMemory(): number {
    return this.maxMemory;
  }

  setMaxMemory(maxMemory: number): void {
    this.maxMemory = maxMemory;
  }

  clear(): void {
    this.allocations.clear();
  }
}

// ============================================================================
// PERFORMANCE HOOKS
// ============================================================================

/**
 * React hook for performance optimization
 */
export function usePerformanceOptimization() {
  const optimizer = new PerformanceOptimizer();

  return {
    applyOptimizations: optimizer.applyOptimizations.bind(optimizer),
    setOptimization: optimizer.setOptimization.bind(optimizer),
    getOptimization: optimizer.getOptimization.bind(optimizer),
    getAllOptimizations: optimizer.getAllOptimizations.bind(optimizer),
    resetOptimizations: optimizer.resetOptimizations.bind(optimizer),
    getMonitor: optimizer.getMonitor.bind(optimizer),
  };
}

// Singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const performanceOptimizer = new PerformanceOptimizer();
export const memoryManager = new MemoryManager();
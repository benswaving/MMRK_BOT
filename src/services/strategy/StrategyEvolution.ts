import { OHLCV } from '../types';
import { Strategy, StrategyParameters } from './Strategy';
import { StrategyOptimizer } from './StrategyOptimizer';
import { PerformanceMetrics } from '../analysis/PerformanceMetrics';

interface StrategyPerformance {
  timestamp: number;
  parameters: StrategyParameters;
  metrics: {
    sharpeRatio: number;
    winRate: number;
    maxDrawdown: number;
    profitFactor: number;
  };
}

export class StrategyEvolution {
  private static instance: StrategyEvolution;
  private performanceHistory: Map<string, StrategyPerformance[]> = new Map();
  private optimizer: StrategyOptimizer;
  private readonly evaluationPeriod = 24 * 60 * 60 * 1000; // 24 hours
  private readonly minPerformanceHistory = 7; // days

  private constructor() {
    this.optimizer = StrategyOptimizer.getInstance();
  }

  public static getInstance(): StrategyEvolution {
    if (!StrategyEvolution.instance) {
      StrategyEvolution.instance = new StrategyEvolution();
    }
    return StrategyEvolution.instance;
  }

  async evaluateAndEvolvStrategy(
    strategyId: string,
    strategy: Strategy,
    historicalData: OHLCV[]
  ): Promise<void> {
    const currentPerformance = await this.evaluateStrategy(strategy, historicalData);
    this.updatePerformanceHistory(strategyId, currentPerformance);

    if (this.shouldOptimize(strategyId)) {
      await this.evolveStrategy(strategy, historicalData);
    }
  }

  private async evaluateStrategy(
    strategy: Strategy,
    data: OHLCV[]
  ): Promise<StrategyPerformance> {
    const trades = await strategy.backtest(data);
    const metrics = PerformanceMetrics.calculatePerformanceMetrics(data, trades);

    return {
      timestamp: Date.now(),
      parameters: strategy.getParameters(),
      metrics: {
        sharpeRatio: metrics.sharpeRatio,
        winRate: metrics.winRate,
        maxDrawdown: metrics.maxDrawdown,
        profitFactor: metrics.profitFactor,
      },
    };
  }

  private updatePerformanceHistory(
    strategyId: string,
    performance: StrategyPerformance
  ): void {
    const history = this.performanceHistory.get(strategyId) || [];
    history.push(performance);

    // Keep only recent history
    const cutoffTime = Date.now() - (this.minPerformanceHistory * 24 * 60 * 60 * 1000);
    const recentHistory = history.filter(p => p.timestamp >= cutoffTime);
    
    this.performanceHistory.set(strategyId, recentHistory);
  }

  private shouldOptimize(strategyId: string): boolean {
    const history = this.performanceHistory.get(strategyId);
    if (!history || history.length < 2) return false;

    const recent = history[history.length - 1].metrics;
    const previous = history[history.length - 2].metrics;

    // Check if performance has degraded
    return (
      recent.sharpeRatio < previous.sharpeRatio * 0.9 ||
      recent.winRate < previous.winRate * 0.9 ||
      recent.maxDrawdown > previous.maxDrawdown * 1.1 ||
      recent.profitFactor < previous.profitFactor * 0.9
    );
  }

  private async evolveStrategy(
    strategy: Strategy,
    data: OHLCV[]
  ): Promise<void> {
    const parameterRanges = strategy.getParameterRanges();
    const optimizedParameters = await this.optimizer.optimizeStrategy(
      strategy,
      data,
      parameterRanges
    );
    
    strategy.setParameters(optimizedParameters);
  }

  getPerformanceHistory(strategyId: string): StrategyPerformance[] {
    return this.performanceHistory.get(strategyId) || [];
  }

  getLatestPerformance(strategyId: string): StrategyPerformance | null {
    const history = this.performanceHistory.get(strategyId);
    return history ? history[history.length - 1] : null;
  }
}
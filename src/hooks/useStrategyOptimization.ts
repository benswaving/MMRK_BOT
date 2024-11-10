import { useState, useEffect, useCallback } from 'react';
import { StrategyEvolution } from '../services/strategy/StrategyEvolution';
import { StrategyOptimizer } from '../services/strategy/StrategyOptimizer';
import { ParameterTuner } from '../services/strategy/ParameterTuner';
import type { Strategy } from '../services/strategy/Strategy';
import type { OHLCV } from '../types/trading';

export const useStrategyOptimization = (
  strategyId: string,
  strategy: Strategy,
  historicalData: OHLCV[]
) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const evolution = StrategyEvolution.getInstance();
  const optimizer = StrategyOptimizer.getInstance();
  const tuner = ParameterTuner.getInstance();

  const performanceHistory = evolution.getPerformanceHistory(strategyId);
  const latestPerformance = evolution.getLatestPerformance(strategyId);

  const optimizeStrategy = useCallback(async () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      // Evaluate current performance
      await evolution.evaluateAndEvolvStrategy(strategyId, strategy, historicalData);
      setOptimizationProgress(50);

      // Fine-tune parameters
      const currentPerformance = latestPerformance?.metrics.sharpeRatio || 0;
      const optimizedParameters = await tuner.tuneParameters(
        strategy,
        historicalData,
        currentPerformance
      );
      
      strategy.setParameters(optimizedParameters);
      setOptimizationProgress(100);
      setLastOptimization(new Date());
    } catch (error) {
      console.error('Strategy optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [strategyId, strategy, historicalData, isOptimizing, latestPerformance]);

  // Auto-optimization
  useEffect(() => {
    const optimizationInterval = setInterval(() => {
      if (!isOptimizing && historicalData.length > 0) {
        optimizeStrategy();
      }
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(optimizationInterval);
  }, [optimizeStrategy, isOptimizing, historicalData]);

  return {
    isOptimizing,
    optimizationProgress,
    lastOptimization,
    performanceHistory,
    latestPerformance,
    optimizeStrategy,
  };
};
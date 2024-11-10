import { Decimal } from 'decimal.js';
import { OHLCV } from '../types';
import { Strategy, StrategyParameters } from './Strategy';

interface ParameterSensitivity {
  parameter: string;
  sensitivity: number;
}

export class ParameterTuner {
  private static instance: ParameterTuner;
  private readonly learningRate = 0.01;
  private readonly momentumFactor = 0.9;
  private readonly gradientHistory: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ParameterTuner {
    if (!ParameterTuner.instance) {
      ParameterTuner.instance = new ParameterTuner();
    }
    return ParameterTuner.instance;
  }

  async tuneParameters(
    strategy: Strategy,
    data: OHLCV[],
    currentPerformance: number
  ): Promise<StrategyParameters> {
    const parameters = strategy.getParameters();
    const sensitivities = await this.calculateParameterSensitivities(
      strategy,
      data,
      parameters,
      currentPerformance
    );

    const tuningSteps = this.calculateTuningSteps(sensitivities);
    return this.applyTuningSteps(parameters, tuningSteps);
  }

  private async calculateParameterSensitivities(
    strategy: Strategy,
    data: OHLCV[],
    parameters: StrategyParameters,
    basePerformance: number
  ): Promise<ParameterSensitivity[]> {
    const sensitivities: ParameterSensitivity[] = [];
    const delta = 0.01; // Small change for gradient calculation

    for (const param in parameters) {
      const originalValue = parameters[param];
      
      // Test parameter increase
      parameters[param] = originalValue * (1 + delta);
      strategy.setParameters(parameters);
      const upperPerformance = await this.evaluatePerformance(strategy, data);

      // Test parameter decrease
      parameters[param] = originalValue * (1 - delta);
      strategy.setParameters(parameters);
      const lowerPerformance = await this.evaluatePerformance(strategy, data);

      // Calculate gradient
      const gradient = (upperPerformance - lowerPerformance) / (2 * delta * originalValue);
      
      sensitivities.push({
        parameter: param,
        sensitivity: gradient,
      });

      // Restore original value
      parameters[param] = originalValue;
    }

    return sensitivities;
  }

  private calculateTuningSteps(
    sensitivities: ParameterSensitivity[]
  ): Map<string, number> {
    const steps = new Map<string, number>();

    for (const { parameter, sensitivity } of sensitivities) {
      const previousGradient = this.gradientHistory.get(parameter) || 0;
      const momentum = previousGradient * this.momentumFactor;
      const step = this.learningRate * sensitivity + momentum;
      
      steps.set(parameter, step);
      this.gradientHistory.set(parameter, sensitivity);
    }

    return steps;
  }

  private applyTuningSteps(
    parameters: StrategyParameters,
    steps: Map<string, number>
  ): StrategyParameters {
    const newParameters: StrategyParameters = { ...parameters };

    for (const [param, step] of steps.entries()) {
      const currentValue = parameters[param];
      const newValue = new Decimal(currentValue)
        .times(new Decimal(1).plus(step))
        .toNumber();
      
      // Apply bounds (prevent parameters from changing too drastically)
      newParameters[param] = Math.max(
        currentValue * 0.5,
        Math.min(currentValue * 1.5, newValue)
      );
    }

    return newParameters;
  }

  private async evaluatePerformance(
    strategy: Strategy,
    data: OHLCV[]
  ): Promise<number> {
    const trades = await strategy.backtest(data);
    
    // Calculate various performance metrics
    let performance = 0;
    let capital = 10000; // Initial capital
    
    for (const trade of trades) {
      const pnl = trade.exitPrice - trade.entryPrice;
      const returnPct = pnl / trade.entryPrice;
      capital *= (1 + returnPct);
    }
    
    // Consider multiple factors in performance
    performance += (capital - 10000) / 10000; // Returns
    performance += Math.sqrt(trades.length) / 10; // Trade frequency
    performance -= Math.max(0, this.calculateMaxDrawdown(trades) - 0.1) * 2; // Penalize large drawdowns
    
    return performance;
  }

  private calculateMaxDrawdown(trades: any[]): number {
    let peak = 10000;
    let maxDrawdown = 0;
    let currentCapital = 10000;

    for (const trade of trades) {
      const pnl = trade.exitPrice - trade.entryPrice;
      const returnPct = pnl / trade.entryPrice;
      currentCapital *= (1 + returnPct);

      if (currentCapital > peak) {
        peak = currentCapital;
      }

      const drawdown = (peak - currentCapital) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }
}
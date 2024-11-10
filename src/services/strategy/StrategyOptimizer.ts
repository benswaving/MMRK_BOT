import { Decimal } from 'decimal.js';
import type { OHLCV } from '../types';
import { PerformanceMetrics } from '../analysis/PerformanceMetrics';
import { Strategy, StrategyParameters } from './Strategy';

export class StrategyOptimizer {
  private static instance: StrategyOptimizer;
  private readonly populationSize = 50;
  private readonly generations = 100;
  private readonly mutationRate = 0.1;
  private readonly eliteCount = 5;

  private constructor() {}

  public static getInstance(): StrategyOptimizer {
    if (!StrategyOptimizer.instance) {
      StrategyOptimizer.instance = new StrategyOptimizer();
    }
    return StrategyOptimizer.instance;
  }

  async optimizeStrategy(
    strategy: Strategy,
    historicalData: OHLCV[],
    parameterRanges: Record<string, { min: number; max: number }>
  ): Promise<StrategyParameters> {
    let population = this.initializePopulation(parameterRanges);
    let bestParameters = population[0];
    let bestFitness = -Infinity;

    for (let generation = 0; generation < this.generations; generation++) {
      const fitnessScores = await Promise.all(
        population.map(params => this.evaluateParameters(strategy, params, historicalData))
      );

      // Update best parameters
      const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
      if (fitnessScores[bestIndex] > bestFitness) {
        bestFitness = fitnessScores[bestIndex];
        bestParameters = population[bestIndex];
      }

      // Create next generation
      population = this.evolvePopulation(population, fitnessScores);
    }

    return bestParameters;
  }

  private initializePopulation(
    parameterRanges: Record<string, { min: number; max: number }>
  ): StrategyParameters[] {
    const population: StrategyParameters[] = [];

    for (let i = 0; i < this.populationSize; i++) {
      const parameters: StrategyParameters = {};
      
      for (const [param, range] of Object.entries(parameterRanges)) {
        parameters[param] = Math.random() * (range.max - range.min) + range.min;
      }
      
      population.push(parameters);
    }

    return population;
  }

  private async evaluateParameters(
    strategy: Strategy,
    parameters: StrategyParameters,
    data: OHLCV[]
  ): Promise<number> {
    strategy.setParameters(parameters);
    const trades = await strategy.backtest(data);
    
    const metrics = PerformanceMetrics.calculatePerformanceMetrics(data, trades);
    
    // Calculate fitness score based on multiple metrics
    return (
      metrics.sharpeRatio * 0.4 +
      (metrics.winRate / 100) * 0.3 +
      (1 - metrics.maxDrawdown / 100) * 0.2 +
      metrics.profitFactor * 0.1
    );
  }

  private evolvePopulation(
    population: StrategyParameters[],
    fitnessScores: number[]
  ): StrategyParameters[] {
    const nextGeneration: StrategyParameters[] = [];

    // Keep elite individuals
    const sortedIndices = fitnessScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.index);

    for (let i = 0; i < this.eliteCount; i++) {
      nextGeneration.push({ ...population[sortedIndices[i]] });
    }

    // Generate rest of the population through crossover and mutation
    while (nextGeneration.length < this.populationSize) {
      const parent1 = this.selectParent(population, fitnessScores);
      const parent2 = this.selectParent(population, fitnessScores);
      
      const child = this.crossover(parent1, parent2);
      this.mutate(child);
      
      nextGeneration.push(child);
    }

    return nextGeneration;
  }

  private selectParent(
    population: StrategyParameters[],
    fitnessScores: number[]
  ): StrategyParameters {
    const totalFitness = fitnessScores.reduce((sum, score) => sum + Math.max(0, score), 0);
    let random = Math.random() * totalFitness;
    
    for (let i = 0; i < population.length; i++) {
      random -= Math.max(0, fitnessScores[i]);
      if (random <= 0) {
        return population[i];
      }
    }
    
    return population[population.length - 1];
  }

  private crossover(
    parent1: StrategyParameters,
    parent2: StrategyParameters
  ): StrategyParameters {
    const child: StrategyParameters = {};
    
    for (const param in parent1) {
      child[param] = Math.random() < 0.5 ? parent1[param] : parent2[param];
    }
    
    return child;
  }

  private mutate(parameters: StrategyParameters): void {
    for (const param in parameters) {
      if (Math.random() < this.mutationRate) {
        parameters[param] *= 0.8 + Math.random() * 0.4; // Mutate by ±20%
      }
    }
  }
}
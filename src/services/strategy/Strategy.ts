import { OHLCV } from '../types';
import { MovingAverages } from '../indicators/MovingAverages';
import { RSI } from '../indicators/RSI';
import { MACD } from '../indicators/MACD';
import { BollingerBands } from '../indicators/BollingerBands';

export interface StrategyParameters {
  [key: string]: number;
}

export interface StrategyCondition {
  indicator: string;
  comparison: 'above' | 'below' | 'crosses_above' | 'crosses_below';
  value: number | string;
}

export interface StrategyRule {
  type: 'entry' | 'exit';
  side: 'long' | 'short';
  conditions: StrategyCondition[];
  operator: 'and' | 'or';
}

export class Strategy {
  private name: string;
  private description: string;
  private parameters: StrategyParameters;
  private rules: StrategyRule[];
  private indicators: Map<string, any[]> = new Map();

  constructor(
    name: string,
    description: string,
    parameters: StrategyParameters,
    rules: StrategyRule[]
  ) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.rules = rules;
  }

  async backtest(data: OHLCV[]) {
    const trades = [];
    let position = null;

    // Calculate all indicators first
    this.calculateIndicators(data);

    for (let i = 50; i < data.length; i++) {
      const candle = data[i];
      const indicatorValues = this.getIndicatorValues(i);

      // Check entry conditions if no position
      if (!position) {
        for (const rule of this.rules.filter(r => r.type === 'entry')) {
          if (this.evaluateRule(rule, indicatorValues)) {
            position = {
              side: rule.side,
              entryPrice: candle.close,
              entryTime: candle.timestamp,
              size: 1, // This would be calculated based on position sizing rules
            };
            break;
          }
        }
      }
      // Check exit conditions if in position
      else {
        for (const rule of this.rules.filter(r => r.type === 'exit')) {
          if (this.evaluateRule(rule, indicatorValues)) {
            trades.push({
              ...position,
              exitPrice: candle.close,
              exitTime: candle.timestamp,
              pnl: position.side === 'long'
                ? (candle.close - position.entryPrice) * position.size
                : (position.entryPrice - candle.close) * position.size,
            });
            position = null;
            break;
          }
        }
      }
    }

    return trades;
  }

  private calculateIndicators(data: OHLCV[]) {
    // Calculate SMA
    this.indicators.set('sma20', MovingAverages.calculateSMA(data, this.parameters.smaPeriod || 20));
    this.indicators.set('sma50', MovingAverages.calculateSMA(data, this.parameters.smaPeriod || 50));

    // Calculate RSI
    this.indicators.set('rsi', RSI.calculate(data, this.parameters.rsiPeriod || 14));

    // Calculate MACD
    const macd = MACD.calculate(
      data,
      this.parameters.macdFast || 12,
      this.parameters.macdSlow || 26,
      this.parameters.macdSignal || 9
    );
    this.indicators.set('macd', macd);

    // Calculate Bollinger Bands
    const bb = BollingerBands.calculate(
      data,
      this.parameters.bbPeriod || 20,
      this.parameters.bbStdDev || 2
    );
    this.indicators.set('bb', bb);
  }

  private getIndicatorValues(index: number) {
    const values: { [key: string]: number } = {};
    
    this.indicators.forEach((indicator, name) => {
      if (indicator[index]) {
        if (name === 'macd') {
          values.macd = indicator[index].macd;
          values.macdSignal = indicator[index].signal;
          values.macdHistogram = indicator[index].histogram;
        } else if (name === 'bb') {
          values.bbUpper = indicator[index].upper;
          values.bbMiddle = indicator[index].middle;
          values.bbLower = indicator[index].lower;
        } else {
          values[name] = indicator[index].value;
        }
      }
    });

    return values;
  }

  private evaluateRule(rule: StrategyRule, values: { [key: string]: number }): boolean {
    return rule.operator === 'and'
      ? rule.conditions.every(c => this.evaluateCondition(c, values))
      : rule.conditions.some(c => this.evaluateCondition(c, values));
  }

  private evaluateCondition(
    condition: StrategyCondition,
    values: { [key: string]: number }
  ): boolean {
    const value = values[condition.indicator];
    const threshold = typeof condition.value === 'string'
      ? values[condition.value]
      : condition.value;

    switch (condition.comparison) {
      case 'above':
        return value > threshold;
      case 'below':
        return value < threshold;
      case 'crosses_above':
        return value > threshold && values[`prev_${condition.indicator}`] <= threshold;
      case 'crosses_below':
        return value < threshold && values[`prev_${condition.indicator}`] >= threshold;
      default:
        return false;
    }
  }

  setParameters(parameters: StrategyParameters) {
    this.parameters = { ...this.parameters, ...parameters };
  }

  getParameters(): StrategyParameters {
    return this.parameters;
  }

  getParameterRanges() {
    return {
      smaPeriod: { min: 5, max: 200 },
      rsiPeriod: { min: 7, max: 30 },
      macdFast: { min: 8, max: 20 },
      macdSlow: { min: 20, max: 40 },
      macdSignal: { min: 5, max: 15 },
      bbPeriod: { min: 10, max: 50 },
      bbStdDev: { min: 1.5, max: 3 },
    };
  }
}
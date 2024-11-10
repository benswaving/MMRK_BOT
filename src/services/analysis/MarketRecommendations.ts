import { OHLCV } from '../types';
import { PatternRecognition } from './PatternRecognition';
import { PerformanceMetrics } from './PerformanceMetrics';
import { MovingAverages } from '../indicators/MovingAverages';
import { RSI } from '../indicators/RSI';
import { MACD } from '../indicators/MACD';
import { BollingerBands } from '../indicators/BollingerBands';

export interface MarketRecommendation {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  signals: string[];
  riskLevel: 'low' | 'medium' | 'high';
  stopLoss?: number;
  takeProfit?: number;
}

export class MarketRecommendations {
  static analyze(data: OHLCV[], trades: any[]): MarketRecommendation {
    const signals: string[] = [];
    let bullishSignals = 0;
    let bearishSignals = 0;
    let totalSignals = 0;

    // Technical Analysis
    const lastCandle = data[data.length - 1];
    const trend = PatternRecognition.identifyTrend(data);
    const trendStrength = PatternRecognition.getTrendStrength(data);
    
    // Pattern Analysis
    if (PatternRecognition.isDoji(lastCandle)) {
      signals.push('Doji pattern detected - potential trend reversal');
      totalSignals++;
    }
    
    if (PatternRecognition.isHammer(lastCandle)) {
      signals.push('Hammer pattern detected - potential bullish reversal');
      bullishSignals++;
      totalSignals++;
    }
    
    if (PatternRecognition.isEngulfing(data, data.length - 1)) {
      const direction = lastCandle.close > lastCandle.open ? 'bullish' : 'bearish';
      signals.push(`${direction.charAt(0).toUpperCase() + direction.slice(1)} engulfing pattern detected`);
      direction === 'bullish' ? bullishSignals++ : bearishSignals++;
      totalSignals++;
    }

    // Moving Averages
    const sma20 = MovingAverages.calculateSMA(data, 20);
    const sma50 = MovingAverages.calculateSMA(data, 50);
    const sma200 = MovingAverages.calculateSMA(data, 200);
    
    const lastSMA20 = sma20[sma20.length - 1].value;
    const lastSMA50 = sma50[sma50.length - 1].value;
    const lastSMA200 = sma200[sma200.length - 1].value;
    
    if (lastSMA20 > lastSMA50 && lastSMA50 > lastSMA200) {
      signals.push('Bullish moving average alignment');
      bullishSignals++;
      totalSignals++;
    } else if (lastSMA20 < lastSMA50 && lastSMA50 < lastSMA200) {
      signals.push('Bearish moving average alignment');
      bearishSignals++;
      totalSignals++;
    }

    // RSI Analysis
    const rsi = RSI.calculate(data);
    const lastRSI = rsi[rsi.length - 1].value;
    
    if (lastRSI < 30) {
      signals.push('RSI indicates oversold conditions');
      bullishSignals++;
      totalSignals++;
    } else if (lastRSI > 70) {
      signals.push('RSI indicates overbought conditions');
      bearishSignals++;
      totalSignals++;
    }

    // MACD Analysis
    const macd = MACD.calculate(data);
    const lastMACD = macd[macd.length - 1];
    
    if (lastMACD.histogram > 0 && lastMACD.histogram > macd[macd.length - 2].histogram) {
      signals.push('MACD showing bullish momentum');
      bullishSignals++;
      totalSignals++;
    } else if (lastMACD.histogram < 0 && lastMACD.histogram < macd[macd.length - 2].histogram) {
      signals.push('MACD showing bearish momentum');
      bearishSignals++;
      totalSignals++;
    }

    // Bollinger Bands Analysis
    const bb = BollingerBands.calculate(data);
    const lastBB = bb[bb.length - 1];
    
    if (lastCandle.close < lastBB.lower) {
      signals.push('Price below lower Bollinger Band - potential oversold');
      bullishSignals++;
      totalSignals++;
    } else if (lastCandle.close > lastBB.upper) {
      signals.push('Price above upper Bollinger Band - potential overbought');
      bearishSignals++;
      totalSignals++;
    }

    // Volume Analysis
    if (PatternRecognition.isVolumeBreakout(data, data.length - 1)) {
      const direction = lastCandle.close > lastCandle.open ? 'bullish' : 'bearish';
      signals.push(`Volume breakout with ${direction} price action`);
      direction === 'bullish' ? bullishSignals++ : bearishSignals++;
      totalSignals++;
    }

    // Performance Metrics
    const metrics = PerformanceMetrics.calculatePerformanceMetrics(data, trades);
    const volatilityMetrics = PerformanceMetrics.calculateVolatilityMetrics(data);
    
    // Risk Assessment
    const riskLevel = this.assessRiskLevel(volatilityMetrics, metrics);
    
    // Calculate confidence
    const confidence = Math.abs(bullishSignals - bearishSignals) / totalSignals * 100;
    
    // Determine action
    let action: 'buy' | 'sell' | 'hold';
    if (confidence >= 60) {
      action = bullishSignals > bearishSignals ? 'buy' : 'sell';
    } else {
      action = 'hold';
    }

    // Calculate stop loss and take profit levels
    const stopLoss = this.calculateStopLoss(lastCandle, volatilityMetrics.averageTrueRange, action);
    const takeProfit = this.calculateTakeProfit(lastCandle, stopLoss, action);

    return {
      action,
      confidence,
      signals,
      riskLevel,
      stopLoss,
      takeProfit
    };
  }

  private static assessRiskLevel(
    volatilityMetrics: any,
    performanceMetrics: any
  ): 'low' | 'medium' | 'high' {
    const volatilityScore = volatilityMetrics.standardDeviation * 100;
    const drawdownScore = performanceMetrics.maxDrawdown;
    const sharpeScore = performanceMetrics.sharpeRatio;

    const riskScore = (volatilityScore * 0.4) + (drawdownScore * 0.4) + ((2 - sharpeScore) * 0.2);

    if (riskScore < 15) return 'low';
    if (riskScore < 30) return 'medium';
    return 'high';
  }

  private static calculateStopLoss(
    lastCandle: OHLCV,
    atr: number,
    action: 'buy' | 'sell' | 'hold'
  ): number {
    if (action === 'hold') return 0;
    const multiplier = 2;
    return action === 'buy'
      ? lastCandle.close - (atr * multiplier)
      : lastCandle.close + (atr * multiplier);
  }

  private static calculateTakeProfit(
    lastCandle: OHLCV,
    stopLoss: number,
    action: 'buy' | 'sell' | 'hold'
  ): number {
    if (action === 'hold') return 0;
    const riskDistance = Math.abs(lastCandle.close - stopLoss);
    return action === 'buy'
      ? lastCandle.close + (riskDistance * 2)
      : lastCandle.close - (riskDistance * 2);
  }
}
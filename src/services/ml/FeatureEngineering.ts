import { OHLCV } from '../types';
import { MovingAverages } from '../indicators/MovingAverages';
import { RSI } from '../indicators/RSI';
import { MACD } from '../indicators/MACD';
import { BollingerBands } from '../indicators/BollingerBands';
import { Decimal } from 'decimal.js';

export class FeatureEngineering {
  static engineerFeatures(data: OHLCV[]) {
    const features = [];
    
    for (let i = 0; i < data.length; i++) {
      const candle = data[i];
      const slice = data.slice(0, i + 1);
      
      // Price features
      const priceFeatures = this.calculatePriceFeatures(candle);
      
      // Technical indicators
      const technicalFeatures = this.calculateTechnicalFeatures(slice);
      
      // Volume features
      const volumeFeatures = this.calculateVolumeFeatures(slice);
      
      // Volatility features
      const volatilityFeatures = this.calculateVolatilityFeatures(slice);
      
      features.push({
        ...priceFeatures,
        ...technicalFeatures,
        ...volumeFeatures,
        ...volatilityFeatures,
        target: i < data.length - 1 ? data[i + 1].close : null,
      });
    }
    
    return this.normalizeFeatures(features);
  }

  private static calculatePriceFeatures(candle: OHLCV) {
    const bodySize = Math.abs(candle.close - candle.open);
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const totalRange = candle.high - candle.low;

    return {
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      bodySize,
      upperWick,
      lowerWick,
      totalRange,
      bodyToRangeRatio: bodySize / totalRange,
    };
  }

  private static calculateTechnicalFeatures(data: OHLCV[]) {
    if (data.length < 50) {
      return {
        sma20: null,
        sma50: null,
        rsi: null,
        macd: null,
        signal: null,
        histogram: null,
        bbUpper: null,
        bbLower: null,
        bbWidth: null,
      };
    }

    // Moving Averages
    const sma20 = MovingAverages.calculateSMA(data, 20);
    const sma50 = MovingAverages.calculateSMA(data, 50);
    
    // RSI
    const rsi = RSI.calculate(data);
    
    // MACD
    const macd = MACD.calculate(data);
    
    // Bollinger Bands
    const bb = BollingerBands.calculate(data);
    
    const lastIndex = data.length - 1;
    const lastBB = bb[bb.length - 1];
    const bbWidth = (lastBB.upper - lastBB.lower) / lastBB.middle;

    return {
      sma20: sma20[sma20.length - 1]?.value,
      sma50: sma50[sma50.length - 1]?.value,
      rsi: rsi[rsi.length - 1]?.value,
      macd: macd[macd.length - 1]?.macd,
      signal: macd[macd.length - 1]?.signal,
      histogram: macd[macd.length - 1]?.histogram,
      bbUpper: lastBB?.upper,
      bbLower: lastBB?.lower,
      bbWidth,
    };
  }

  private static calculateVolumeFeatures(data: OHLCV[]) {
    const volume = data[data.length - 1].volume;
    
    if (data.length < 20) {
      return {
        volume,
        volumeSMA20: null,
        volumeRatio: null,
      };
    }

    const volumeHistory = data.slice(-20).map(d => d.volume);
    const volumeSMA20 = volumeHistory.reduce((a, b) => a + b, 0) / 20;
    const volumeRatio = volume / volumeSMA20;

    return {
      volume,
      volumeSMA20,
      volumeRatio,
    };
  }

  private static calculateVolatilityFeatures(data: OHLCV[]) {
    if (data.length < 20) {
      return {
        volatility: null,
        atr: null,
      };
    }

    // Calculate returns
    const returns = data.slice(-20).map((d, i, arr) => {
      if (i === 0) return 0;
      return (d.close - arr[i - 1].close) / arr[i - 1].close;
    });

    // Calculate volatility (standard deviation of returns)
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
    );

    // Calculate ATR
    const trueRanges = data.slice(-20).map((d, i, arr) => {
      if (i === 0) return d.high - d.low;
      const prevClose = arr[i - 1].close;
      return Math.max(
        d.high - d.low,
        Math.abs(d.high - prevClose),
        Math.abs(d.low - prevClose)
      );
    });
    const atr = trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length;

    return {
      volatility,
      atr,
    };
  }

  private static normalizeFeatures(features: any[]) {
    const numericColumns = Object.keys(features[0]).filter(
      key => typeof features[0][key] === 'number' && features[0][key] !== null
    );

    const stats = numericColumns.reduce((acc, col) => {
      const values = features.map(f => f[col]).filter(v => v !== null);
      const min = Math.min(...values);
      const max = Math.max(...values);
      acc[col] = { min, max };
      return acc;
    }, {} as Record<string, { min: number; max: number }>);

    return features.map(feature => {
      const normalized = { ...feature };
      numericColumns.forEach(col => {
        if (feature[col] !== null) {
          normalized[col] = (feature[col] - stats[col].min) / 
            (stats[col].max - stats[col].min);
        }
      });
      return normalized;
    });
  }
}
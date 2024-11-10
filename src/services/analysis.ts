import { OHLCV } from '../types/trading';

export const analyzeMarketData = (data: OHLCV[]) => {
  // Basic trend analysis
  const prices = data.map(d => d.close);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  
  return {
    trend: sma20 > sma50 ? 'bullish' : 'bearish',
    momentum: calculateRSI(prices),
    volatility: calculateATR(data)
  };
};

const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1];
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
};

const calculateRSI = (prices: number[]): number => {
  const period = 14;
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < period + 1; i++) {
    const difference = prices[prices.length - i] - prices[prices.length - i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  return 100 - (100 / (1 + (avgGain / (avgLoss || 1))));
};

const calculateATR = (data: OHLCV[]): number => {
  const period = 14;
  if (data.length < 2) return 0;

  const trueRanges = data.slice(1).map((candle, i) => {
    const previousClose = data[i].close;
    const high = candle.high;
    const low = candle.low;
    
    return Math.max(
      high - low,
      Math.abs(high - previousClose),
      Math.abs(low - previousClose)
    );
  });

  return trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
};
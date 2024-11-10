import { useCallback } from 'react';
import { PatternRecognition } from '../services/analysis/PatternRecognition';
import { HistoricalDataService } from '../services/analysis/HistoricalDataService';
import type { OHLCV } from '../types/trading';

export const useMarketAnalysis = () => {
  const historicalData = HistoricalDataService.getInstance();

  const analyzeMarket = useCallback((symbol: string, data: OHLCV[]) => {
    // Update historical data
    historicalData.addData(symbol, data);

    // Get recent data for analysis
    const recentData = historicalData.getData(symbol, 50);
    const lastCandle = recentData[recentData.length - 1];
    const currentIndex = recentData.length - 1;

    // Pattern analysis
    const patterns = {
      isDoji: PatternRecognition.isDoji(lastCandle),
      isHammer: PatternRecognition.isHammer(lastCandle),
      isEngulfing: PatternRecognition.isEngulfing(recentData, currentIndex),
      hasVolumeBreakout: PatternRecognition.isVolumeBreakout(recentData, currentIndex)
    };

    // Trend analysis
    const trend = PatternRecognition.identifyTrend(recentData);
    const trendStrength = PatternRecognition.getTrendStrength(recentData);

    // Support/Resistance levels
    const levels = PatternRecognition.findSupportResistance(recentData);

    // Market statistics
    const volatility = historicalData.calculateVolatility(symbol);
    const averageVolume = historicalData.calculateAverageVolume(symbol);

    return {
      patterns,
      trend,
      trendStrength,
      levels,
      statistics: {
        volatility,
        averageVolume
      }
    };
  }, []);

  return {
    analyzeMarket
  };
};
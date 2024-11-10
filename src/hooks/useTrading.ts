import { useState, useEffect } from 'react';
import { PredictionService } from '../services/ml/PredictionService';
import { MarketService } from '../services/kucoin/market';
import { usePaperTrading } from './usePaperTrading';
import type { OHLCV, Trade } from '../types/trading';

export const useTrading = (symbol: string) => {
  const [marketData, setMarketData] = useState<OHLCV[]>([]);
  const [predictions, setPredictions] = useState<{
    predictedPrice: number;
    confidence: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const predictionService = PredictionService.getInstance();
  const { executeOrder, positions, balance } = usePaperTrading();

  useEffect(() => {
    const marketService = MarketService.getInstance();
    let mounted = true;

    const handleMarketUpdate = async (event: CustomEvent<OHLCV>) => {
      if (!mounted) return;

      setMarketData(prev => [...prev, event.detail]);

      try {
        // Get ML predictions when we receive new market data
        const prediction = await predictionService.getPrediction(symbol);
        setPredictions(prediction);
      } catch (err) {
        console.error('Prediction error:', err);
      }
    };

    const initialize = async () => {
      try {
        setIsLoading(true);
        // Initialize ML model
        await predictionService.initialize();
        
        // Subscribe to market data
        window.addEventListener('market-update', handleMarketUpdate as EventListener);
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize trading');
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
      window.removeEventListener('market-update', handleMarketUpdate as EventListener);
    };
  }, [symbol]);

  const executeTrade = async (order: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
  }) => {
    try {
      await executeOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute trade');
    }
  };

  return {
    marketData,
    predictions,
    positions,
    balance,
    isLoading,
    error,
    executeTrade
  };
};
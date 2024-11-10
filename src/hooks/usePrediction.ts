import { useState, useEffect, useCallback } from 'react';
import { PredictionService } from '../services/ml/PredictionService';
import type { OHLCV } from '../types/trading';

export const usePrediction = (symbol: string, data: OHLCV[]) => {
  const [prediction, setPrediction] = useState<{
    predictedPrice: number;
    confidence: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictionService = PredictionService.getInstance();

  const updatePrediction = useCallback(async () => {
    if (data.length < 50) {
      setError('Insufficient data for prediction');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await predictionService.getPrediction(symbol);
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, data]);

  const trainModel = useCallback(async () => {
    try {
      await predictionService.trainModel(symbol);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to train model');
    }
  }, [symbol]);

  useEffect(() => {
    if (data.length >= 50) {
      updatePrediction();
    }
  }, [symbol, data, updatePrediction]);

  return {
    prediction,
    isLoading,
    error,
    updatePrediction,
    trainModel,
    isModelTrained: predictionService.isModelTrained(),
  };
};
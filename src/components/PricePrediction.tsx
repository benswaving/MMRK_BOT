import React from 'react';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';
import type { OHLCV } from '../types/trading';

interface PricePredictionProps {
  symbol: string;
  data: OHLCV[];
  prediction?: {
    predictedPrice: number;
    confidence: number;
  } | null;
}

export const PricePrediction: React.FC<PricePredictionProps> = ({
  symbol,
  data,
  prediction
}) => {
  const currentPrice = data[data.length - 1]?.close || 0;

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-400" />
        <h3 className="text-lg font-semibold">AI Price Prediction</h3>
      </div>

      {prediction ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Predicted Price</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ${prediction.predictedPrice.toLocaleString()}
              </span>
              {prediction.predictedPrice > currentPrice ? (
                <TrendingUp className="text-green-400" />
              ) : (
                <TrendingDown className="text-red-400" />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Confidence</p>
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
            <p className="text-sm mt-1">{prediction.confidence.toFixed(1)}%</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Expected Movement</p>
            <p className={`text-lg font-semibold ${
              prediction.predictedPrice > currentPrice ? 'text-green-400' : 'text-red-400'
            }`}>
              {((prediction.predictedPrice - currentPrice) / currentPrice * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};
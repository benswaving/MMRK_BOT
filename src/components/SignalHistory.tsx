import React from 'react';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

interface Signal {
  timestamp: number;
  type: 'buy' | 'sell';
  symbol: string;
  price: number;
  indicators: {
    name: string;
    value: number;
    threshold: number;
  }[];
  confidence: number;
}

interface SignalHistoryProps {
  signals: Signal[];
}

export const SignalHistory: React.FC<SignalHistoryProps> = ({ signals }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <History className="text-blue-400" />
        <h3 className="text-lg font-semibold">Signal History</h3>
      </div>

      <div className="space-y-3">
        {signals.map((signal, index) => (
          <div key={index} className="bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {signal.type === 'buy' ? (
                  <TrendingUp className="text-green-400" />
                ) : (
                  <TrendingDown className="text-red-400" />
                )}
                <span className="font-medium">{signal.symbol}</span>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(signal.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-sm text-gray-400">Price</p>
                <p className="font-medium">${signal.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Confidence</p>
                <p className="font-medium">{signal.confidence.toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-1">
              {signal.indicators.map((indicator, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-400">{indicator.name}</span>
                  <span className={indicator.value > indicator.threshold ? 'text-green-400' : 'text-red-400'}>
                    {indicator.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent } from 'lucide-react';
import { useRiskManagement } from '../hooks/useRiskManagement';

interface PositionSizeCalculatorProps {
  symbol: string;
  currentPrice: number;
  volatility: number;
  onPositionSizeCalculated: (size: number) => void;
}

export const PositionSizeCalculator: React.FC<PositionSizeCalculatorProps> = ({
  symbol,
  currentPrice,
  volatility,
  onPositionSizeCalculated,
}) => {
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [positionSize, setPositionSize] = useState<number>(0);

  const {
    calculatePositionSize,
    calculateStopLoss,
    calculateTakeProfit,
    maxRiskPerTrade,
  } = useRiskManagement();

  useEffect(() => {
    // Calculate initial stop loss based on volatility
    const initialStopLoss = calculateStopLoss(currentPrice, side, volatility);
    setStopLoss(initialStopLoss);

    // Calculate take profit based on stop loss
    const initialTakeProfit = calculateTakeProfit(currentPrice, initialStopLoss);
    setTakeProfit(initialTakeProfit);
  }, [currentPrice, side, volatility, calculateStopLoss, calculateTakeProfit]);

  useEffect(() => {
    // Calculate position size whenever relevant parameters change
    const size = calculatePositionSize(currentPrice, stopLoss, volatility);
    setPositionSize(size);
    onPositionSizeCalculated(size);
  }, [currentPrice, stopLoss, volatility, calculatePositionSize, onPositionSizeCalculated]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-blue-400" />
        <h3 className="text-lg font-semibold">Position Size Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* Trade Direction */}
        <div>
          <label className="block text-sm font-medium mb-1">Direction</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSide('long')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                side === 'long'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Long
            </button>
            <button
              onClick={() => setSide('short')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                side === 'short'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Short
            </button>
          </div>
        </div>

        {/* Entry Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Entry Price</label>
          <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
            <DollarSign size={18} className="text-gray-400" />
            <span className="ml-2">{currentPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Stop Loss */}
        <div>
          <label className="block text-sm font-medium mb-1">Stop Loss</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded-lg px-3 py-2"
          />
          <p className="text-sm text-gray-400 mt-1">
            Risk: {((Math.abs(currentPrice - stopLoss) / currentPrice) * 100).toFixed(2)}%
          </p>
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-sm font-medium mb-1">Take Profit</label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded-lg px-3 py-2"
          />
          <p className="text-sm text-gray-400 mt-1">
            Reward: {((Math.abs(takeProfit - currentPrice) / currentPrice) * 100).toFixed(2)}%
          </p>
        </div>

        {/* Position Size */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Recommended Position Size</h4>
            <div className="flex items-center gap-1">
              <Percent size={14} className="text-gray-400" />
              <span className="text-sm text-gray-400">
                {(maxRiskPerTrade * 100).toFixed(1)}% max risk
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold">
            {positionSize.toFixed(8)} {symbol.split('/')[0]}
          </p>
          <p className="text-sm text-gray-400">
            Value: ${(positionSize * currentPrice).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
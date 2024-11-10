import React, { useState } from 'react';
import { Settings, TrendingUp, DollarSign } from 'lucide-react';

interface TradingControlsProps {
  onExecuteOrder: () => void;
  onUpdateStrategy: () => void;
}

const TradingControls: React.FC<TradingControlsProps> = ({
  onExecuteOrder,
  onUpdateStrategy,
}) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Trading Controls
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setOrderType('buy')}
            className={`px-4 py-2 rounded-lg ${
              orderType === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`px-4 py-2 rounded-lg ${
              orderType === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount (USDT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              placeholder="Enter amount..."
            />
          </div>

          <button
            onClick={onExecuteOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Execute {orderType.charAt(0).toUpperCase() + orderType.slice(1)} Order
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              Auto Trading
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button
            onClick={onUpdateStrategy}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Update Strategy
          </button>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Current Strategy
            </h3>
            <p className="text-xs text-gray-400">
              MACD Crossover with RSI confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingControls;
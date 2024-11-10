import React, { useState } from 'react';
import { useTrading } from '../hooks/useTrading';

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
}

export const OrderForm: React.FC<OrderFormProps> = ({ symbol, currentPrice }) => {
  const [size, setSize] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const { placeOrder } = useTrading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await placeOrder(symbol, side, parseFloat(size), currentPrice);
      setSize('');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Side</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              side === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              side === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="size" className="block text-sm font-medium mb-1">
          Size
        </label>
        <input
          id="size"
          type="number"
          step="0.0001"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
          placeholder="Enter size..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Market Price
        </label>
        <p className="text-xl font-bold">${currentPrice.toLocaleString()}</p>
      </div>

      <button
        type="submit"
        className={`w-full py-2 px-4 rounded-lg ${
          side === 'buy'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        } text-white font-medium`}
      >
        Place {side.toUpperCase()} Order
      </button>
    </form>
  );
};
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { MarketService } from '../services/kucoin/market';
import { TOP_COINS } from '../services/kucoin/config';

interface MarketSelectorProps {
  onSymbolChange: (symbol: string) => void;
  selectedSymbol: string;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({ onSymbolChange, selectedSymbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const marketService = MarketService.getInstance();

  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const tickers = await marketService.getAllTickers();
        const symbols = TOP_COINS.map(coin => `${coin}-USDT`).filter(symbol => 
          tickers.some((ticker: any) => ticker.symbol === symbol)
        );
        setAvailableSymbols(symbols);
      } catch (error) {
        console.error('Failed to load symbols:', error);
      }
    };

    loadSymbols();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
      >
        <span>{selectedSymbol || 'Select Market'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {availableSymbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() => {
                onSymbolChange(symbol);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${
                selectedSymbol === symbol ? 'bg-gray-600' : ''
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketSelector;
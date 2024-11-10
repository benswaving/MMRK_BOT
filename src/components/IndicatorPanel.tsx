import React from 'react';
import { Settings2 } from 'lucide-react';
import type { OHLCV } from '../services/indicators/types';

interface IndicatorPanelProps {
  data: OHLCV[];
  onSettingsChange: (settings: any) => void;
}

export const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ data, onSettingsChange }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Technical Indicators</h3>
        <button className="p-2 hover:bg-gray-700 rounded-lg">
          <Settings2 size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-1">SMA (20)</h4>
          <p className="text-lg font-bold">65,432.10</p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-1">RSI (14)</h4>
          <p className="text-lg font-bold">58.32</p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-1">MACD</h4>
          <p className="text-lg font-bold">125.45</p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-1">BB Width</h4>
          <p className="text-lg font-bold">2.15%</p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-1">ATR</h4>
          <p className="text-lg font-bold">234.56</p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-1">Stoch RSI</h4>
          <p className="text-lg font-bold">82.67</p>
        </div>
      </div>
    </div>
  );
};
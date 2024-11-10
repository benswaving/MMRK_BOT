import React from 'react';
import { IndicatorControlsProps } from './types';

const IndicatorControls: React.FC<IndicatorControlsProps> = ({ 
  indicators, 
  onToggle 
}) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-slate-800 rounded-lg">
      {Object.entries(indicators).map(([key, value]) => (
        <label key={key} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={() => onToggle(key as keyof typeof indicators)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
          <span className="text-gray-200 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </label>
      ))}
    </div>
  );
};

export default IndicatorControls;
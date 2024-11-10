import React from 'react';
import { Settings2 } from 'lucide-react';

interface IndicatorSetting {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

interface IndicatorSettingsProps {
  settings: {
    sma: IndicatorSetting[];
    ema: IndicatorSetting[];
    macd: IndicatorSetting[];
    rsi: IndicatorSetting[];
    bb: IndicatorSetting[];
  };
  onSettingChange: (category: string, name: string, value: number) => void;
}

export const IndicatorSettings: React.FC<IndicatorSettingsProps> = ({
  settings,
  onSettingChange,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="text-blue-400" />
        <h3 className="text-lg font-semibold">Indicator Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Moving Averages */}
        <div>
          <h4 className="font-medium mb-3">Moving Averages</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.sma.map((setting) => (
              <div key={setting.name}>
                <label className="block text-sm text-gray-400 mb-1">
                  {setting.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                    value={setting.value}
                    onChange={(e) => onSettingChange('sma', setting.name, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{setting.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MACD Settings */}
        <div>
          <h4 className="font-medium mb-3">MACD</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.macd.map((setting) => (
              <div key={setting.name}>
                <label className="block text-sm text-gray-400 mb-1">
                  {setting.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                    value={setting.value}
                    onChange={(e) => onSettingChange('macd', setting.name, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{setting.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RSI Settings */}
        <div>
          <h4 className="font-medium mb-3">RSI</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.rsi.map((setting) => (
              <div key={setting.name}>
                <label className="block text-sm text-gray-400 mb-1">
                  {setting.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                    value={setting.value}
                    onChange={(e) => onSettingChange('rsi', setting.name, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{setting.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bollinger Bands Settings */}
        <div>
          <h4 className="font-medium mb-3">Bollinger Bands</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.bb.map((setting) => (
              <div key={setting.name}>
                <label className="block text-sm text-gray-400 mb-1">
                  {setting.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                    value={setting.value}
                    onChange={(e) => onSettingChange('bb', setting.name, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{setting.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
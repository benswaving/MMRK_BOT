import React from 'react';
import { Settings2, Play, Pause, Brain, Shield } from 'lucide-react';

interface StrategyControlsProps {
  isActive: boolean;
  mlEnabled: boolean;
  selfLearningEnabled: boolean;
  riskManagementEnabled: boolean;
  onToggleActive: () => void;
  onToggleML: () => void;
  onToggleSelfLearning: () => void;
  onToggleRiskManagement: () => void;
  onOpenSettings: () => void;
}

export const StrategyControls: React.FC<StrategyControlsProps> = ({
  isActive,
  mlEnabled,
  selfLearningEnabled,
  riskManagementEnabled,
  onToggleActive,
  onToggleML,
  onToggleSelfLearning,
  onToggleRiskManagement,
  onOpenSettings,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Strategy Controls</h3>
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings2 size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategy Status */}
        <button
          onClick={onToggleActive}
          className={`flex items-center justify-between p-3 rounded-lg ${
            isActive ? 'bg-green-600' : 'bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {isActive ? <Pause size={20} /> : <Play size={20} />}
            <span>Strategy {isActive ? 'Active' : 'Paused'}</span>
          </div>
        </button>

        {/* Machine Learning */}
        <button
          onClick={onToggleML}
          className={`flex items-center justify-between p-3 rounded-lg ${
            mlEnabled ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain size={20} />
            <span>ML Predictions</span>
          </div>
        </button>

        {/* Self Learning */}
        <button
          onClick={onToggleSelfLearning}
          className={`flex items-center justify-between p-3 rounded-lg ${
            selfLearningEnabled ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain size={20} />
            <span>Self Learning</span>
          </div>
        </button>

        {/* Risk Management */}
        <button
          onClick={onToggleRiskManagement}
          className={`flex items-center justify-between p-3 rounded-lg ${
            riskManagementEnabled ? 'bg-yellow-600' : 'bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={20} />
            <span>Risk Management</span>
          </div>
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { GameMode, AILevel } from '../types/game';
import { UserCircle2, Bot, Globe } from 'lucide-react';

interface GameControlsProps {
  gameMode: GameMode;
  aiLevel: AILevel;
  onGameModeChange: (mode: GameMode, aiLevel?: AILevel) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  aiLevel,
  onGameModeChange,
}) => {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={() => onGameModeChange('self')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          gameMode === 'self'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        <UserCircle2 className="w-5 h-5" />
        <span>Analyse</span>
      </button>

      <button
        onClick={() => onGameModeChange('online')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          gameMode === 'online'
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <Globe className="w-5 h-5" />
        <span>Trouver un adversaire</span>
      </button>

      <button
        onClick={() => onGameModeChange('ai', 'gaspard')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          gameMode === 'ai' && aiLevel === 'gaspard'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        <Bot className="w-5 h-5" />
        <span>Gaspard</span>
      </button>
    </div>
  );
}
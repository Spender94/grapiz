import React from 'react';
import { GameMode, GAME_MODES } from '../config/gameConfig';
import { Loader2, Users } from 'lucide-react';

interface GameControlsProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  isWaitingForOpponent?: boolean;
  onFindGame?: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  onGameModeChange,
  isWaitingForOpponent = false,
  onFindGame
}) => {
  if (gameMode === GAME_MODES.ONLINE && isWaitingForOpponent) {
    return (
      <div className="flex items-center gap-3 mb-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>En attente d'un adversaire...</span>
      </div>
    );
  }

  if (gameMode === GAME_MODES.LOCAL) {
    return (
      <button
        onClick={() => {
          onGameModeChange(GAME_MODES.ONLINE);
          onFindGame?.();
        }}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Users className="w-5 h-5" />
        <span>Trouver un adversaire</span>
      </button>
    );
  }

  return null;
}
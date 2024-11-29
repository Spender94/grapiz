import React from 'react';
import { GameMode, GAME_MODES } from '../config/gameConfig';

interface GameControlsProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  onSwitchPlayer?: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  onGameModeChange,
  onSwitchPlayer
}) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      <select
        value={gameMode}
        onChange={(e) => onGameModeChange(e.target.value as GameMode)}
        className="px-4 py-2 rounded-lg bg-white border border-gray-300"
      >
        <option value={GAME_MODES.LOCAL}>Mode Local</option>
        <option value={GAME_MODES.ONLINE}>Mode Online</option>
      </select>
      
      {gameMode === GAME_MODES.LOCAL && onSwitchPlayer && (
        <button
          onClick={onSwitchPlayer}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Changer de Joueur
        </button>
      )}
    </div>
  );
}
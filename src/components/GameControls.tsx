import React, { useState } from 'react';
import { GameMode, GAME_MODES } from '../config/gameConfig';
import { Loader2 } from 'lucide-react';

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
  const [hasClickedFind, setHasClickedFind] = useState(false);

  const handleModeChange = (newMode: GameMode) => {
    setHasClickedFind(false);
    onGameModeChange(newMode);
  };

  const handleFindGame = () => {
    setHasClickedFind(true);
    onFindGame?.();
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <select
        value={gameMode}
        onChange={(e) => handleModeChange(e.target.value as GameMode)}
        className="px-4 py-2 rounded-lg bg-white border border-gray-300"
        disabled={isWaitingForOpponent}
      >
        <option value={GAME_MODES.LOCAL}>Mode Local</option>
        <option value={GAME_MODES.ONLINE}>Mode Online</option>
      </select>
      
      {gameMode === GAME_MODES.ONLINE && !hasClickedFind && (
        <button
          onClick={handleFindGame}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Trouver un adversaire
        </button>
      )}

      {isWaitingForOpponent && (
        <div className="flex items-center gap-2 text-indigo-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>En attente d'un adversaire...</span>
        </div>
      )}
    </div>
  );
}
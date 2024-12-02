import React from 'react';
import { GameState } from '../types/game';
import { Timer } from './Timer';

interface GameHeaderProps {
  gameState: GameState;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ gameState }) => {
  return (
    <div className="flex w-full mb-4">
      <div className="w-1/2">
        <Timer
          player="blue"
          time={gameState.blueTime}
          isActive={gameState.currentPlayer === 'blue'}
          gameMode={gameState.gameMode}
          aiLevel={gameState.aiLevel}
        />
      </div>
      <div className="w-1/2">
        <Timer
          player="red"
          time={gameState.redTime}
          isActive={gameState.currentPlayer === 'red'}
          gameMode={gameState.gameMode}
          aiLevel={gameState.aiLevel}
        />
      </div>
    </div>
  );
}
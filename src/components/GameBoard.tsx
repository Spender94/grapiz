import React, { useState } from 'react';
import { Board } from './Board';
import { GameState, Position } from '../types/game';
import { X } from 'lucide-react';
import { ForfeitDialog } from './ForfeitDialog';
import { VictoryDialog } from './VictoryDialog';

interface GameBoardProps {
  gameState: GameState;
  onPieceClick: (pieceId: string) => void;
  onHexClick: (position: Position) => void;
  onForfeit: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onPieceClick,
  onHexClick,
  onForfeit,
}) => {
  const [showForfeitDialog, setShowForfeitDialog] = useState(false);

  return (
    <div className="w-full md:w-3/5 relative rounded-lg overflow-hidden h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F56C00] to-[#B96600]" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/80 to-transparent z-10" />
      
      {gameState.gameStatus === 'finished' && (
        <VictoryDialog winner={gameState.winner} />
      )}

      <button
        onClick={() => setShowForfeitDialog(true)}
        className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="relative z-20 h-full flex items-center justify-center">
        <Board
          gameState={gameState}
          onPieceClick={onPieceClick}
          onHexClick={onHexClick}
        />
      </div>

      <ForfeitDialog
        isOpen={showForfeitDialog}
        onClose={() => setShowForfeitDialog(false)}
        onConfirm={() => {
          setShowForfeitDialog(false);
          onForfeit();
        }}
      />
    </div>
  );
}
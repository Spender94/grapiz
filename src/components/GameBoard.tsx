import React, { useState } from 'react';
import { Board } from './Board';
import { GameState, Position } from '../types/game';
import { X } from 'lucide-react';
import { ForfeitDialog } from './ForfeitDialog';

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
    <div className="w-full md:w-3/5 relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F56C00] to-[#B96600]" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/80 to-transparent z-10" />
      
      {/* Victory Message */}
      {gameState.gameStatus === 'finished' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-2">
              {gameState.winner === null 
                ? 'Match nul !'
                : `Le joueur ${gameState.winner === 'blue' ? 'Bleu' : 'Rouge'} a gagné !`}
            </h2>
            <p className="text-gray-600">
              {gameState.winner === null 
                ? 'Les deux joueurs ont connecté leurs pions simultanément.'
                : 'Tous les pions ont été connectés !'}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForfeitDialog(true)}
        className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="relative z-20 p-4 pt-12">
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
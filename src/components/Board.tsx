import React from 'react';
import { Hexagon } from './Hexagon';
import { Piece } from './Piece';
import { generateBoard } from '../utils/boardUtils';
import { GameState, Position } from '../types/game';

interface BoardProps {
  gameState: GameState;
  onPieceClick: (pieceId: string) => void;
  onHexClick: (position: Position) => void;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  onPieceClick,
  onHexClick,
}) => {
  // Calculer la taille en fonction de la largeur de l'écran
  const isMobile = window.innerWidth < 768;
  const CELL_SIZE = isMobile ? 22 : 29;
  const board = generateBoard();
  const width = CELL_SIZE * 20;
  const height = CELL_SIZE * 20;

  // Calculate SVG center
  const centerX = width / 2;
  const centerY = height / 2;

  const handleHexOrPieceClick = (position: Position) => {
    const pieceAtPosition = gameState.pieces.find(p => 
      p.position.x === position.x && 
      p.position.y === position.y
    );

    if (pieceAtPosition) {
      if (pieceAtPosition.player === gameState.currentPlayer) {
        onPieceClick(pieceAtPosition.id);
      } else {
        const isValidMove = gameState.validMoves.some(move => 
          move.x === position.x && move.y === position.y
        );
        if (isValidMove) {
          onHexClick(position);
        }
      }
    } else {
      onHexClick(position);
    }
  };

  const scale = isMobile ? 'scale-100' : 'scale-85';

  return (
    <div className={`flex items-center justify-center w-full ${scale} transition-transform duration-300`}>
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="max-w-full max-h-full"
          style={{
            touchAction: 'manipulation',
          }}
        >
          <g transform={`translate(${centerX}, ${centerY})`}>
            {board.map((pos) => (
              <Hexagon
                key={`hex-${pos.x}-${pos.y}`}
                x={pos.x}
                y={pos.y}
                size={CELL_SIZE}
                isValid={gameState.validMoves.some(
                  move => move.x === pos.x && move.y === pos.y
                )}
                onClick={() => handleHexOrPieceClick(pos)}
              />
            ))}
            {gameState.pieces.map((piece) => (
              <Piece
                key={piece.id}
                player={piece.player}
                x={piece.position.x}
                y={piece.position.y}
                size={CELL_SIZE}
                selected={gameState.selectedPiece?.id === piece.id}
                onClick={() => handleHexOrPieceClick(piece.position)}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
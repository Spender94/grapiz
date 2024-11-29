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
  const CELL_SIZE = 48; // Increased from 40
  const board = generateBoard();
  const width = CELL_SIZE * 20;
  const height = CELL_SIZE * 20;

  // Calculate SVG center
  const centerX = width / 2;
  const centerY = height / 2;

  const handleHexOrPieceClick = (position: Position) => {
    // Check if there's a piece at this position that can be captured
    const pieceAtPosition = gameState.pieces.find(p => 
      p.position.x === position.x && 
      p.position.y === position.y
    );

    if (pieceAtPosition) {
      // If there's a piece and it's the current player's piece, select it
      if (pieceAtPosition.player === gameState.currentPlayer) {
        onPieceClick(pieceAtPosition.id);
      } else {
        // If it's an opponent's piece and it's a valid move, capture it
        const isValidMove = gameState.validMoves.some(move => 
          move.x === position.x && move.y === position.y
        );
        if (isValidMove) {
          onHexClick(position);
        }
      }
    } else {
      // If there's no piece, treat it as a regular hex click
      onHexClick(position);
    }
  };

  return (
    <div className="flex items-start justify-center w-full">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full max-h-full"
      >
        <g transform={`translate(${centerX}, ${centerY - height * 0.15})`}>
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
  );
}
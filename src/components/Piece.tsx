import React from 'react';
import { Player } from '../types/game';

interface PieceProps {
  player: Player;
  x: number;
  y: number;
  size: number;
  selected?: boolean;
  onClick?: () => void;
}

export const Piece: React.FC<PieceProps> = ({
  player,
  x,
  y,
  size,
  selected,
  onClick,
}) => {
  const SQRT3 = Math.sqrt(3);
  const pixelX = size * (3/2 * x);
  const pixelY = size * (SQRT3/2 * x + SQRT3 * y);

  const baseGradientId = `gradient-${player}-${x}-${y}`;
  const glossGradientId = `gloss-${player}-${x}-${y}`;

  return (
    <g onClick={onClick} className="cursor-pointer">
      <defs>
        {/* Base gradient for the piece */}
        <radialGradient id={baseGradientId}>
          <stop offset="0%" stopColor={player === 'blue' ? '#60A5FA' : '#EF4444'} />
          <stop offset="70%" stopColor={player === 'blue' ? '#3B82F6' : '#DC2626'} />
          <stop offset="100%" stopColor={player === 'blue' ? '#2563EB' : '#B91C1C'} />
        </radialGradient>
        {/* Gloss effect gradient */}
        <linearGradient id={glossGradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>
        {/* Base piece */}
        <circle
          cx={pixelX}
          cy={pixelY}
          r={size * 0.8}
          fill={`url(#${baseGradientId})`}
          className={`
            transition-all
            duration-200
            ${selected ? 'filter drop-shadow-lg' : ''}
          `}
          stroke={selected ? '#FCD34D' : 'white'}
          strokeWidth={selected ? 3 : 2}
        />
        {/* Gloss effect overlay */}
        <circle
          cx={pixelX}
          cy={pixelY}
          r={size * 0.8}
          fill={`url(#${glossGradientId})`}
          className="pointer-events-none"
        />
      </g>
    </g>
  );
}
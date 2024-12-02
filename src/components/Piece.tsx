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
  const pieceSize = size * 0.85;
  const padding = 1;
  const innerSize = pieceSize - padding;
  const domeOffsetY = 3; // Offset for the dome

  // Unique IDs for the gradients, masks, and filters
  const baseGradientId = `base-gradient-${player}-${x}-${y}`;
  const glossGradientId = `gloss-gradient-${player}-${x}-${y}`;
  const domeMaskId = `dome-mask-${player}-${x}-${y}`;
  const shadowId = `shadow-${player}-${x}-${y}`;

  return (
    <g onClick={onClick} className="cursor-pointer">
      <defs>
        {/* Base gradient for pieces */}
        <linearGradient id={baseGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={player === 'blue' ? '#364482' : '#7F0916'} />
          <stop offset="100%" stopColor={player === 'blue' ? '#3164FF' : '#E20009'} />
        </linearGradient>

        {/* Enhanced gloss effect gradient */}
        <linearGradient id={glossGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="40%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Dome mask with slight curve at bottom and vertical offset */}
        <mask id={domeMaskId}>
          <path
            d={`
              M ${pixelX - innerSize * 0.8} ${pixelY + domeOffsetY}
              Q ${pixelX} ${pixelY + innerSize * 0.1 + domeOffsetY} ${pixelX + innerSize * 0.8} ${pixelY + domeOffsetY}
              Q ${pixelX + innerSize * 0.8} ${pixelY - innerSize * 0.9 + domeOffsetY} ${pixelX} ${pixelY - innerSize + domeOffsetY}
              Q ${pixelX - innerSize * 0.8} ${pixelY - innerSize * 0.9 + domeOffsetY} ${pixelX - innerSize * 0.8} ${pixelY + domeOffsetY}
              Z
            `}
            fill="white"
          />
        </mask>

        {/* Drop shadow filter */}
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={selected ? `url(#${shadowId})` : undefined}
         className="transition-transform duration-200"
         style={{
           transform: selected ? 'translateY(-2px)' : 'none'
         }}>
        {/* Base piece */}
        <circle
          cx={pixelX}
          cy={pixelY}
          r={pieceSize}
          fill={`url(#${baseGradientId})`}
          className="transition-all duration-200"
          stroke={selected ? '#FCD34D' : 'white'}
          strokeWidth={selected ? 3 : 2}
        />

        {/* Gloss effect with dome shape */}
        <circle
          cx={pixelX}
          cy={pixelY}
          r={innerSize}
          fill={`url(#${glossGradientId})`}
          mask={`url(#${domeMaskId})`}
          className="pointer-events-none"
        />
      </g>
    </g>
  );
}
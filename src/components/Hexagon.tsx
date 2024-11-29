import React from 'react';

interface HexagonProps {
  x: number;
  y: number;
  size: number;
  isValid?: boolean;
  onClick?: () => void;
}

export const Hexagon: React.FC<HexagonProps> = ({ x, y, size, isValid, onClick }) => {
  const SQRT3 = Math.sqrt(3);
  const pixelX = size * (3/2 * x);
  const pixelY = size * (SQRT3/2 * x + SQRT3 * y);

  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (60 * i) * Math.PI / 180;
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    return `${px},${py}`;
  }).join(' ');

  return (
    <g
      transform={`translate(${pixelX}, ${pixelY})`}
      onClick={onClick}
      className="cursor-pointer"
    >
      <polygon
        points={points}
        className={`
          ${isValid
            ? 'fill-yellow-200/40 stroke-yellow-400/60'
            : 'fill-white stroke-[#C6C3C4]'}
          transition-colors
          duration-200
        `}
        strokeWidth="1.5"
      />
    </g>
  );
}
import React from 'react';

interface HexagonLabelProps {
  x: number;
  y: number;
  size: number;
  label: string;
}

export const HexagonLabel: React.FC<HexagonLabelProps> = ({ x, y, size, label }) => {
  // Utiliser les mêmes calculs de position que pour l'hexagone
  const SQRT3 = Math.sqrt(3);
  const pixelX = size * (SQRT3 * x + SQRT3/2 * y);
  const pixelY = size * (3/2 * y);

  return (
    <text
      x={pixelX}
      y={pixelY}
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-xs fill-gray-500 select-none"
      style={{ fontSize: size * 0.3 }}
    >
      {label}
    </text>
  );
}
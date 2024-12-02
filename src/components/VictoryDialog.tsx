import React, { useState } from 'react';
import { Player } from '../types/game';
import { X } from 'lucide-react';

interface VictoryDialogProps {
  winner: Player | null;
}

export const VictoryDialog: React.FC<VictoryDialogProps> = ({ winner }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center mx-4 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          {winner === null 
            ? 'Match nul !'
            : `Le joueur ${winner === 'blue' ? 'Bleu' : 'Rouge'} a gagné !`}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {winner === null 
            ? 'Les deux joueurs ont connecté leurs pions simultanément.'
            : winner === 'blue' 
              ? 'Le joueur Rouge a épuisé son temps !'
              : 'Le joueur Bleu a épuisé son temps !'}
        </p>
      </div>
    </div>
  );
}
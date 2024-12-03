import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OnlineMatchmakingProps {
  onCancel: () => void;
}

export const OnlineMatchmaking: React.FC<OnlineMatchmakingProps> = ({ onCancel }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold mb-2">Recherche d'adversaire...</h2>
          <p className="text-gray-600 mb-6">
            En attente d'un autre joueur pour commencer la partie.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
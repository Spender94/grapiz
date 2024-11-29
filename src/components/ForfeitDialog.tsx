import React from 'react';

interface ForfeitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ForfeitDialog: React.FC<ForfeitDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Abandonner la partie ?</h2>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir abandonner ? Cette action donnera la victoire à votre adversaire.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Abandonner
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';

interface Props {
  message: string;
  onClose: () => void;
}

export const Alert: React.FC<Props> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="rpg-panel rpg-border p-6 rounded-lg relative flex flex-col items-center">
        <p className="text-yellow-100 mb-4">{message}</p>
        <button 
          onClick={onClose}
          className="rpg-button px-4 py-2 rounded"
        >
          确定
        </button>
      </div>
    </div>
  );
}; 
import React from "react";

interface GameLogModalProps {
  log: string[];
  onClose: () => void;
}

const GameLogModal: React.FC<GameLogModalProps> = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-base-100 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Log gry</h2>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-sm space-y-1">
          {log.length === 0 ? (
            <div className="text-gray-400">Brak wpisów w logu.</div>
          ) : (
            log.map((entry, i) => <div key={i}>{i + 1}. {entry}</div>)
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLogModal; 
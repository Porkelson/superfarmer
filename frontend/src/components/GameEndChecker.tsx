import React from "react";

function GameEndChecker({ gameEnded, onReset }: { gameEnded: boolean; onReset: () => void }) {
  if (!gameEnded) return null;
  return (
    <div className="alert alert-success shadow-lg mt-4 flex justify-between items-center">
      <span>🎉 Wygrałeś!</span>
      <button className="btn btn-secondary" onClick={onReset}>Zagraj ponownie</button>
    </div>
  );
}

export default GameEndChecker; 
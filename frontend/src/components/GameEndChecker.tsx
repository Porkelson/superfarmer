import React from "react";

// Simple confetti effect using emoji (for flare without extra dependencies)
const Confetti = () => (
  <div className="absolute inset-0 flex flex-col items-center pointer-events-none select-none z-10">
    <div className="text-4xl animate-bounce">🎊 🎉 🏆 🎉 🎊</div>
  </div>
);

function GameEndChecker({ gameEnded, onReset }: { gameEnded: boolean; onReset: () => void }) {
  if (!gameEnded) return null;
  return (
    <div className="fixed top-1/2 left-1/2 z-[9999] transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex flex-col items-center pointer-events-auto">
      <Confetti />
      <div className="alert alert-success shadow-lg flex flex-col items-center p-8 text-center">
        <span className="text-3xl font-extrabold mb-2 flex items-center justify-center gap-2">🏆 Wygrałeś! 🏆</span>
        <span className="mb-4 text-lg">Gratulacje! Udało Ci się zebrać wszystkie zwierzęta.</span>
        <button className="btn btn-primary text-lg" onClick={onReset}>Zagraj ponownie</button>
      </div>
    </div>
  );
}

export default GameEndChecker; 
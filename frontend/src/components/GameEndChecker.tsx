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
    <div className="relative mt-4 flex flex-col items-center justify-center">
      <Confetti />
      <div className="alert alert-success shadow-lg flex flex-col items-center p-8 text-center max-w-lg mx-auto">
        <span className="text-3xl font-extrabold mb-2 flex items-center justify-center gap-2">🏆 Wygrałeś! 🏆</span>
        <span className="mb-4 text-lg">Gratulacje! Udało Ci się zebrać wszystkie zwierzęta.</span>
        <button className="btn btn-primary text-lg" onClick={onReset}>Zagraj ponownie</button>
      </div>
    </div>
  );
}

export default GameEndChecker; 
import React, { useEffect } from "react";
import confetti from "canvas-confetti";

interface GameEndCheckerProps {
  gameEnded: boolean;
  onReset: () => void;
}

function GameEndChecker({ gameEnded, onReset }: GameEndCheckerProps) {
  useEffect(() => {
    if (gameEnded) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [gameEnded]);

  if (!gameEnded) return null;
  return (
    <div className="fixed top-1/2 left-1/2 z-[9999] transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex flex-col items-center pointer-events-auto">
      <div className="alert alert-success shadow-lg flex flex-col items-center p-8 text-center">
        <span className="text-3xl font-extrabold mb-2 flex items-center justify-center gap-2">🏆 Wygrałeś! 🏆</span>
        <span className="mb-4 text-lg">Gratulacje! Udało Ci się zebrać wszystkie zwierzęta.</span>
        <button className="btn btn-primary text-lg" onClick={onReset}>Zagraj ponownie</button>
      </div>
    </div>
  );
}

export default GameEndChecker;
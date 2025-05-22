import React from "react";

function DiceRoller({ onRoll, diceResult, gameEnded }: { onRoll: () => void; diceResult?: { die1: string; die2: string }; gameEnded: boolean }) {
  return (
    <div className="mb-4 flex gap-2 items-center">
      <button className="btn btn-primary" onClick={onRoll} disabled={gameEnded}>
        Rzuć kostkami
      </button>
      {diceResult && (
        <div className="text-2xl font-bold">
          🎲 {diceResult.die1} & {diceResult.die2}
        </div>
      )}
    </div>
  );
}

export default DiceRoller; 
import React from "react";

interface DiceRollerProps {
  onRoll: () => void;
  diceResult?: { die1: string; die2: string };
  gameEnded: boolean;
  buttonClassName?: string;
}

function DiceRoller({ onRoll, diceResult, gameEnded, buttonClassName = "btn btn-primary" }: DiceRollerProps) {
  return (
    <div className="mb-4 flex gap-2 items-center">
      <button className="btn btn-primary h-12 text-lg" onClick={onRoll} disabled={gameEnded}>
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
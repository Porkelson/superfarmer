import React from "react";
import { Animal, GameState } from "../types";

const animalEmojis: Record<Animal, string> = {
  rabbit: "🐇",
  sheep: "🐑",
  pig: "🐖",
  cow: "🐄",
  horse: "🐎",
};

function PlayerBoard({ player }: { player: GameState["players"][0] }) {
  return (
    <div className="card bg-base-100 shadow-xl p-4 mb-4">
      <h2 className="card-title">Twoje stado</h2>
      <div className="flex gap-4 mt-2">
        {Object.entries(player.animals).map(([animal, count]) => (
          <span key={animal} className="text-2xl">
            {animalEmojis[animal as Animal]} {count}
          </span>
        ))}
        <span className="text-2xl">🐶 {player.smallDogs}</span>
        <span className="text-2xl">🐕 {player.bigDogs}</span>
      </div>
    </div>
  );
}

export default PlayerBoard; 
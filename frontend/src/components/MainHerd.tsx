import React from "react";
import { Animal, GameState } from "../types";

const animalEmojis: Record<Animal, string> = {
  rabbit: "🐇",
  sheep: "🐑",
  pig: "🐖",
  cow: "🐄",
  horse: "🐎",
};

function MainHerd({ mainHerd }: { mainHerd: GameState["mainHerd"] }) {
  return (
    <div className="card bg-base-200 shadow p-4 mb-4">
      <h2 className="card-title">Główne stado</h2>
      <div className="flex gap-4 mt-2">
        {(["rabbit", "sheep", "pig", "cow", "horse"] as Animal[]).map(animal => (
          <span key={animal} className="text-2xl">
            {animalEmojis[animal]} {mainHerd[animal]}
          </span>
        ))}
        <span className="text-2xl">🐶 {mainHerd.smallDogs}</span>
        <span className="text-2xl">🐕 {mainHerd.bigDogs}</span>
      </div>
    </div>
  );
}

export default MainHerd; 
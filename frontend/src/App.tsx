import React, { useEffect, useState } from "react";
import { Animal, Dog, GameState } from "./types";

const API_URL = "http://localhost:4000";

const animalEmojis: Record<Animal, string> = {
  rabbit: "🐇",
  sheep: "🐑",
  pig: "🐖",
  cow: "🐄",
  horse: "🐎",
};
const dogEmojis: Record<Dog, string> = {
  smallDog: "🐶",
  bigDog: "🐕",
};

const exchangeOptions = [
  { from: "rabbit", to: "sheep", label: "6 🐇 → 1 🐑" },
  { from: "sheep", to: "pig", label: "2 🐑 → 1 🐖" },
  { from: "pig", to: "cow", label: "3 🐖 → 1 🐄" },
  { from: "cow", to: "horse", label: "2 🐄 → 1 🐎" },
  { from: "sheep", to: "smallDog", label: "1 🐑 → 1 🐶" },
  { from: "cow", to: "bigDog", label: "1 🐄 → 1 🐕" },
];

function PlayerBoard({ player }: { player: GameState["players"][0] }) {
  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="font-bold mb-2">Twoje stado</h2>
      <div className="flex gap-4">
        {Object.entries(player.animals).map(([animal, count]) => (
          <div key={animal} className="text-xl">
            {animalEmojis[animal as Animal]} {count}
          </div>
        ))}
        <div>🐶 {player.smallDogs}</div>
        <div>🐕 {player.bigDogs}</div>
      </div>
    </div>
  );
}

function MainHerd({ mainHerd }: { mainHerd: GameState["mainHerd"] }) {
  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="font-bold mb-2">Główne stado</h2>
      <div className="flex gap-4">
        {(["rabbit", "sheep", "pig", "cow", "horse"] as Animal[]).map(animal => (
          <div key={animal} className="text-xl">
            {animalEmojis[animal]} {mainHerd[animal]}
          </div>
        ))}
        <div>🐶 {mainHerd.smallDogs}</div>
        <div>🐕 {mainHerd.bigDogs}</div>
      </div>
    </div>
  );
}

function DiceRoller({ onRoll, diceResult, gameEnded }: { onRoll: () => void; diceResult?: { die1: string; die2: string }; gameEnded: boolean }) {
  return (
    <div className="mb-4">
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onRoll} disabled={gameEnded}>
        Rzuć kostkami
      </button>
      {diceResult && (
        <div className="mt-2 text-2xl">
          🎲 {diceResult.die1} & {diceResult.die2}
        </div>
      )}
    </div>
  );
}

function ExchangeForm({ onExchange, disabled }: { onExchange: (from: Animal | Dog, to: Animal | Dog) => void; disabled: boolean }) {
  const [selected, setSelected] = useState(exchangeOptions[0]);
  return (
    <form
      className="mb-4 flex gap-2 items-center"
      onSubmit={e => {
        e.preventDefault();
        onExchange(selected.from as Animal | Dog, selected.to as Animal | Dog);
      }}
    >
      <select
        className="border rounded px-2 py-1"
        value={selected.label}
        onChange={e => {
          const opt = exchangeOptions.find(o => o.label === e.target.value);
          if (opt) setSelected(opt);
        }}
        disabled={disabled}
      >
        {exchangeOptions.map(opt => (
          <option key={opt.label} value={opt.label}>{opt.label}</option>
        ))}
      </select>
      <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded" disabled={disabled}>
        Wymień
      </button>
    </form>
  );
}

function GameLog({ log }: { log: string[] }) {
  return (
    <div className="p-2 border rounded h-32 overflow-y-auto bg-gray-50 text-sm">
      {log.map((entry, i) => (
        <div key={i}>{entry}</div>
      ))}
    </div>
  );
}

function GameEndChecker({ gameEnded, onReset }: { gameEnded: boolean; onReset: () => void }) {
  if (!gameEnded) return null;
  return (
    <div className="p-4 bg-green-100 border rounded mt-4">
      <div className="font-bold text-green-700">Wygrałeś!</div>
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={onReset}>
        Zagraj ponownie
      </button>
    </div>
  );
}

function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);

  // Pobierz stan gry na start
  useEffect(() => {
    fetch(`${API_URL}/game`)
      .then(res => res.json())
      .then(setGame);
  }, []);

  const roll = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/roll`, { method: "POST" });
    const data = await res.json();
    setGame(data);
    setLoading(false);
  };

  const reset = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/reset`, { method: "POST" });
    const data = await res.json();
    setGame(data);
    setLoading(false);
  };

  const exchange = async (from: Animal | Dog, to: Animal | Dog) => {
    setLoading(true);
    const res = await fetch(`${API_URL}/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    });
    const data = await res.json();
    setGame(data);
    setLoading(false);
  };

  if (!game) return <div className="p-8">Ładowanie...</div>;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">🐾 Superfarmer</h1>
      <PlayerBoard player={game.players[0]} />
      <MainHerd mainHerd={game.mainHerd} />
      <DiceRoller onRoll={roll} diceResult={game.diceResult} gameEnded={game.gameEnded || loading} />
      <ExchangeForm onExchange={exchange} disabled={game.gameEnded || loading} />
      <GameLog log={game.log} />
      <GameEndChecker gameEnded={game.gameEnded} onReset={reset} />
    </div>
  );
}

export default App;

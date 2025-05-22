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
// const dogEmojis: Record<Dog, string> = {
//   smallDog: "🐶",
//   bigDog: "🐕",
// };

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

function ExchangeTable({ onExchange, disabled }: { onExchange: (from: Animal | Dog, to: Animal | Dog) => void; disabled: boolean }) {
  return (
    <div className="card bg-base-200 shadow p-4 mb-4">
      <h2 className="card-title mb-2">Wymiana</h2>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Opcja</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exchangeOptions.map(opt => (
            <tr key={opt.label}>
              <td>{opt.label}</td>
              <td>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onExchange(opt.from as Animal | Dog, opt.to as Animal | Dog)}
                  disabled={disabled}
                >
                  Wymień
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GameLog({ log }: { log: string[] }) {
  return (
    <div className="bg-neutral text-neutral-content rounded p-2 h-32 overflow-y-auto text-sm mb-4">
      {log.map((entry, i) => (
        <div key={i}>{entry}</div>
      ))}
    </div>
  );
}

function GameEndChecker({ gameEnded, onReset }: { gameEnded: boolean; onReset: () => void }) {
  if (!gameEnded) return null;
  return (
    <div className="alert alert-success shadow-lg mt-4 flex justify-between items-center">
      <span>🎉 Wygrałeś!</span>
      <button className="btn btn-secondary" onClick={onReset}>Zagraj ponownie</button>
    </div>
  );
}

function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>(() => {
    // domyślny motyw: ciemny
    return "dark";
  });
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  return (
    <div className="flex gap-2 items-center mb-4">
      <span className="font-bold">Motyw:</span>
      <button className={`btn btn-sm ${theme === "light" ? "btn-active btn-primary" : ""}`} onClick={() => setTheme("light")}>Jasny</button>
      <button className={`btn btn-sm ${theme === "dark" ? "btn-active btn-primary" : ""}`} onClick={() => setTheme("dark")}>Ciemny</button>
    </div>
  );
}

function DevPanel({ game, refresh }: { game: GameState; refresh: () => void }) {
  const [rabbits, setRabbits] = useState(game.players[0].animals.rabbit);
  const [sheep, setSheep] = useState(game.players[0].animals.sheep);
  const [pig, setPig] = useState(game.players[0].animals.pig);
  const [cow, setCow] = useState(game.players[0].animals.cow);
  const [horse, setHorse] = useState(game.players[0].animals.horse);

  const setBackendState = async (animals: {rabbit: number, sheep: number, pig: number, cow: number, horse: number}) => {
    const newGame = { ...game, players: [{ ...game.players[0], animals }] };
    await fetch("http://localhost:4000/dev/set-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGame),
    });
    refresh();
  };

  const setWin = () => setBackendState({ rabbit: 1, sheep: 1, pig: 1, cow: 1, horse: 1 });

  return (
    <div className="card bg-warning p-4 mt-4">
      <h3 className="font-bold mb-2">Dev Panel</h3>
      <div className="flex gap-2 mb-2">
        <label>🐇 <input type="number" value={rabbits} onChange={e => setRabbits(Number(e.target.value))} className="input input-bordered w-16" /></label>
        <label>🐑 <input type="number" value={sheep} onChange={e => setSheep(Number(e.target.value))} className="input input-bordered w-16" /></label>
        <label>🐖 <input type="number" value={pig} onChange={e => setPig(Number(e.target.value))} className="input input-bordered w-16" /></label>
        <label>🐄 <input type="number" value={cow} onChange={e => setCow(Number(e.target.value))} className="input input-bordered w-16" /></label>
        <label>🐎 <input type="number" value={horse} onChange={e => setHorse(Number(e.target.value))} className="input input-bordered w-16" /></label>
      </div>
      <button
        className="btn btn-info mr-2"
        onClick={() => setBackendState({ rabbit: rabbits, sheep, pig, cow, horse })}
      >
        Ustaw stan
      </button>
      <button className="btn btn-success" onClick={setWin}>
        Wymuś zwycięstwo
      </button>
    </div>
  );
}

function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = () => {
    fetch(`${API_URL}/game`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok && data.error) {
          setError(data.error);
          setGame(null);
        } else {
          setGame(data);
        }
      })
      .catch(() => {
        setError("Błąd połączenia z backendem");
        setGame(null);
      });
  };

  // Pobierz stan gry na start
  useEffect(() => {
    fetchGame();
  }, []);

  const roll = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`${API_URL}/roll`, { method: "POST" });
    const data = await res.json();
    if (!res.ok && data.error) {
      setError(data.error);
    } else {
      setGame(data);
    }
    setLoading(false);
  };

  const reset = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`${API_URL}/reset`, { method: "POST" });
    const data = await res.json();
    if (!res.ok && data.error) {
      setError(data.error);
    } else {
      setGame(data);
    }
    setLoading(false);
  };

  const exchange = async (from: Animal | Dog, to: Animal | Dog) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await fetch(`${API_URL}/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    });
    const data = await res.json();
    if (!res.ok && data.error) {
      if (
        data.error.includes("Wymiana już została wykonana") ||
        data.error.includes("Za mało") ||
        data.error.includes("Brak")
      ) {
        setError(data.error);
      }
    } else {
      setGame(data);
      // Wyciągnij ostatni wpis z logu, jeśli to komunikat o wymianie
      if (data && data.log && Array.isArray(data.log)) {
        const lastLog = data.log[data.log.length - 1];
        if (typeof lastLog === "string" && lastLog.startsWith("Wymiana:")) {
          setSuccess(lastLog);
          setTimeout(() => setSuccess(null), 3500);
        }
      }
    }
    setLoading(false);
  };

  // Defensywna obsługa niepoprawnych danych gry
  if (!game || !game.players || !Array.isArray(game.players) || !game.players[0] || !game.players[0].animals) {
    return <div className="p-8">Błąd: niepoprawny stan gry. <button className="btn btn-secondary ml-2" onClick={fetchGame}>Spróbuj ponownie</button></div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4 text-center">🐾 Superfarmer</h1>
      <ThemeSwitcher />
      {error && (
        <div className="alert alert-error mb-4 flex justify-between items-center sticky top-0 z-50">
          <span>{error}</span>
          <button className="btn btn-xs ml-2" onClick={() => setError(null)}>X</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-4 flex justify-between items-center sticky top-0 z-50">
          <span>{success}</span>
          <button className="btn btn-xs ml-2" onClick={() => setSuccess(null)}>X</button>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {game.players[0] && <PlayerBoard player={game.players[0]} />}
        <MainHerd mainHerd={game.mainHerd} />
        <div className="flex gap-2 mb-2">
          <DiceRoller onRoll={roll} diceResult={game.diceResult} gameEnded={game.gameEnded || loading} />
          <button className="btn btn-secondary" onClick={reset} disabled={game.gameEnded || loading}>Reset gry</button>
        </div>
        <ExchangeTable onExchange={exchange} disabled={game.gameEnded || loading} />
        <GameLog log={game.log} />
        <GameEndChecker gameEnded={game.gameEnded} onReset={reset} />
        {/* {process.env.NODE_ENV === "development" && game && (
          <DevPanel game={game} refresh={fetchGame} />
        )} */}
      </div>
    </div>
  );
}

export default App;

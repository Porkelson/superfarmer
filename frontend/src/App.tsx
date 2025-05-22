import React, { useEffect, useState } from "react";
import { GameState } from "./types";
import PlayerBoard from "./components/PlayerBoard";
import MainHerd from "./components/MainHerd";
import DiceRoller from "./components/DiceRoller";
import ExchangeTable from "./components/ExchangeTable";
import GameLog from "./components/GameLog";
import GameEndChecker from "./components/GameEndChecker";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { useGameApi } from "./hooks/useGameApi";
import Notification from "./components/Notification";

function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { fetchGame, roll, reset, exchange } = useGameApi(setGame, setError, setSuccess, setLoading);

  // Pobierz stan gry na start
  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Defensywna obsługa niepoprawnych danych gry
  if (!game || !game.players || !Array.isArray(game.players) || !game.players[0] || !game.players[0].animals) {
    return <div className="p-8">Błąd: niepoprawny stan gry. <button className="btn btn-secondary ml-2" onClick={fetchGame}>Spróbuj ponownie</button></div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-center whitespace-nowrap">Superfarmer</h1>
        <div className="flex-shrink-0"><ThemeSwitcher /></div>
      </div>
      <Notification message={error} type="error" onClose={() => setError(null)} />
      <Notification message={success} type="success" onClose={() => setSuccess(null)} />
      <div className="flex flex-col gap-4">
        {game.players[0] && <PlayerBoard player={game.players[0]} />}
        <MainHerd mainHerd={game.mainHerd} />
        <div className="card bg-base-100 shadow flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-2">
          <DiceRoller onRoll={roll} diceResult={game.diceResult} gameEnded={game.gameEnded || loading} />
          <button className="btn btn-secondary w-full md:w-auto" onClick={reset} disabled={game.gameEnded || loading}>Reset gry</button>
        </div>
        <ExchangeTable onExchange={exchange} disabled={game.gameEnded || loading || game.exchangeUsed} />
        <GameLog log={game.log} />
        <GameEndChecker gameEnded={game.gameEnded} onReset={reset} />
      </div>
    </div>
  );
}

export default App;

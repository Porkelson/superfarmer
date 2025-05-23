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
import GameLogModal from "./components/GameLogModal";
import GameRulesModal from "./components/GameRulesModal";

function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rollUsed, setRollUsed] = useState<boolean>(() => false);

  const { fetchGame, roll, reset, exchange, endTurn } = useGameApi(setGame, setError, setSuccess, setLoading);

  // Pobierz stan gry na start
  useEffect(() => {
    setInitialLoading(true);
    Promise.resolve(fetchGame()).finally(() => {
      setInitialLoading(false);
      setRollUsed(false); // allow rolling dice at the start
    });
  }, [fetchGame]);

  // Handler rzutu kośćmi
  const handleRoll = async () => {
    await roll();
    setRollUsed(true);
  };

  // Handler końca tury
  const handleEndTurn = async () => {
    setRollUsed(false);
    await endTurn();
  };

  const resetAndAllowRoll = async () => {
    await reset();
    setRollUsed(false);
  };

  // Defensywna obsługa niepoprawnych danych gry
  if (!game) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base-200 z-[9999]">
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <span className="text-xl font-bold">Ładowanie gry...</span>
        </div>
      </div>
    );
  }
  if (!game.players || !Array.isArray(game.players) || !game.players[0] || !game.players[0].animals) {
    return <div className="p-8">Błąd: niepoprawny stan gry. <button className="btn btn-secondary ml-2" onClick={fetchGame}>Spróbuj ponownie</button></div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-1">
          <h1 className="text-3xl font-bold text-center whitespace-nowrap">Super Farmer</h1>
          <button className="btn btn-circle btn-ghost btn-sm align-middle" aria-label="Zasady gry" onClick={() => setShowRulesModal(true)}>
            <span className="text-xl">?</span>
          </button>
        </div>
        <div className="flex-shrink-0"><ThemeSwitcher /></div>
      </div>
      <Notification message={error} type="error" onClose={() => setError(null)} />
      <Notification message={success} type="success" onClose={() => setSuccess(null)} />
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2 max-h-full overflow-y-auto">
          <PlayerBoard player={game.players[0]} />
          <MainHerd mainHerd={game.mainHerd} />
          <div className="flex flex-col gap-2 w-full">
            <DiceRoller onRoll={handleRoll} diceResult={game.diceResult} gameEnded={game.gameEnded || loading || rollUsed} />
            <div className="flex flex-row gap-2 w-full mb-2">
              <button className="btn btn-warning h-12 text-lg" style={{minWidth: '120px'}} onClick={handleEndTurn} disabled={!rollUsed || game.gameEnded}>Zakończ turę</button>
              <button className="btn btn-primary h-12 text-lg" style={{minWidth: '120px'}} onClick={() => setShowLog(true)}>Pokaż logi</button>
              <button className="btn btn-secondary h-12 text-lg" style={{minWidth: '120px'}} onClick={resetAndAllowRoll} disabled={game.gameEnded || loading}>Reset gry</button>
            </div>
            <div className="flex flex-row gap-2 w-full mb-2">
              
            </div>
          </div>
        </div>
        {/* Right column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2 max-h-full overflow-y-auto">
          <ExchangeTable onExchange={exchange} disabled={game.gameEnded || loading || game.exchangeUsed || !rollUsed} />
        </div>
      </div>
      <GameEndChecker gameEnded={game.gameEnded} onReset={resetAndAllowRoll} />
      {showLog && <GameLogModal log={game.log} onClose={() => setShowLog(false)} />}
      {showRulesModal && <GameRulesModal onClose={() => setShowRulesModal(false)} />}
    </div>
  );
}

export default App;

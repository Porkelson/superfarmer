import { useCallback } from "react";
import { Animal, Dog, GameState } from "../types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export function useGameApi(
  setGame: (g: GameState) => void,
  setError: (e: string | null) => void,
  setSuccess: (s: string | null) => void,
  setLoading: (l: boolean) => void
) {
  const fetchGame = useCallback(() => {
    fetch(`${API_URL}/game`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok && data.error) {
          setError(data.error);
          setGame(null as any);
        } else {
          setGame(data);
        }
      })
      .catch(() => {
        setError("Błąd połączenia z backendem");
        setGame(null as any);
      });
  }, [setGame, setError]);

  const roll = useCallback(async () => {
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
  }, [setGame, setError, setLoading]);

  const reset = useCallback(async () => {
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
  }, [setGame, setError, setLoading]);

  const exchange = useCallback(
    async (from: Animal | Dog, to: Animal | Dog) => {
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
    },
    [setGame, setError, setSuccess, setLoading]
  );

  const endTurn = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`${API_URL}/end-turn`, { method: "POST" });
    const data = await res.json();
    if (!res.ok && data.error) {
      setError(data.error);
    } else {
      setGame(data);
    }
    setLoading(false);
  }, [setGame, setError, setLoading]);

  return { fetchGame, roll, reset, exchange, endTurn };
} 
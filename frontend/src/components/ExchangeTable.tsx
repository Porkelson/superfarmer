import React from "react";
import { Animal, Dog } from "../types";

export const exchangeOptions = [
  { from: "rabbit", to: "sheep", label: "6 🐇 → 1 🐑" },
  { from: "sheep", to: "pig", label: "2 🐑 → 1 🐖" },
  { from: "pig", to: "cow", label: "3 🐖 → 1 🐄" },
  { from: "cow", to: "horse", label: "2 🐄 → 1 🐎" },
  { from: "sheep", to: "smallDog", label: "1 🐑 → 1 🐶" },
  { from: "cow", to: "bigDog", label: "1 🐄 → 1 🐕" },
];

// Opcje rozmieniania (w drugą stronę)
export const exchangeReverseOptions = [
  { from: "sheep", to: "rabbit", label: "1 🐑 → 6 🐇" },
  { from: "pig", to: "sheep", label: "1 🐖 → 2 🐑" },
  { from: "cow", to: "pig", label: "1 🐄 → 3 🐖" },
  { from: "horse", to: "cow", label: "1 🐎 → 2 🐄" },
  { from: "smallDog", to: "sheep", label: "1 🐶 → 1 🐑" },
  { from: "bigDog", to: "cow", label: "1 🐕 → 1 🐄" },
];

function ExchangeTable({ onExchange, disabled }: { onExchange: (from: Animal | Dog, to: Animal | Dog) => void; disabled: boolean }) {
  return (
    <>
      <div className="card bg-base-200 shadow p-8 mb-4 max-w-md mx-auto">
        <h2 className="card-title mb-4 text-2xl">Wymiana</h2>
        <table className="table w-full">
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            {exchangeOptions.map(opt => (
              <tr key={opt.label}>
                <td className="text-xl py-3">{opt.label}</td>
                <td>
                  <button
                    className="btn btn-success btn-lg text-lg"
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
      {/* Reverse exchange table */}
      <div className="card bg-base-200 shadow p-8 mb-4 max-w-md mx-auto">
        <h2 className="card-title mb-4 text-2xl">Rozmienianie</h2>
        <table className="table w-full">
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            {exchangeReverseOptions.map(opt => (
              <tr key={opt.label}>
                <td className="text-xl py-3">{opt.label}</td>
                <td>
                  <button
                    className="btn btn-info btn-lg text-lg"
                    onClick={() => onExchange(opt.from as Animal | Dog, opt.to as Animal | Dog)}
                    disabled={disabled}
                  >
                    Rozmień
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ExchangeTable; 
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

export default ExchangeTable; 
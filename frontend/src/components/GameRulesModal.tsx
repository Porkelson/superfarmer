import React from "react";

interface GameRulesModalProps {
  onClose: () => void;
}

const rules = [
  "Celem gry jest zdobycie co najmniej po jednym egzemplarzu każdego zwierzęcia (królik, owca, świnia, krowa, koń).",
  "W swojej turze gracz rzuca dwiema kostkami i rozmnaża zwierzęta zgodnie z wynikiem.",
  "Jeśli wypadnie wilk lub lis, mogą one zjeść część zwierząt (chyba że gracz ma odpowiedniego psa).",
  "Gracz może dokonać jednej wymiany zwierząt z głównym stadem w swojej turze.",
  "Możliwe są wymiany: 6 królików ↔ 1 owca, 2 owce ↔ 1 świnia, 3 świnie ↔ 1 krowa, 2 krowy ↔ 1 koń, 1 owca ↔ 1 mały pies, 1 krowa ↔ 1 duży pies.",
  "Gracz może mieć maksymalnie jednego małego i jednego dużego psa.",
  "Gra kończy się natychmiast, gdy gracz posiada co najmniej po jednym egzemplarzu każdego zwierzęcia."
];

const GameRulesModal: React.FC<GameRulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-base-100 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Zasady gry</h2>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-base space-y-2">
          <ol className="list-decimal pl-5 space-y-1">
            {rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GameRulesModal; 
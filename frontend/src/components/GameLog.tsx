import React from "react";

function GameLog({ log }: { log: string[] }) {
  return (
    <div className="bg-neutral text-neutral-content rounded p-2 h-32 overflow-y-auto text-sm mb-4">
      {log.map((entry, i) => (
        <div key={i}>{i + 1}. {entry}</div>
      ))}
    </div>
  );
}

export default GameLog; 
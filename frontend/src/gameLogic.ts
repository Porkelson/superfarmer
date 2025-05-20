import { Animal, Dog, PlayerState, DiceResult, GameState } from "./types";

// Definicje kostek
const die1: string[] = [
  "rabbit", "rabbit", "rabbit", "rabbit", "rabbit", "rabbit",
  "sheep", "sheep", "sheep",
  "pig",
  "cow",
  "wolf"
];
const die2: string[] = [
  "sheep", "sheep", "sheep", "sheep", "sheep", "sheep", "sheep", "sheep",
  "pig", "pig",
  "horse",
  "fox"
];

// Rzut kostkami
export function rollDice(): DiceResult {
  const die1Result = die1[Math.floor(Math.random() * die1.length)];
  const die2Result = die2[Math.floor(Math.random() * die2.length)];
  return { die1: die1Result, die2: die2Result };
}

// Sprawdzenie zwycięstwa
export function checkWin(player: PlayerState): boolean {
  return (
    player.animals.rabbit > 0 &&
    player.animals.sheep > 0 &&
    player.animals.pig > 0 &&
    player.animals.cow > 0 &&
    player.animals.horse > 0
  );
}

// Rozmnażanie zwierząt
export function breedAnimals(
  player: PlayerState,
  dice: DiceResult,
  mainHerd: Record<Animal, number> & { smallDogs: number; bigDogs: number }
): { player: PlayerState; mainHerd: Record<Animal, number> & { smallDogs: number; bigDogs: number }; log: string[] } {
  const log: string[] = [];
  const allAnimals: Animal[] = ["rabbit", "sheep", "pig", "cow", "horse"];
  const diceAnimals: Animal[] = [dice.die1, dice.die2].filter((a): a is Animal => allAnimals.includes(a as Animal));
  // Jeśli dwa takie same zwierzęta na kostkach, gracz dostaje jedno z głównego stada
  if (dice.die1 === dice.die2 && allAnimals.includes(dice.die1 as Animal)) {
    const animal = dice.die1 as Animal;
    if (mainHerd[animal] > 0) {
      player.animals[animal] += 1;
      mainHerd[animal] -= 1;
      log.push(`Dostałeś dodatkowe zwierzę: ${animal}`);
    }
  }
  // Rozmnażanie dla każdego gatunku
  for (const animal of allAnimals) {
    // Koń i krowa tylko jeśli już są w stadzie
    if ((animal === "horse" || animal === "cow") && player.animals[animal] === 0) continue;
    const diceCount = diceAnimals.filter(a => a === animal).length;
    const total = player.animals[animal] + diceCount;
    const pairs = Math.floor(total / 2);
    if (pairs > 0 && mainHerd[animal] > 0) {
      const toAdd = Math.min(pairs, mainHerd[animal]);
      player.animals[animal] += toAdd;
      mainHerd[animal] -= toAdd;
      if (toAdd > 0) log.push(`Rozmnożenie: +${toAdd} ${animal}`);
    }
  }
  return { player, mainHerd, log };
}

// Ataki lisa i wilka
export function handleAttacks(player: PlayerState, dice: DiceResult, mainHerd: { smallDogs: number; bigDogs: number }): { player: PlayerState; mainHerd: { smallDogs: number; bigDogs: number }; log: string[] } {
  const log: string[] = [];
  // Lis
  if (dice.die1 === "fox" || dice.die2 === "fox") {
    if (player.smallDogs > 0) {
      player.smallDogs -= 1;
      mainHerd.smallDogs += 1;
      log.push("Lis zaatakował, ale mały pies obronił króliki!");
    } else {
      if (player.animals.rabbit > 1) {
        log.push(`Lis zabrał ${player.animals.rabbit - 1} królików!`);
        player.animals.rabbit = 1;
      }
    }
  }
  // Wilk
  if (dice.die1 === "wolf" || dice.die2 === "wolf") {
    if (player.bigDogs > 0) {
      player.bigDogs -= 1;
      mainHerd.bigDogs += 1;
      log.push("Wilk zaatakował, ale duży pies obronił stado!");
    } else {
      let lost = false;
      ["sheep", "pig", "cow"].forEach(animal => {
        if (player.animals[animal as Animal] > 0) lost = true;
        player.animals[animal as Animal] = 0;
      });
      if (lost) log.push("Wilk zabrał wszystkie owce, świnie i krowy!");
    }
  }
  return { player, mainHerd, log };
}

// Wymiana zwierząt
export function exchangeAnimals(player: PlayerState, mainHerd: Record<Animal, number> & { smallDogs: number; bigDogs: number }, from: Animal | Dog, to: Animal | Dog): { player: PlayerState; mainHerd: typeof mainHerd; log: string } {
  // Tabela wymian
  const exchangeTable: Record<string, { cost: number; from: Animal | Dog; to: Animal | Dog }> = {
    sheep: { cost: 6, from: "rabbit", to: "sheep" },
    pig: { cost: 2, from: "sheep", to: "pig" },
    cow: { cost: 3, from: "pig", to: "cow" },
    horse: { cost: 2, from: "cow", to: "horse" },
    smallDog: { cost: 1, from: "sheep", to: "smallDog" },
    bigDog: { cost: 1, from: "cow", to: "bigDog" },
  };
  let log = "";
  for (const key in exchangeTable) {
    const ex = exchangeTable[key];
    if (ex.from === from && ex.to === to) {
      // Sprawdź czy gracz ma wystarczająco zwierząt
      if ((from === "smallDog" || from === "bigDog") ? player[`${from}s`] >= ex.cost : player.animals[from as Animal] >= ex.cost) {
        // Sprawdź czy w głównym stadzie jest docelowe zwierzę
        if ((to === "smallDog" || to === "bigDog") ? mainHerd[`${to}s`] > 0 : mainHerd[to as Animal] > 0) {
          // Odejmij od gracza
          if (from === "smallDog" || from === "bigDog") player[`${from}s`] -= ex.cost;
          else player.animals[from as Animal] -= ex.cost;
          // Dodaj do głównego stada
          if (from === "smallDog" || from === "bigDog") mainHerd[`${from}s`] += ex.cost;
          else mainHerd[from as Animal] += ex.cost;
          // Dodaj do gracza
          if (to === "smallDog" || to === "bigDog") {
            player[`${to}s`] += 1;
            mainHerd[`${to}s`] -= 1;
          } else {
            player.animals[to as Animal] += 1;
            mainHerd[to as Animal] -= 1;
          }
          log = `Wymiana: ${ex.cost} ${from} na 1 ${to}`;
        } else {
          log = `Brak ${to} w głównym stadzie!`;
        }
      } else {
        log = `Za mało ${from} do wymiany!`;
      }
      break;
    }
  }
  return { player, mainHerd, log };
} 
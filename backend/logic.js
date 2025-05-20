// Typy i logika gry Superfarmer na backend

const allAnimals = ["rabbit", "sheep", "pig", "cow", "horse"];

function initialGameState() {
  return {
    players: [
      {
        animals: { rabbit: 0, sheep: 0, pig: 0, cow: 0, horse: 0 },
        smallDogs: 0,
        bigDogs: 0,
      },
    ],
    mainHerd: {
      rabbit: 60,
      sheep: 24,
      pig: 20,
      cow: 12,
      horse: 6,
      smallDogs: 4,
      bigDogs: 2,
    },
    currentPlayer: 0,
    log: [],
    gameEnded: false,
  };
}

const die1 = [
  "rabbit", "rabbit", "rabbit", "rabbit", "rabbit", "rabbit",
  "sheep", "sheep", "sheep",
  "pig",
  "cow",
  "wolf"
];
const die2 = [
  "sheep", "sheep", "sheep", "sheep", "sheep", "sheep", "sheep", "sheep",
  "pig", "pig",
  "horse",
  "fox"
];

function rollDice() {
  const die1Result = die1[Math.floor(Math.random() * die1.length)];
  const die2Result = die2[Math.floor(Math.random() * die2.length)];
  return { die1: die1Result, die2: die2Result };
}

function checkWin(player) {
  return (
    player.animals.rabbit > 0 &&
    player.animals.sheep > 0 &&
    player.animals.pig > 0 &&
    player.animals.cow > 0 &&
    player.animals.horse > 0
  );
}

function breedAnimals(player, dice, mainHerd) {
  const log = [];
  const diceAnimals = [dice.die1, dice.die2].filter(a => allAnimals.includes(a));
  // Jeśli dwa takie same zwierzęta na kostkach, gracz dostaje jedno z głównego stada
  if (dice.die1 === dice.die2 && allAnimals.includes(dice.die1)) {
    const animal = dice.die1;
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

function handleAttacks(player, dice, mainHerd) {
  const log = [];
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
        if (player.animals[animal] > 0) lost = true;
        player.animals[animal] = 0;
      });
      if (lost) log.push("Wilk zabrał wszystkie owce, świnie i krowy!");
    }
  }
  return { player, mainHerd, log };
}

function exchangeAnimals(player, mainHerd, from, to) {
  const exchangeTable = {
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
      if ((from === "smallDog" || from === "bigDog") ? player[`${from}s`] >= ex.cost : player.animals[from] >= ex.cost) {
        if ((to === "smallDog" || to === "bigDog") ? mainHerd[`${to}s`] > 0 : mainHerd[to] > 0) {
          if (from === "smallDog" || from === "bigDog") player[`${from}s`] -= ex.cost;
          else player.animals[from] -= ex.cost;
          if (from === "smallDog" || from === "bigDog") mainHerd[`${from}s`] += ex.cost;
          else mainHerd[from] += ex.cost;
          if (to === "smallDog" || to === "bigDog") player[`${to}s`] += 1, mainHerd[`${to}s`] -= 1;
          else player.animals[to] += 1, mainHerd[to] -= 1;
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

module.exports = {
  rollDice,
  breedAnimals,
  handleAttacks,
  checkWin,
  exchangeAnimals,
  initialGameState,
}; 
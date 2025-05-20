const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const { rollDice, breedAnimals, handleAttacks, checkWin, exchangeAnimals, initialGameState } = require('./logic');

const app = express();
app.use(cors());
app.use(express.json());

const redis = createClient();
redis.connect();

const GAME_KEY = 'superfarmer:game';

// Helper: get current game state
async function getGame() {
  const data = await redis.get(GAME_KEY);
  return data ? JSON.parse(data) : initialGameState();
}

// Helper: save game state
async function saveGame(state) {
  await redis.set(GAME_KEY, JSON.stringify(state));
}

app.get('/game', async (req, res) => {
  const game = await getGame();
  res.json(game);
});

app.post('/roll', async (req, res) => {
  let game = await getGame();
  const dice = rollDice();
  let player = { ...game.players[game.currentPlayer] };
  let mainHerd = { ...game.mainHerd };
  let log = [];
  // Ataki
  const attackResult = handleAttacks(player, dice, mainHerd);
  player = attackResult.player;
  mainHerd = { ...mainHerd, ...attackResult.mainHerd };
  log = log.concat(attackResult.log);
  // Rozmnażanie
  const breedResult = breedAnimals(player, dice, mainHerd);
  player = breedResult.player;
  mainHerd = breedResult.mainHerd;
  log = log.concat(breedResult.log);
  // Zapisz stan
  game.players[game.currentPlayer] = player;
  game.mainHerd = mainHerd;
  game.diceResult = dice;
  game.log = [...game.log, ...log];
  if (checkWin(player)) {
    game.gameEnded = true;
    game.winner = game.currentPlayer;
    game.log.push('Wygrałeś!');
  }
  await saveGame(game);
  res.json(game);
});

app.post('/exchange', async (req, res) => {
  const { from, to } = req.body;
  let game = await getGame();
  let player = { ...game.players[game.currentPlayer] };
  let mainHerd = { ...game.mainHerd };
  const result = exchangeAnimals(player, mainHerd, from, to);
  player = result.player;
  mainHerd = result.mainHerd;
  game.players[game.currentPlayer] = player;
  game.mainHerd = mainHerd;
  game.log = [...game.log, result.log];
  await saveGame(game);
  res.json(game);
});

app.post('/reset', async (req, res) => {
  const game = initialGameState();
  await saveGame(game);
  res.json(game);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Superfarmer backend listening on port ${PORT}`);
});

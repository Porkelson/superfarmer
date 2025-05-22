export type Animal = "rabbit" | "sheep" | "pig" | "cow" | "horse";
export type Dog = "smallDog" | "bigDog";

export interface PlayerState {
  animals: Record<Animal, number>;
  smallDogs: number;
  bigDogs: number;
}

export interface DiceResult {
  die1: string;
  die2: string;
}

export interface GameState {
  players: PlayerState[];
  mainHerd: Record<Animal, number> & { smallDogs: number; bigDogs: number };
  currentPlayer: number;
  log: string[];
  diceResult?: DiceResult;
  gameEnded: boolean;
  winner?: number;
  exchangeUsed: boolean;
} 
from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
import json
import random
import os

app = Flask(__name__)
CORS(app)

r = redis.Redis(host=os.getenv('REDIS_HOST', 'localhost'), port=6379, db=0, decode_responses=True)
GAME_KEY = 'superfarmer:game'
NUM_PLAYERS = 1
ANIMALS = ["rabbit", "sheep", "pig", "cow", "horse"]
DOGS = ["smallDog", "bigDog"]

DIE1 = [
    "rabbit", "rabbit", "rabbit", "rabbit", "rabbit", "rabbit",
    "sheep", "sheep", "sheep",
    "pig",
    "cow",
    "wolf"
]
DIE2 = [
    "sheep", "sheep", "sheep", "sheep", "sheep", "sheep", "sheep", "sheep",
    "pig", "pig",
    "horse",
    "fox"
]

EXCHANGE_TABLE = {
    "sheep": {"cost": 6, "from": "rabbit", "to": "sheep"},
    "pig": {"cost": 2, "from": "sheep", "to": "pig"},
    "cow": {"cost": 3, "from": "pig", "to": "cow"},
    "horse": {"cost": 2, "from": "cow", "to": "horse"},
    "smallDog": {"cost": 1, "from": "sheep", "to": "smallDog"},
    "bigDog": {"cost": 1, "from": "cow", "to": "bigDog"},
}

def initial_game_state():
    players = [{
        "animals": {a: 0 for a in ANIMALS},
        "smallDogs": 0,
        "bigDogs": 0
    } for _ in range(NUM_PLAYERS)]
    for p in players:
        p["animals"]["rabbit"] = 1
    mainHerd = {
        "rabbit": 60 - len(players),
        "sheep": 24,
        "pig": 20,
        "cow": 12,
        "horse": 6,
        "smallDogs": 4,
        "bigDogs": 2
    }
    return {
        "players": players,
        "mainHerd": mainHerd,
        "currentPlayer": 0,
        "log": [],
        "gameEnded": False,
        "exchangeUsed": False
    }

def validate_game(game):
    if not isinstance(game, dict):
        return False
    if "players" not in game or not isinstance(game["players"], list) or len(game["players"]) < 1:
        return False
    for p in game["players"]:
        if not isinstance(p, dict):
            return False
        if "animals" not in p or not isinstance(p["animals"], dict):
            return False
    if "mainHerd" not in game or not isinstance(game["mainHerd"], dict):
        return False
    return True

def get_game():
    data = r.get(GAME_KEY)
    try:
        game = json.loads(data) if data else initial_game_state()
        if not validate_game(game):
            return None
        return game
    except Exception:
        return None

def save_game(state):
    r.set(GAME_KEY, json.dumps(state))

def roll_dice():
    return {
        "die1": random.choice(DIE1),
        "die2": random.choice(DIE2)
    }

def check_win(player):
    return all(player["animals"][a] > 0 for a in ANIMALS)

def breed_animals(player, dice, mainHerd):
    log = []
    dice_animals = [d for d in [dice["die1"], dice["die2"]] if d in ANIMALS]
    # Jeśli dwa takie same zwierzęta na kostkach, gracz dostaje jedno z głównego stada
    if dice["die1"] == dice["die2"] and dice["die1"] in ANIMALS:
        animal = dice["die1"]
        if mainHerd[animal] > 0:
            player["animals"][animal] += 1
            mainHerd[animal] -= 1
            log.append(f"Dostałeś dodatkowe zwierzę: {animal}")
    # Rozmnażanie dla każdego gatunku
    for animal in ANIMALS:
        if animal in ["horse", "cow"] and player["animals"][animal] == 0:
            continue
        dice_count = dice_animals.count(animal)
        total = player["animals"][animal] + dice_count
        pairs = total // 2
        if pairs > 0 and mainHerd[animal] > 0:
            to_add = min(pairs, mainHerd[animal])
            player["animals"][animal] += to_add
            mainHerd[animal] -= to_add
            if to_add > 0:
                log.append(f"Rozmnożenie: +{to_add} {animal}")
    return player, mainHerd, log

def handle_attacks(player, dice, mainHerd):
    log = []
    # Lis
    if dice["die1"] == "fox" or dice["die2"] == "fox":
        if player["smallDogs"] > 0:
            player["smallDogs"] -= 1
            mainHerd["smallDogs"] += 1
            log.append("Lis zaatakował, ale mały pies obronił króliki!")
        else:
            if player["animals"]["rabbit"] > 1:
                taken = player["animals"]["rabbit"] - 1
                log.append(f"Lis zabrał {taken} królików!")
                mainHerd["rabbit"] += taken  # Return to main herd
                player["animals"]["rabbit"] = 1
    # Wilk
    if dice["die1"] == "wolf" or dice["die2"] == "wolf":
        if player["bigDogs"] > 0:
            player["bigDogs"] -= 1
            mainHerd["bigDogs"] += 1
            log.append("Wilk zaatakował, ale duży pies obronił stado!")
        else:
            lost = False
            for animal in ["sheep", "pig", "cow"]:
                if player["animals"][animal] > 0:
                    lost = True
                    mainHerd[animal] += player["animals"][animal]  # Return to main herd
                    player["animals"][animal] = 0
            if lost:
                log.append("Wilk zabrał wszystkie owce, świnie i krowy!")
    return player, mainHerd, log

def exchange_animals(player, mainHerd, from_, to_, exchangeUsed):
    log = ""
    if exchangeUsed:
        return player, mainHerd, "Wymiana już została wykonana w tej turze!"

    # Try to find a matching exchange in EXCHANGE_TABLE
    found = None
    for key, ex in EXCHANGE_TABLE.items():
        if ex["from"] == from_ and ex["to"] == to_:
            found = (ex, False)  # normal direction
            break
        if ex["from"] == to_ and ex["to"] == from_:
            found = (ex, True)   # reverse direction
            break
    if not found:
        return player, mainHerd, "Nieprawidłowa wymiana!"

    ex, reverse = found
    # Normal exchange (e.g. 6 rabbits -> 1 sheep)
    if not reverse:
        # Check if player has enough 'from_' animals
        if (from_ in DOGS and player[from_ + 's'] < ex["cost"]) or (from_ in ANIMALS and player["animals"][from_] < ex["cost"]):
            return player, mainHerd, f"Za mało {from_} do wymiany!"
        # Check if main herd has at least 1 'to_'
        if (to_ in DOGS and mainHerd[to_ + 's'] < 1) or (to_ in ANIMALS and mainHerd[to_] < 1):
            return player, mainHerd, f"Brak {to_} w głównym stadzie!"
        # Perform exchange
        if from_ in DOGS:
            player[from_ + 's'] -= ex["cost"]
            mainHerd[from_ + 's'] += ex["cost"]
        else:
            player["animals"][from_] -= ex["cost"]
            mainHerd[from_] += ex["cost"]
        if to_ in DOGS:
            player[to_ + 's'] += 1
            mainHerd[to_ + 's'] -= 1
        else:
            player["animals"][to_] += 1
            mainHerd[to_] -= 1
        log = f"Wymiana: {ex['cost']} {from_} na 1 {to_}"
    # Reverse exchange (e.g. 1 sheep -> 6 rabbits)
    else:
        # Check if player has at least 1 ex['to'] (the animal being exchanged away)
        if (ex["to"] in DOGS and player[ex["to"] + 's'] < 1) or (ex["to"] in ANIMALS and player["animals"][ex["to"]] < 1):
            return player, mainHerd, f"Za mało {ex['to']} do wymiany!"
        # Check if main herd has enough ex['from'] (the animal being received)
        if (ex["from"] in DOGS and mainHerd[ex["from"] + 's'] < ex["cost"]) or (ex["from"] in ANIMALS and mainHerd[ex["from"]] < ex["cost"]):
            return player, mainHerd, f"Brak {ex['from']} w głównym stadzie!"
        # Perform reverse exchange
        if ex["to"] in DOGS:
            player[ex["to"] + 's'] -= 1
            mainHerd[ex["to"] + 's'] += 1
        else:
            player["animals"][ex["to"]] -= 1
            mainHerd[ex["to"]] += 1
        if ex["from"] in DOGS:
            player[ex["from"] + 's'] += ex["cost"]
            mainHerd[ex["from"] + 's'] -= ex["cost"]
        else:
            player["animals"][ex["from"]] += ex["cost"]
            mainHerd[ex["from"]] -= ex["cost"]
        log = f"Wymiana: 1 {ex['to']} na {ex['cost']} {ex['from']}"
    return player, mainHerd, log

@app.route('/game', methods=['GET'])
def get_game_route():
    game = get_game()
    if not game:
        return jsonify({"error": "Stan gry jest uszkodzony lub niekompletny."}), 500
    return jsonify(game)

@app.route('/roll', methods=['POST'])
def roll_route():
    game = get_game()
    if not game:
        return jsonify({"error": "Stan gry jest uszkodzony lub niekompletny."}), 500
    dice = roll_dice()
    exchangeUsed = False
    player = dict(game["players"][game["currentPlayer"]])
    mainHerd = dict(game["mainHerd"])
    log = []
    # Ataki
    player, mainHerd, attack_log = handle_attacks(player, dice, mainHerd)
    log += attack_log
    # Rozmnażanie
    player, mainHerd, breed_log = breed_animals(player, dice, mainHerd)
    log += breed_log
    # Zapisz stan
    game["players"][game["currentPlayer"]] = player
    game["mainHerd"] = mainHerd
    game["diceResult"] = dice
    game["log"] += log
    game["exchangeUsed"] = exchangeUsed
    if check_win(player):
        game["gameEnded"] = True
        game["winner"] = game["currentPlayer"]
        game["log"].append("Wygrałeś!")
    save_game(game)
    return jsonify(game)

@app.route('/exchange', methods=['POST'])
def exchange_route():
    data = request.get_json()
    from_ = data.get("from")
    to_ = data.get("to")
    game = get_game()
    if not game:
        return jsonify({"error": "Stan gry jest uszkodzony lub niekompletny."}), 500
    if game["exchangeUsed"]:
        return jsonify({"error": "Wymiana już została wykonana w tej turze!"}), 400
    player = dict(game["players"][game["currentPlayer"]])
    mainHerd = dict(game["mainHerd"])
    player, mainHerd, log = exchange_animals(player, mainHerd, from_, to_, game["exchangeUsed"])
    # Jeśli log to błąd, zwróć kod 400 i error
    if isinstance(log, str) and (log.startswith("Za mało") or log.startswith("Brak ")):
        return jsonify({"error": log}), 400
    game["players"][game["currentPlayer"]] = player
    game["mainHerd"] = mainHerd
    game["log"].append(log)
    game["exchangeUsed"] = True
    # Dodaj sprawdzenie zwycięstwa po udanej wymianie
    if check_win(player):
        game["gameEnded"] = True
        game["winner"] = game["currentPlayer"]
        game["log"].append("Wygrałeś!")
    save_game(game)
    return jsonify(game)

@app.route('/exchange-with-player', methods=['POST'])
def exchange_with_player():
    data = request.get_json()
    from_ = data.get("from")
    to_ = data.get("to")
    fromPlayer = data.get("fromPlayer")
    toPlayer = data.get("toPlayer")
    amount = data.get("amount", 1)
    game = get_game()
    if not game:
        return jsonify({"error": "Stan gry jest uszkodzony lub niekompletny."}), 500
    if game["exchangeUsed"]:
        return jsonify({"error": "Wymiana już została wykonana w tej turze!"}), 400
    p1 = dict(game["players"][fromPlayer])
    p2 = dict(game["players"][toPlayer])
    # Sprawdź czy p1 ma odpowiednią ilość from_, p2 ma odpowiednią ilość to_
    if from_ in DOGS:
        if p1[from_ + 's'] < amount:
            return jsonify({"error": f"Gracz {fromPlayer} nie ma wystarczająco {from_}"}), 400
    else:
        if p1["animals"][from_] < amount:
            return jsonify({"error": f"Gracz {fromPlayer} nie ma wystarczająco {from_}"}), 400
    if to_ in DOGS:
        if p2[to_ + 's'] < 1:
            return jsonify({"error": f"Gracz {toPlayer} nie ma {to_}"}), 400
    else:
        if p2["animals"][to_] < 1:
            return jsonify({"error": f"Gracz {toPlayer} nie ma {to_}"}), 400
    # Wymiana
    if from_ in DOGS:
        p1[from_ + 's'] -= amount
        p2[from_ + 's'] += amount
    else:
        p1["animals"][from_] -= amount
        p2["animals"][from_] += amount
    if to_ in DOGS:
        p2[to_ + 's'] -= 1
        p1[to_ + 's'] += 1
    else:
        p2["animals"][to_] -= 1
        p1["animals"][to_] += 1
    game["players"][fromPlayer] = p1
    game["players"][toPlayer] = p2
    game["log"].append(f"Gracz {fromPlayer} wymienił {amount} {from_} na 1 {to_} z graczem {toPlayer}")
    game["exchangeUsed"] = True
    save_game(game)
    return jsonify(game)

@app.route('/end-turn', methods=['POST'])
def end_turn():
    game = get_game()
    if not game:
        return jsonify({"error": "Stan gry jest uszkodzony lub niekompletny."}), 500
    game["log"].append("Tura zakończona.")
    game["currentPlayer"] = (game["currentPlayer"] + 1) % len(game["players"])
    game["exchangeUsed"] = False
    save_game(game)
    return jsonify(game)

@app.route('/reset', methods=['POST'])
def reset_route():
    game = initial_game_state()
    save_game(game)
    return jsonify(game)

@app.route('/dev/set-state', methods=['POST'])
def dev_set_state():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    save_game(data)
    return jsonify({"status": "ok"})

@app.route('/health', methods=['GET'])
def health_route():
    game = get_game()
    if not game:
        return jsonify({"status": "error", "message": "Stan gry jest uszkodzony lub niekompletny."}), 500
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(port=4000, debug=True) 
from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
import json
import random

app = Flask(__name__)
CORS(app)

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
GAME_KEY = 'superfarmer:game'

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
    return {
        "players": [{
            "animals": {a: 0 for a in ANIMALS},
            "smallDogs": 0,
            "bigDogs": 0
        }],
        "mainHerd": {
            "rabbit": 60, "sheep": 24, "pig": 20, "cow": 12, "horse": 6,
            "smallDogs": 4, "bigDogs": 2
        },
        "currentPlayer": 0,
        "log": [],
        "gameEnded": False
    }

def get_game():
    data = r.get(GAME_KEY)
    return json.loads(data) if data else initial_game_state()

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
                log.append(f"Lis zabrał {player['animals']['rabbit'] - 1} królików!")
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
                player["animals"][animal] = 0
            if lost:
                log.append("Wilk zabrał wszystkie owce, świnie i krowy!")
    return player, mainHerd, log

def exchange_animals(player, mainHerd, from_, to_):
    log = ""
    for key, ex in EXCHANGE_TABLE.items():
        if ex["from"] == from_ and ex["to"] == to_:
            # Sprawdź czy gracz ma wystarczająco zwierząt
            if (from_ in DOGS and player[from_ + 's'] >= ex["cost"]) or (from_ in ANIMALS and player["animals"][from_] >= ex["cost"]):
                # Sprawdź czy w głównym stadzie jest docelowe zwierzę
                if (to_ in DOGS and mainHerd[to_ + 's'] > 0) or (to_ in ANIMALS and mainHerd[to_] > 0):
                    # Odejmij od gracza
                    if from_ in DOGS:
                        player[from_ + 's'] -= ex["cost"]
                    else:
                        player["animals"][from_] -= ex["cost"]
                    # Dodaj do głównego stada
                    if from_ in DOGS:
                        mainHerd[from_ + 's'] += ex["cost"]
                    else:
                        mainHerd[from_] += ex["cost"]
                    # Dodaj do gracza
                    if to_ in DOGS:
                        player[to_ + 's'] += 1
                        mainHerd[to_ + 's'] -= 1
                    else:
                        player["animals"][to_] += 1
                        mainHerd[to_] -= 1
                    log = f"Wymiana: {ex['cost']} {from_} na 1 {to_}"
                else:
                    log = f"Brak {to_} w głównym stadzie!"
            else:
                log = f"Za mało {from_} do wymiany!"
            break
    return player, mainHerd, log

@app.route('/game', methods=['GET'])
def get_game_route():
    return jsonify(get_game())

@app.route('/roll', methods=['POST'])
def roll_route():
    game = get_game()
    dice = roll_dice()
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
    player = dict(game["players"][game["currentPlayer"]])
    mainHerd = dict(game["mainHerd"])
    player, mainHerd, log = exchange_animals(player, mainHerd, from_, to_)
    game["players"][game["currentPlayer"]] = player
    game["mainHerd"] = mainHerd
    game["log"].append(log)
    save_game(game)
    return jsonify(game)

@app.route('/reset', methods=['POST'])
def reset_route():
    game = initial_game_state()
    save_game(game)
    return jsonify(game)

if __name__ == '__main__':
    app.run(port=4000, debug=True) 
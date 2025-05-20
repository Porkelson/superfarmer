# 🐾 Superfarmer

Gra planszowa Superfarmer – wersja webowa (React + Flask + Redis)

## Jak uruchomić projekt od zera

### 1. Sklonuj repozytorium (jeśli jeszcze nie masz)
```bash
git clone <adres_repo>
cd superfarmer
```

### 2. Backend (Flask + Redis)

#### a) Przejdź do katalogu backend
```bash
cd backend
```

#### b) Utwórz i aktywuj wirtualne środowisko Pythona
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# lub
venv\Scripts\activate   # Windows
```

#### c) Zainstaluj zależności
```bash
pip install -r requirements.txt
```

#### d) Upewnij się, że Redis jest uruchomiony
```bash
redis-server
```
Jeśli Redis już działa, nie uruchamiaj go ponownie.

#### e) Uruchom backend Flask
```bash
python app.py
```

### 3. Frontend (React)

#### a) Przejdź do katalogu frontend
```bash
cd ../frontend
```

#### b) Zainstaluj zależności
```bash
npm install
```

#### c) Uruchom frontend
```bash
npm start
```

Aplikacja powinna być dostępna pod adresem: [http://localhost:3000](http://localhost:3000)

---

## Funkcjonalności

- [x] Rzucanie kostkami
- [x] Rozmnażanie zwierząt
- [x] Ataki lisa i wilka
- [x] Obrona przez psy
- [x] Wymiana zwierząt (UI + logika)
- [x] Warunek zwycięstwa
- [x] Reset gry
- [x] Log zdarzeń
- [ ] Obsługa wielu graczy (lokalnie)
- [ ] Gra z botem
- [ ] Przełączanie tur
- [ ] Lepszy UI (plansza, animacje, multiplayer)

## Plany/progres
- [ ] Dodanie obsługi wielu graczy (przełączanie tury, oddzielne stada)
- [ ] Dodanie bota (AI)
- [ ] Ulepszenie UI/UX

---

Projekt do rozwoju – patrz checklistę powyżej! 
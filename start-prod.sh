#!/bin/bash

set -e

# Install backend dependencies if needed
if [ ! -d "backend/venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv backend/venv
fi

source backend/venv/bin/activate

if ! pip show flask > /dev/null 2>&1; then
  echo "Installing backend Python dependencies..."
  pip install -r backend/requirements.txt
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  cd ..
fi

# Start Redis if not already running
if ! pgrep -x "redis-server" > /dev/null; then
  echo "Starting Redis server..."
  redis-server > /dev/null 2>&1 &
  sleep 1
else
  echo "Redis server already running."
fi

# Start Flask backend
echo "Starting Flask backend..."
cd backend
source venv/bin/activate
export FLASK_APP=app.py
python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start React frontend
echo "Starting React frontend..."
cd frontend
npm start

# When frontend stops, kill backend
kill $BACKEND_PID
#!/bin/bash

# Start the Flask backend
echo "Starting Flask backend..."
cd backend
python main.py &
BACKEND_PID=$!

# Start the React frontend
echo "Starting React frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Handle graceful shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Keep the script alive
echo "Development environment is running!"
echo "Backend running on http://localhost:5000"
echo "Frontend running on http://localhost:5173"
echo "Press Ctrl+C to stop all services"
wait
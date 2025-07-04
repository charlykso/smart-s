#!/bin/bash

echo "Starting comprehensive fee management test..."

# Start the backend server in the background
cd api
echo "Starting backend server..."
nohup node server.js > ../server.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start the frontend development server in the background
cd frontend
echo "Starting frontend server..."
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "Servers starting... Check the following:"
echo "1. Backend API: http://localhost:3001"
echo "2. Frontend: http://localhost:5173"
echo "3. Backend logs: tail -f server.log"
echo "4. Frontend logs: tail -f frontend.log"

echo "Test the fee management page in your browser at:"
echo "http://localhost:5173/fees"

echo "To stop servers, run:"
echo "kill $BACKEND_PID $FRONTEND_PID"

# Keep script running
read -p "Press Enter to stop servers..."

# Clean up
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "Servers stopped."

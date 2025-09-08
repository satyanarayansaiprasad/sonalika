@echo off
echo 🚀 Starting Sonalika Jewellers Management System...
echo.

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo 🎯 Starting both frontend and backend...
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
npm run dev

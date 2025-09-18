@echo off
echo Starting Dhan Sathi Backend Server...
cd server
npm install
echo.
echo Starting server on port 5000...
start cmd /k "npm run dev"
cd ..
echo.
echo Wait for backend to initialize (5 seconds)...
timeout /t 5 /nobreak > nul
echo.
echo Starting React Frontend...
start cmd /k "npm run dev"
echo.
echo Setup complete! 
echo The app will be available at http://localhost:5173
@echo off
echo ===== Starting Dhan Sathi AI Application =====
echo.

echo Step 1: Starting backend server...
cd %~dp0\server
start cmd /k "node server.js"

echo.
echo Step 2: Wait for backend to initialize (3 seconds)...
timeout /t 3 /nobreak > nul

echo.
echo Step 3: Starting frontend development server...
cd %~dp0
start cmd /k "npm run dev"

echo.
echo ===== Setup Complete =====
echo.
echo Frontend will be available at: http://localhost:5173
echo Backend API available at: http://localhost:5000/api
echo.
echo Demo login credentials:
echo Email: demo@example.com
echo Password: password123
echo.
echo Press any key to exit this window...
pause > nul
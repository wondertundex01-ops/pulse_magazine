@echo off
title Pulse Magazine – Local Server
color 0A

echo.
echo  ==============================
echo    PULSE MAGAZINE – LOCAL DEV
echo  ==============================
echo.
echo  Starting server on http://localhost:4000 ...
echo  Press Ctrl+C to stop the server.
echo.

:: Kill any existing process on port 4000 (optional cleanup)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Open the browser after a short delay (1.5 s)
start "" /B cmd /C "timeout /T 2 /NOBREAK >nul && start http://localhost:4000"

:: Start the server (blocking – stays open in this window)
node server.js

pause

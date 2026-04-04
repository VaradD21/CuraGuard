@echo off
title Guardian — Brain API Server
echo ==========================================
echo    Project Guardian — Brain Startup
echo ==========================================

:: Start the FastAPI Brain server
start "Guardian Brain API" cmd /k ".venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info"

:: If ngrok is configured, start it
if "%NGROK_AUTHTOKEN%"=="" (
    echo [WARN] NGROK_AUTHTOKEN not set. Skipping ngrok tunnel.
    echo [INFO] Brain accessible on local network only: http://<your-ip>:8000
) else (
    echo [INFO] Starting ngrok tunnel...
    start "Guardian ngrok Tunnel" cmd /k "ngrok http 8000"
    timeout /t 3 /nobreak >nul
    echo [INFO] Check ngrok dashboard: http://127.0.0.1:4040 for your public URL.
    echo [INFO] Copy the HTTPS URL (e.g., https://xxxx.ngrok-free.app) into:
    echo [INFO]   - agent\src\appsettings.json  (BrainBaseUrl)
    echo [INFO]   - Parent phone browser (access dashboard at that URL)
)

echo.
echo [INFO] Brain is running. Keep this window open.
echo [INFO] Parent Dashboard: http://127.0.0.1:8000 (or your ngrok URL)
echo [INFO] API Docs: http://127.0.0.1:8000/docs
pause

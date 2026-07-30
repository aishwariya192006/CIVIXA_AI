@echo off
title Civixa AI - Master Launcher
color 0A
cls

echo.
echo  =====================================================
echo    CIVIXA AI - Starting All Services
echo  =====================================================
echo.

echo [1] Starting Agent 1 - Complaint Understanding (port 8001)...
start "Agent1-Understanding :8001" cmd /k "color 0B && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\agents\agent1_complaint_understanding && echo Starting Agent 1... && python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload"
timeout /t 2 /nobreak >nul

echo [2] Starting Agent 2 - Duplicate Detection (port 8002)...
start "Agent2-Duplicate :8002" cmd /k "color 0E && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\agents\agent2_duplicate_detection && echo Starting Agent 2... && python -m uvicorn main:app --host 127.0.0.1 --port 8002 --reload"
timeout /t 2 /nobreak >nul

echo [3] Starting Agent 3 - Department Routing (port 8003)...
start "Agent3-Routing :8003" cmd /k "color 0A && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\agents\agent3_department_routing && echo Starting Agent 3... && python -m uvicorn main:app --host 127.0.0.1 --port 8003 --reload"
timeout /t 2 /nobreak >nul

echo [4] Starting Agent 4 - Priority Assessment (port 8004)...
start "Agent4-Priority :8004" cmd /k "color 0C && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\agents\agent4_priority_assessment && echo Starting Agent 4... && python -m uvicorn main:app --host 127.0.0.1 --port 8004 --reload"
timeout /t 2 /nobreak >nul

echo [5] Starting Agent 5 - Officer Assignment (port 8005)...
start "Agent5-Assignment :8005" cmd /k "color 0D && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\agents\agent5_officer_assignment && echo Starting Agent 5... && python -m uvicorn main:app --host 127.0.0.1 --port 8005 --reload"
timeout /t 2 /nobreak >nul

echo [6] Starting Agent 6 - Resolution Verification (port 8006)...
start "Agent6-Verification :8006" cmd /k "color 09 && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\agents\agent6_resolution_verification && echo Starting Agent 6... && python -m uvicorn main:app --host 127.0.0.1 --port 8006 --reload"
timeout /t 2 /nobreak >nul

echo [7] Starting Express Backend (port 5000)...
start "Backend-Express :5000" cmd /k "color 06 && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\backend && echo Starting Backend... && node server.js"
timeout /t 3 /nobreak >nul

echo [8] Starting React Frontend (port 5173)...
start "Frontend-React :5173" cmd /k "color 0F && cd /d C:\Users\abiaj\Desktop\CIVIXA_AI\CIVIXA_AI\frontend && echo Starting Frontend... && npm run dev"

echo.
echo  =====================================================
echo   Waiting 15 seconds for all services to start...
echo  =====================================================
timeout /t 15 /nobreak

echo.
echo  Opening browser...
start http://localhost:5173
start http://localhost:8001/docs

echo.
echo  =====================================================
echo   All services launched!
echo.
echo   Frontend  : http://localhost:5173
echo   Backend   : http://localhost:5000/health
echo   Agent 1   : http://localhost:8001/docs
echo   Agent 2   : http://localhost:8002/docs
echo   Agent 3   : http://localhost:8003/docs
echo   Agent 4   : http://localhost:8004/docs
echo   Agent 5   : http://localhost:8005/docs
echo   Agent 6   : http://localhost:8006/docs
echo  =====================================================
echo.
pause

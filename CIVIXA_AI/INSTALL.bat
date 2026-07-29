@echo off
title Civixa AI - Install Dependencies
color 0B

echo.
echo  ============================================
echo   CIVIXA AI - Installing All Dependencies
echo  ============================================
echo.

echo [Step 1/3] Installing Python dependencies for all agents...
echo.

for %%A in (agent1_complaint_understanding agent2_duplicate_detection agent3_department_routing agent4_priority_assessment agent5_officer_assignment agent6_resolution_verification) do (
    echo Installing %%A...
    cd /d "%~dp0agents\%%A"
    pip install -r requirements.txt
    echo Done: %%A
    echo.
)

echo [Step 2/3] Installing Node.js backend dependencies...
cd /d "%~dp0backend"
npm install
echo Done: Backend

echo.
echo [Step 3/3] Installing React frontend dependencies...
cd /d "%~dp0frontend"
npm install
echo Done: Frontend

echo.
echo  ============================================
echo   All dependencies installed successfully!
echo   Now add your GEMINI_API_KEY to each agent's .env file
echo   Then run START_ALL.bat
echo  ============================================
echo.
pause

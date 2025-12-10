@echo off
echo ==========================================
echo   Military Asset Manager - GitHub Pusher
echo ==========================================

:: Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git for Windows and RESTART this terminal.
    pause
    exit /b
)

echo.
echo [1/5] Initializing Git repository...
git init

echo.
echo [2/5] Adding files (this may take a moment)...
git add .

echo.
echo [3/5] Committing files...
git commit -m "Initial commit of Military Asset Manager"

echo.
echo [4/5] remote repository...
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/user/repo.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Exiting.
    pause
    exit /b
)

git remote add origin %REPO_URL%
git branch -M main

echo.
echo [5/5] Pushing to GitHub...
echo (You may be asked to sign in via a browser window)
git push -u origin main

echo.
echo ==========================================
echo   DONE! Your code is now on GitHub.
echo ==========================================
pause

@echo off
setlocal enabledelayedexpansion
title User Management System - Dev Server

:: 1. Navigate to the directory containing this batch file
cd /d "%~dp0"

echo =====================================================================
echo           USER MANAGEMENT SYSTEM - LAUNCH SCRIPT
echo =====================================================================
echo Working Directory: %CD%
echo.

:: 2. Check Node.js availability
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH.
    echo Please install Node.js v18 or newer from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js detected: !NODE_VERSION!

:: 3. Check npm availability
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in your system PATH.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo [OK] npm detected: !NPM_VERSION!

:: 4. Verify package.json existence
if not exist "package.json" (
    echo [ERROR] package.json not found in %CD%
    echo Make sure this batch file is in the root directory of the project.
    echo.
    pause
    exit /b 1
)
echo [OK] Project package.json verified.

:: 5. Check and install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo.
    echo [INFO] node_modules folder missing. Installing dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        echo.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
) else (
    echo [OK] Dependencies node_modules found.
)

:: 6. Check .env.local configuration (never prints or reveals secret values)
echo.
if not exist ".env.local" (
    echo ---------------------------------------------------------------------
    echo [NOTICE] .env.local not found in project root.
    echo ---------------------------------------------------------------------
    echo The application will run, but authentication and live database
    echo operations require Supabase credentials.
    echo.
    echo To configure Supabase:
    echo  1. Copy .env.example to .env.local
    echo  2. Open .env.local and add your Supabase Project URL, Anon Key,
    echo     and Service Role Key from your Supabase Dashboard settings.
    echo  3. Execute the database migration in supabase\schema.sql in your
    echo     Supabase SQL Editor.
    echo ---------------------------------------------------------------------
    echo.
) else (
    echo [OK] .env.local detected.
    findstr /i "your-supabase-project-url" ".env.local" >nul 2>nul
    if !errorlevel! equ 0 (
        echo [WARNING] .env.local contains unconfigured placeholder values.
        echo Please replace 'your-supabase-project-url' with your actual Supabase URL.
    )
)

:: 7. Start Next.js development server
echo Starting Next.js development server on http://localhost:3000...
echo.
echo Available Application Endpoints:
echo   - Landing Page:      http://localhost:3000
echo   - User Registration: http://localhost:3000/register
echo   - User Sign In:      http://localhost:3000/login
echo   - User Dashboard:    http://localhost:3000/user/dashboard
echo.
echo Press Ctrl+C in this terminal to stop the server at any time.
echo =====================================================================
echo.

call npm run dev

:: 8. Keep terminal open if server exits or fails
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Development server exited with error code %errorlevel%.
)

echo.
pause

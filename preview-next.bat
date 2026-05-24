@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

cd /d "%~dp0"

set "START_PORT=3200"
set "MAX_PORT=3299"
set "PORT=%START_PORT%"

if "%~1"=="--help" goto usage
if "%~1"=="/?" goto usage

if not exist "package.json" (
  echo [ERROR] package.json was not found.
  echo Run this bat from the project root.
  pause
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Install Node.js, then run this bat again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found.
  echo Check your Node.js / npm installation.
  pause
  exit /b 1
)

where curl.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] curl.exe was not found.
  echo Run this bat in an environment with Windows curl.exe.
  pause
  exit /b 1
)

if not exist "node_modules\next" (
  echo [ERROR] node_modules was not found.
  echo Run this command first:
  echo.
  echo   npm install
  echo.
  pause
  exit /b 1
)

call :find_running_preview
if not errorlevel 1 (
  set "ROOT_URL=http://localhost:%PORT%"
  echo.
  echo [macanon] Existing Next.js preview found.
  echo   Port: %PORT%
  echo   URL : !ROOT_URL!
  echo.
  echo Opening browser...
  start "" "!ROOT_URL!"
  exit /b 0
)

:find_port
if %PORT% GTR %MAX_PORT% (
  echo [ERROR] No free port was found from %START_PORT% to %MAX_PORT%.
  pause
  exit /b 1
)

set "LOCK_DIR=%TEMP%\macanonlab-next-preview-%PORT%.lock"

call :is_port_free %PORT%
if errorlevel 1 (
  set /a PORT+=1
  goto find_port
)

if exist "!LOCK_DIR!" (
  rmdir /s /q "!LOCK_DIR!" >nul 2>nul
)

mkdir "!LOCK_DIR!" >nul 2>nul
if errorlevel 1 (
  set /a PORT+=1
  goto find_port
)

set "ROOT_URL=http://localhost:%PORT%"

echo.
echo [macanon] Starting Next.js preview.
echo   Port: %PORT%
echo   URL : %ROOT_URL%
echo.

start "MacanonLab Next %PORT%" /D "%~dp0" cmd /k "npm run dev -- -p %PORT%"

echo Waiting for the server...
call :wait_for_http %PORT%
if errorlevel 1 (
  echo.
  echo [ERROR] http://localhost:%PORT% did not respond.
  echo Check the Next.js log in the other window.
  echo If .next is broken, see README.md for the cleanup steps.
  pause
  exit /b 1
)

echo Opening browser...
start "" "%ROOT_URL%"

echo.
echo Preview is ready. Press Ctrl+C in the Next.js window to stop the server.
exit /b 0

:is_port_free
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul 2>nul
if not errorlevel 1 exit /b 1
exit /b 0

:find_running_preview
for /L %%P in (%START_PORT%,1,%MAX_PORT%) do (
  curl.exe -fsS --max-time 1 "http://localhost:%%P/" 2>nul | findstr /I /C:"macanon" >nul 2>nul
  if not errorlevel 1 (
    set "PORT=%%P"
    exit /b 0
  )
)
exit /b 1

:wait_for_http
set "WAIT_PORT=%~1"
for /L %%I in (1,1,60) do (
  curl.exe -fsS --max-time 2 -o nul "http://localhost:%WAIT_PORT%" >nul 2>nul
  if not errorlevel 1 exit /b 0
  timeout /t 1 /nobreak >nul
)
exit /b 1

:usage
echo macanon Next.js local preview
echo.
echo Usage:
echo   preview-next.bat
echo.
echo Behavior:
echo   Finds a free port starting at 3200.
echo   Runs npm run dev -- -p ^<port^>.
echo   Opens only the top page in the browser.
exit /b 0

@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

set "PROJECT_DIR=%~dp0"
pushd "%PROJECT_DIR%" >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Could not enter the project directory.
  echo Path: %PROJECT_DIR%
  pause
  exit /b 1
)

set "START_PORT=3100"
set "MAX_PORT=3199"
set "PORT=%START_PORT%"

if "%~1"=="--help" goto usage
if "%~1"=="/?" goto usage

if not exist "package.json" (
  echo [ERROR] package.json was not found.
  echo This bat must be placed in the project root.
  echo Current directory:
  cd
  popd >nul 2>nul
  pause
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Install Node.js, then run this bat again.
  popd >nul 2>nul
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found.
  echo Check your Node.js / npm installation.
  popd >nul 2>nul
  pause
  exit /b 1
)

if not exist "node_modules\next" (
  echo [ERROR] node_modules was not found.
  echo Run this command first:
  echo.
  echo   npm install
  echo.
  popd >nul 2>nul
  pause
  exit /b 1
)

:find_port
if %PORT% GTR %MAX_PORT% (
  echo [ERROR] No free port was found from %START_PORT% to %MAX_PORT%.
  popd >nul 2>nul
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
set "PRODUCTS_URL=%ROOT_URL%/products"
set "PREVIEW_DIST_DIR=.next-preview-%PORT%"

echo.
echo [macanon] Starting Next.js local preview.
echo   Project : %CD%
echo   Port    : %PORT%
echo   Cache   : %PREVIEW_DIST_DIR%
echo   Top     : %ROOT_URL%/
echo   Products: %PRODUCTS_URL%
echo.

start "MacanonLab Next %PORT%" /D "%CD%" cmd /k "set NEXT_PREVIEW_DIST_DIR=%PREVIEW_DIST_DIR%&& npm.cmd run dev -- -p %PORT%"

echo Waiting for the server...
call :wait_for_http %PORT%
if errorlevel 1 (
  echo.
  echo [ERROR] http://localhost:%PORT%/ did not respond.
  echo Check the Next.js log in the other window.
  echo If .next looks broken, stop all Next.js windows and delete .next:
  echo.
  echo   rmdir /s /q .next
  echo   rmdir /s /q .next-preview-*
  echo.
  rmdir /s /q "!LOCK_DIR!" >nul 2>nul
  popd >nul 2>nul
  pause
  exit /b 1
)

echo Opening browser...
start "" "%ROOT_URL%/"
start "" "%PRODUCTS_URL%"

echo.
echo Preview is ready.
echo Stop it with Ctrl+C in the Next.js window.
popd >nul 2>nul
exit /b 0

:is_port_free
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "try { $client = [System.Net.Sockets.TcpClient]::new('127.0.0.1', %~1); $client.Close(); exit 1 } catch { exit 0 }" >nul 2>nul
if errorlevel 1 exit /b 1
exit /b 0

:wait_for_http
set "WAIT_PORT=%~1"
for /L %%I in (1,1,60) do (
  node -e "const http=require('http');const req=http.get('http://127.0.0.1:%WAIT_PORT%/',(res)=>{res.resume();process.exit(res.statusCode<500?0:1)});req.on('error',()=>process.exit(1));req.setTimeout(2000,()=>{req.destroy();process.exit(1)});" >nul 2>nul
  if not errorlevel 1 exit /b 0
  ping 127.0.0.1 -n 2 >nul
)
exit /b 1

:usage
echo macanon Next.js local preview
echo.
echo Usage:
echo   preview-next.bat
echo.
echo Behavior:
echo   Finds a free port starting at 3100.
echo   Runs npm run dev -- -p ^<port^>.
echo   Opens http://localhost:^<port^>/ and /products.
echo   If 3100 is already in use, it tries 3101, 3102, ...
popd >nul 2>nul
exit /b 0

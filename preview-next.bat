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

set "PORT=3100"

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

call :is_port_free
if errorlevel 1 (
  echo [ERROR] Port 3100 is already in use.
  echo 3100が使用中です。既存サーバーを閉じてください。
  popd >nul 2>nul
  pause
  exit /b 1
)

set "ROOT_URL=http://localhost:%PORT%"
set "PRODUCTS_URL=%ROOT_URL%/products"

echo.
echo [macanon] Starting Next.js local preview.
echo   Project : %CD%
echo   Port    : %PORT%
echo   Top     : %ROOT_URL%/
echo   Products: %PRODUCTS_URL%
echo.

start "MacanonLab Next %PORT%" /D "%CD%" cmd /k "npm.cmd run dev -- -p %PORT%"

echo Waiting for the server...
call :wait_for_http %PORT%
if errorlevel 1 (
  echo.
  echo [ERROR] http://localhost:%PORT%/ did not respond.
  echo Check the Next.js log in the other window.
  echo If .next looks broken, stop all Next.js windows and delete .next:
  echo.
  echo   rmdir /s /q .next
  echo.
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
node -e "const net=require('net');const server=net.createServer();server.once('error',()=>process.exit(1));server.once('listening',()=>server.close(()=>process.exit(0)));server.listen(3100,'0.0.0.0');" >nul 2>nul
exit /b %errorlevel%

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
echo   Runs npm run dev -- -p 3100.
echo   Opens http://localhost:3100/ and /products.
echo   If 3100 is already in use, it asks you to close the existing server.
popd >nul 2>nul
exit /b 0

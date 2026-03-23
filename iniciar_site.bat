@echo off
echo ==========================================
echo    INICIANDO SERVIDOR - RESERVAS
echo    PORTA: 3000
echo ==========================================
echo.

:: Tentar entrar na pasta correta
cd /d "%~dp0"

echo [OK] Pasta selecionada: %CD%
echo.
echo Tentando iniciar com NPM...
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] NPM falhou. Tentando iniciar diretamente com NODE...
    node node_modules\vite\bin\vite.js --port 3000
)

echo.
echo O processo terminou. Se houve erro, copie as mensagens acima.
pause

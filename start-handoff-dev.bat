@echo off
title HandsOff Dev Launcher

echo HandsOff backend ve frontend baslatiliyor...

start "HandsOff Backend" powershell -NoExit -Command "cd 'C:\Users\Lenovo\Desktop\RestoranPanel\backend'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

timeout /t 3 > nul

start "HandsOff Frontend" powershell -NoExit -Command "cd 'C:\Users\Lenovo\Desktop\RestoranPanel'; & 'C:\Program Files\nodejs\npm.cmd' run dev -- --force"

echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Acilan iki PowerShell penceresini kapatma.
pause

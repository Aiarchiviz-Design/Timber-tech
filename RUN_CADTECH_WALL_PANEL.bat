@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 "%~dp0Run_CadTech_Wall_Panel.py"
) else (
  python "%~dp0Run_CadTech_Wall_Panel.py"
)
if errorlevel 1 pause
endlocal

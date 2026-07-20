@echo off
rem ZAYDEN D1 — item 11: sweeps every d1os backup out of Downloads into the vault.
rem Double-click after any export. Files keep their date names; nothing is overwritten blindly.
setlocal
set VAULT=%~dp005-BACKUPS
if not exist "%VAULT%" mkdir "%VAULT%"
set FOUND=0
for %%F in ("%USERPROFILE%\Downloads\d1os-backup-*.json") do (
  move /-Y "%%F" "%VAULT%\" >nul && set FOUND=1 && echo   vaulted: %%~nxF
)
if "%FOUND%"=="0" (echo No d1os-backup files in Downloads - export one in the app first: TRACK ^> Data ^> EXPORT.) else (echo Done - backups are in ZAYDEN-D1\05-BACKUPS.)
pause

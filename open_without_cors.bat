@echo off
echo Membuka Brave dengan CORS disabled...
echo.

REM Cari lokasi Brave
set BRAVE_PATH=""
if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set BRAVE_PATH="C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
) else if exist "C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set BRAVE_PATH="C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe"
) else (
    echo Brave tidak ditemukan! Pastikan Brave sudah terinstall.
    pause
    exit /b 1
)

REM Buat direktori temporary jika belum ada
if not exist "C:\temp\brave_dev" mkdir "C:\temp\brave_dev"

REM Buka Brave dengan CORS disabled
echo Membuka Brave dengan pengaturan khusus...
%BRAVE_PATH% --disable-web-security --user-data-dir="C:\temp\brave_dev" --allow-file-access-from-files

echo.
echo Brave telah dibuka dengan CORS disabled.
echo Sekarang buka file index.html di browser ini.
pause 
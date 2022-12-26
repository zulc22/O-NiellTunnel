@echo off
cd /d "%~dp0"
move sqldata\.gitignore sqlignore
rd /s /q sqldata
md sqldata
move sqlignore sqldata\.gitignore
@echo off
cd /d "%~dp0"
docker-compose stop
call :wipe_keep_ignore sqldata
call :wipe_keep_ignore dynamic\temp
call :wipe_keep_ignore dynamic\thumbs
call :wipe_keep_ignore dynamic\videos
goto:eof

:wipe_keep_ignore
move %1\.gitignore _ignore
rd /s /q %1
md %1
move _ignore %1\.gitignore
goto:eof
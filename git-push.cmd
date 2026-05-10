@echo off

cd /d %~dp0..

git remote add bot-origin https://github.com/CHACCHAN/cc-discord-framework.git 2>nul

git add .
git commit -m "chore: sync framework core from subdir script"

git subtree push --prefix=discord-bot/core bot-origin main

pause
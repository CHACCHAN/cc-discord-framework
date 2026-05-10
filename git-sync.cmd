@echo off
chcp 65001 >nul

cd /d %~dp0..

echo.
echo [1/4] リモートリポジトリ(bot-origin)の設定を更新中...
git remote remove bot-origin 2>nul
git remote add bot-origin https://github.com/CHACCHAN/CC-System.git

echo.
echo [2/4] ローカルの最新の変更を保存しています...
git add .
git commit -m "chore: sync bot core from subdir script"

echo.
echo [3/4] GitHub側の新しい変更を取り込み (Subtree Pull) しています...
git subtree pull --prefix=discord-bot bot-origin main -m "Merge remote update"

echo.
echo [4/4] GitHubへアップロード (Subtree Push) しています...
git subtree push --prefix=discord-bot bot-origin main

pause
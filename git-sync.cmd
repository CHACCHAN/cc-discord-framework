@echo off

chcp 65001 >nul

cd /d %~dp0..

echo.
echo [1/4] リモートリポジトリ(bot-origin)の設定を確認中...
git remote add bot-origin https://github.com/CHACCHAN/cc-discord-framework.git 2>nul

echo.
echo [2/4] ローカルの最新の変更を保存 (Commit) しています...
git add .
git commit -m "chore: sync framework core from subdir script"

echo.
echo [3/4] GitHub側の新しい変更を取り込み (Subtree Pull) しています...
git subtree pull --prefix=discord-bot bot-origin main -m "Merge remote update"

echo.
echo [4/4] GitHubへアップロード (Subtree Push) しています...
git subtree push --prefix=discord-bot bot-origin main

pause
@echo off
cd /d %~dp0
"C:\Program Files\nodejs\npm.cmd" --prefix frontend run dev

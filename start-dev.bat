@echo off
echo 正在启动五险一金计算器开发服务器...
echo.

:: 清理可能的进程锁
if exist ".next\dev\lock" (
    echo 清理进程锁文件...
    del /Q ".next\dev\lock"
)

:: 清理 .next 缓存
if exist ".next" (
    echo 清理缓存文件...
    rmdir /S /Q ".next"
)

:: 启动开发服务器
echo 启动服务器...
npm run dev

pause
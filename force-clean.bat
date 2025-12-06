@echo off
echo ========================================
echo 强制清理所有 Node.js 进程和缓存
echo ========================================
echo.

:: 停止所有 Node.js 进程
echo 正在停止所有 Node.js 进程...
taskkill /F /IM node.exe

:: 等待进程完全停止
timeout /t 3 /nobreak >nul

:: 清理 .next 目录
echo.
echo 正在清理 .next 缓存...
if exist ".next" (
    rmdir /S /Q ".next"
    echo .next 目录已删除
)

:: 清理 node_modules/.cache
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache"
    echo node_modules\.cache 已删除
)

:: 检查并删除锁文件
if exist ".next\dev\lock" (
    del /Q ".next\dev\lock"
    echo 锁文件已删除
)

echo.
echo ========================================
echo 清理完成！
echo ========================================
echo.
echo 即将重新启动开发服务器...
timeout /t 2 /nobreak >nul

:: 启动开发服务器
npm run dev
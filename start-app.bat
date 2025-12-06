@echo off
color 0A
echo ============================================
echo 五险一金计算器 - 启动程序
echo ============================================
echo.

REM 切换到项目目录
cd /d "%~dp0"

REM 停止所有可能冲突的进程
echo [1/4] 停止所有 Node.js 进程...
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| find "PID:"') do (
    taskkill /F /PID %%i >nul 2>&1
)

REM 清理缓存
echo [2/4] 清理缓存文件...
if exist ".next" rmdir /S /Q ".next" >nul 2>&1
if exist "node_modules\.cache" rmdir /S /Q "node_modules\.cache" >nul 2>&1

REM 检查环境
echo [3/4] 检查环境配置...
if not exist ".env.local" (
    echo 错误：未找到 .env.local 文件！
    pause
    exit /b 1
)

REM 启动服务器
echo [4/4] 启动服务器...
echo.
echo ============================================
echo 正在启动服务器，请稍候...
echo ============================================
echo.
echo 服务器启动后，请访问：http://localhost:3000
echo.
echo 按 Ctrl+C 可以停止服务器
echo ============================================
echo.

npm run dev
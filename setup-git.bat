@echo off
echo ========================================
echo Git 快速配置脚本
echo ========================================
echo.

REM 设置Git用户信息
echo [1/4] 设置Git用户信息...
git config --global user.name "SocialInsuranceCalculator"
git config --global user.email "socialinsurance@example.com"
echo    ✓ 用户信息已设置

REM 设置代理
echo.
echo [2/4] 设置Git代理...
git config --global http.proxy http://127.0.0.1:17890
git config --global https.proxy http://127.0.0.1:17890
echo    ✓ 代理已设置 (127.0.0.1:17890)

REM 显示当前配置
echo.
echo [3/4] 当前Git配置：
echo    用户名: %USERNAME%
git config --global user.name
echo    邮箱:
git config --global user.email
echo    HTTP代理:
git config --global --get http.proxy
echo    HTTPS代理:
git config --global --get https.proxy

REM 提示创建新仓库
echo.
echo [4/4] 如需创建新仓库，请按顺序执行：
echo    git init
echo    git remote add origin https://github.com/WastematerialFeng/你的项目名.git
echo    git add .
echo    git commit -m "Initial commit"
echo    git push -u origin main
echo.

echo ========================================
echo 配置完成！
echo ========================================
pause
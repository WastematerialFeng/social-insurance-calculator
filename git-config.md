# Git 配置信息

## GitHub 账户信息
- **用户名**: WastematerialFeng
- **仓库地址**: https://github.com/WastematerialFeng/

## Git 全局配置
```bash
git config --global user.name "SocialInsuranceCalculator"
git config --global user.email "socialinsurance@example.com"
```

## 代理配置
- **VPN软件**: OK云加速器
- **代理地址**: 127.0.0.1:17890
- **代理类型**: HTTP/HTTPS

### Git 代理配置命令
```bash
# 设置代理
git config --global http.proxy http://127.0.0.1:17890
git config --global https.proxy http://127.0.0.1:17890

# 查看代理配置
git config --global --get http.proxy
git config --global --get https.proxy

# 取消代理（如果需要）
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 新项目初始化步骤
1. 初始化仓库：`git init`
2. 添加远程仓库：`git remote add origin https://github.com/WastematerialFeng/项目名.git`
3. 配置代理（如果VPN开启）
4. 添加文件：`git add .`
5. 提交：`git commit -m "Initial commit"`
6. 推送：`git push -u origin main`

## 常用 Git 命令
```bash
# 查看远程仓库
git remote -v

# 查看状态
git status

# 查看提交历史
git log --oneline

# 创建新分支
git branch 分支名
git checkout 分支名

# 合并分支
git merge 分支名

# 拉取更新
git pull origin main
```
# Vercel 部署配置指南

## 环境变量配置

在 Vercel 上成功部署此项目需要配置以下环境变量：

### 1. 在 Vercel 控制台添加环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL | 例如：https://pdukytbhcoyaddyxykgm.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase 匿名密钥 | 从 Supabase 项目设置中获取 |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 Supabase 服务角色密钥 | 从 Supabase 项目设置中获取 |

### 2. 如何获取 Supabase 凭证

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制以下内容：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. 环境变量分类

在 Vercel 中，你需要为不同环境设置变量：

- **Production**: 生产环境
- **Preview**: 预览环境（每个 PR 会创建）
- **Development**: 开发环境

建议至少配置 **Production** 和 **Preview** 环境。

### 4. 配置步骤截图示例

```
Environment Variables
├── NEXT_PUBLIC_SUPABASE_URL
│   ├── Production: https://your-project.supabase.co
│   ├── Preview: https://your-project.supabase.co
│   └── Development: https://your-project.supabase.co
├── NEXT_PUBLIC_SUPABASE_ANON_KEY
│   ├── Production: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
│   ├── Preview: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
│   └── Development: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└── SUPABASE_SERVICE_ROLE_KEY
    ├── Production: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ├── Preview: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    └── Development: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. 重要提醒

- ✅ 确保所有三个环境变量都已添加
- ✅ 不要提交真实的密钥到 Git 仓库
- ✅ `SUPABASE_SERVICE_ROLE_KEY` 是敏感信息，只应在服务器端使用
- ✅ 配置完成后需要重新部署才能生效

### 6. 部署后验证

部署完成后，你可以通过以下方式验证配置：

1. 访问部署的网站
2. 尝试上传 Excel 文件
3. 检查浏览器控制台是否有 Supabase 相关错误

### 7. 常见问题

**Q: 部署后出现 "supabaseUrl is required" 错误**
A: 这表示环境变量未正确配置，请检查所有必需的环境变量是否已添加。

**Q: API 调用失败**
A: 确认 Supabase 项目的 CORS 设置允许你的 Vercel 域名。

**Q: 数据库连接失败**
A: 检查 Supabase 项目是否处于活跃状态，表是否已创建。

## 快速配置命令

如果你使用 Vercel CLI，可以通过以下命令快速添加环境变量：

```bash
# 设置生产环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 设置预览环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```
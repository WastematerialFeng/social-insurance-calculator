# 五险一金计算器

一个基于 Next.js 和 Supabase 的 Web 应用，用于计算公司应承担的员工社保公积金费用。

## 功能特点

- 📊 **数据管理**：支持 Excel 文件上传城市标准和员工工资数据
- 🏙️ **多城市支持**：支持不同城市的社保标准
- 💰 **自动计算**：根据工资和城市标准自动计算社保费用
- 📈 **结果展示**：清晰的表格展示计算结果和统计信息
- 📱 **响应式设计**：适配各种屏幕尺寸

## 技术栈

- **前端框架**：Next.js (App Router)
- **UI 框架**：Tailwind CSS
- **数据库**：Supabase
- **数据处理**：xlsx 库
- **图标**：Lucide React

## 项目结构

```
social-insurance-calculator/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── upload/        # 文件上传 API
│   │   ├── calculate/     # 计算逻辑 API
│   │   ├── results/       # 结果查询 API
│   │   └── templates/     # Excel 模板下载 API
│   ├── upload/            # 上传页面
│   ├── results/           # 结果页面
│   ├── page.tsx           # 主页
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   └── upload/           # 上传相关组件
├── lib/                  # 工具库
│   ├── supabase.ts       # Supabase 配置
│   ├── calculator.ts     # 计算逻辑
│   ├── excel-parser.ts   # Excel 解析
│   └── template-generator.ts # Excel 模板生成
├── types/                # TypeScript 类型定义
├── scripts/              # 脚本文件
│   ├── setup-database.sql # 数据库初始化
│   └── insert-demo-data.js # 演示数据插入
└── public/               # 静态文件
```

## 快速开始

### 1. 环境准备

确保已安装 Node.js (推荐 v18 或更高版本)。

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制项目 URL 和 API 密钥
3. 创建 `.env.local` 文件并配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. 初始化数据库

在 Supabase SQL 编辑器中运行 `scripts/setup-database.sql` 中的 SQL 语句，创建所需的表结构。

### 5. 运行项目

```bash
npm run dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看应用。

### 6. 插入演示数据（可选）

运行以下命令插入演示数据用于测试：

```bash
node scripts/insert-demo-data.js
```

## 使用说明

### 1. 上传数据

#### 城市标准数据格式

Excel 文件应包含以下列：
- `city_name`：城市名称（如：佛山）
- `year`：年份（如：2024）
- `base_min`：社保基数下限
- `base_max`：社保基数上限
- `rate`：总缴费比例（如：0.014）

#### 员工工资数据格式

Excel 文件应包含以下列：
- `employee_id`：员工工号（如：0001）
- `employee_name`：员工姓名（如：张三）
- `month`：工资月份（YYYYMM 格式，如：202401）
- `salary_amount`：工资金额

### 2. 执行计算

1. 选择要计算的城市和年份
2. 点击"执行社保费用计算"
3. 系统将自动计算所有员工的社保费用

### 3. 查看结果

在结果页面可以：
- 查看每位员工的详细计算结果
- 按城市和年份筛选
- 下载结果为 CSV 文件
- 查看统计汇总信息

## 计算规则

### 缴费基数确定

- 如果月平均工资 < 基数下限 → 使用基数下限
- 如果月平均工资 > 基数上限 → 使用基数上限
- 如果在区间内 → 使用实际月平均工资

### 费用承担比例

- 总比例：1.4%
- 公司承担：70%（0.98%）
- 个人承担：30%（0.42%）

## 注意事项

1. 上传的 Excel 文件必须是 `.xlsx` 或 `.xls` 格式
2. 文件大小不超过 10MB
3. 重复上传会覆盖已有数据
4. 计算结果可以随时清空重新计算

## 部署

本项目可以轻松部署到 Vercel 或其他支持 Next.js 的平台。

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

## 许可证

MIT License

---

## Git 配置信息（供 Claude 使用）

### GitHub 账户
- **用户名**: WastematerialFeng
- **仓库地址**: https://github.com/WastematerialFeng/

### Git 全局配置
```bash
git config --global user.name "SocialInsuranceCalculator"
git config --global user.email "socialinsurance@example.com"
```

### 代理配置（VPN: OK云加速器）
- **代理地址**: 127.0.0.1:17890
- **设置命令**:
```bash
git config --global http.proxy http://127.0.0.1:17890
git config --global https.proxy http://127.0.0.1:17890
```

### 快速脚本
运行 `setup-git.bat` 可自动配置以上所有设置

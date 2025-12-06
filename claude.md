# 五险一金计算器项目 - 上下文管理中枢

## 项目目标
构建一个迷你的"五险一金"计算器Web应用。核心功能是根据预设的员工工资数据和城市社保标准，计算出公司为每位员工应缴纳的社保公积金费用，并将结果清晰地展示出来。

## 技术栈
- **前端框架**: Next.js (App Router)
- **UI/样式**: Tailwind CSS
- **数据库/后端**: Supabase
- **数据处理**: xlsx库（处理Excel文件）

## 数据结构设计

### 1. cities表（城市标准表）
- **id** (主键, int): 唯一标识
- **city_name** (text): 城市名称，如"佛山"
- **year** (text): 适用年度，如"2024"
- **base_min** (int): 社保基数下限，如4546
- **base_max** (int): 社保基数上限，如26421
- **rate** (float): 简化的综合缴纳比例，如0.014

### 2. salaries表（员工工资表）
- **id** (主键, int): 唯一标识
- **employee_id** (text): 员工工号，如"0001"
- **employee_name** (text): 员工姓名，如"张三"
- **month** (text): 年份月份（YYYYMM格式），如"202401"
- **salary_amount** (int): 该月工资金额

### 3. results表（计算结果表）
- **id** (主键, int): 唯一标识
- **employee_name** (text): 员工姓名
- **avg_salary** (float): 年度月平均工资
- **contribution_base** (float): 最终缴费基数
- **company_fee** (float): 公司缴纳金额
- **created_at** (timestamp): 记录创建时间

## 核心业务逻辑

### 计算流程
1. **数据读取**: 从salaries表读取所有员工工资数据
2. **分组计算**: 按employee_name分组，计算每位员工的年度月平均工资
3. **获取标准**: 从cities表获取指定城市的社保标准（以佛山为例）
4. **基数确定**:
   - 如果年度月平均工资 < base_min → 使用base_min
   - 如果年度月平均工资 > base_max → 使用base_max
   - 如果在范围内 → 使用年度月平均工资
5. **计算金额**: 公司缴纳金额 = 缴费基数 × rate
6. **存储结果**: 将计算结果存入results表

## 前端功能架构

### 主页 (/)
- 两个功能卡片布局
- **数据上传卡片**: 跳转到 /upload
- **结果查询卡片**: 跳转到 /results
- 简洁现代的UI设计

### 数据上传页 (/upload)
- **Excel上传功能**:
  - 支持cities表数据导入
  - 支持salaries表数据导入
- **计算触发按钮**: "执行计算并存储结果"
- 上传进度和结果反馈

### 结果展示页 (/results)
- **自动数据加载**: 从results表获取数据
- **表格展示**: 清晰展示所有计算结果
- **响应式设计**: 适配不同屏幕尺寸

## 开发任务清单 (TODO List)

### Phase 1: 环境初始化
- [ ] 创建Next.js项目（npx create-next-app@latest --typescript --tailwind --app）
- [ ] 安装必要依赖
  ```
  npm install @supabase/supabase-js xlsx lucide-react
  ```
- [ ] 配置环境变量文件 (.env.local)
- [ ] 设置Supabase项目和数据库

### Phase 2: 项目基础结构
- [ ] 创建目录结构
  ```
  /app
    /layout.tsx
    /page.tsx
    /upload
      /page.tsx
    /results
      /page.tsx
  /components
    /ui
    /forms
  /lib
    /supabase.ts
    /calculator.ts
    /excel-parser.ts
  /types
    /index.ts
  ```
- [ ] 配置TypeScript类型定义
- [ ] 设置Tailwind CSS自定义样式

### Phase 3: 数据库与后端
- [ ] 在Supabase创建数据表
- [ ] 编写Supabase客户端配置
- [ ] 实现数据操作函数
  - [ ] 上传Excel数据到数据库
  - [ ] 查询工资数据
  - [ ] 存储计算结果
- [ ] 实现核心计算逻辑

### Phase 4: 前端页面开发
- [ ] 开发主页组件和布局
- [ ] 实现Excel上传功能
- [ ] 创建结果展示表格组件
- [ ] 添加加载状态和错误处理

### Phase 5: 功能完善
- [ ] 数据验证（Excel格式、必填字段等）
- [ ] 错误处理和用户提示
- [ ] 性能优化
- [ ] 响应式设计调整

### Phase 6: 测试与部署
- [ ] 功能测试
- [ ] 边界情况测试
- [ ] 部署到生产环境

## 关键代码模块

### 1. Supabase配置 (/lib/supabase.ts)
```typescript
// 数据库连接和基本操作封装
```

### 2. 计算逻辑 (/lib/calculator.ts)
```typescript
// 五险一金计算核心算法
```

### 3. Excel处理 (/lib/excel-parser.ts)
```typescript
// Excel文件解析和数据转换
```

### 4. 类型定义 (/types/index.ts)
```typescript
// 所有数据结构的TypeScript类型
```

## 项目注意事项
1. **数据安全**: 确保敏感数据（员工薪资）的安全存储
2. **计算准确性**: 严格按照业务规则实现计算逻辑
3. **用户体验**: 提供清晰的操作反馈和错误提示
4. **可扩展性**: 预留接口，方便后续添加更多城市和功能
5. **代码质量**: 保持代码整洁，添加必要的注释和类型定义
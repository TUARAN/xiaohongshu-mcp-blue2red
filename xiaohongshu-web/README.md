# 蓝2红（技术咨询自动发布小红书系统）- 前端

基于Vue.js的技术咨询自动发布小红书系统前端界面。

## 🚀 功能特性

- **蓝点网资讯展示**：实时显示最新科技资讯
- **智能发布管理**：每个资讯都有独立的发布按钮
- **AI搜索功能**：智能搜索相关资讯
- **系统设置**：配置和管理系统参数
- **系统测试**：测试系统功能状态

## 🛠️ 技术栈

- **Vue 3** + **TypeScript**
- **Element Plus** UI组件库
- **Vite** 构建工具
- **Axios** HTTP客户端
- **Cheerio** HTML解析

## 📦 安装和运行

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
src/
├── views/              # 页面组件
│   ├── NewsView.vue   # 蓝点网资讯页面（默认）
│   ├── AISearchView.vue # AI搜索页面
│   ├── SettingsView.vue # 设置页面
│   └── TestView.vue   # 系统测试页面
├── components/        # 通用组件
│   └── Navigation.vue # 导航组件
├── api/              # API接口
│   ├── newsCrawler.ts # 资讯爬虫
│   ├── realNewsPublisher.ts # 真实资讯发布
│   ├── aiSearch.ts   # AI搜索
│   └── mcp.ts        # MCP服务
└── router/           # 路由配置
    └── index.ts      # 路由定义
```

## 🌐 访问地址

开发环境：http://localhost:5176

## 📝 使用说明

1. 系统默认显示蓝点网资讯页面
2. 浏览最新科技资讯
3. 点击任意资讯的"发布"按钮进行发布
4. 使用AI搜索功能查找相关资讯
5. 在设置页面配置系统参数

## 🔧 配置说明

### 代理配置
系统配置了代理来访问蓝点网资讯：
- `/api/news` → `https://www.landiannews.com`

### MCP服务
前端通过MCP服务与后端通信：
- MCP服务地址：`http://localhost:18060/mcp`
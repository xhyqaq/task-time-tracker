# Task Time Tracker

一个现代化的任务管理和时间追踪应用程序，基于 Electron + Vue 3 + TypeScript 构建。

## 功能特点

- 📝 任务管理：创建、编辑和删除任务
- ⏱️ 时间追踪：记录每个任务的工作时间
- 📊 数据统计：查看工作时间统计和分析
- 🎯 目标设置：为任务设置目标完成时间
- 💾 数据持久化：自动保存所有数据
- 🖥️ 跨平台支持：支持 Windows、macOS 和 Linux（目前快捷键只在mac支持）

## 技术栈

- Electron
- Vue 3
- TypeScript
- Element Plus
- Pinia (状态管理)
- Vite (构建工具)

## 开发环境要求

- Node.js (推荐 v16 或更高版本)
- npm 或 yarn

## 安装

```bash
# 克隆项目
git clone [your-repository-url]

# 进入项目目录
cd task-time-tracker

# 安装依赖
npm install
# 或
yarn install
```

## 开发

```bash
# 启动开发服务器
npm run dev
# 或
yarn dev
```

## 构建

```bash
# Windows
npm run build:win
# 或
yarn build:win

# macOS
npm run build:mac
# 或
yarn build:mac

# Linux
npm run build:linux
# 或
yarn build:linux
```

构建后的应用程序将在 `release` 目录中生成。

## 项目结构

```
task-time-tracker/
├── src/              # 源代码目录
├── electron/         # Electron 主进程代码
├── public/           # 静态资源
├── dist-electron/    # Electron 构建输出
└── release/         # 应用程序发布包
```

## 配置

项目配置文件：
- `electron.vite.config.ts`: Electron-Vite 配置
- `vite.config.ts`: Vite 配置
- `electron-builder.json5`: Electron Builder 配置
- `tsconfig.json`: TypeScript 配置

## 贡献

欢迎提交 Issue 和 Pull Request！

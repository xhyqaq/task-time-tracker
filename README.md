# Task Time Tracker

一个现代化的任务管理和时间追踪应用程序，基于 Electron + Vue 3 + TypeScript 构建。

该软件的核心就是不用鼠标完成任务管理！！！



## 快捷键

`Command + i` 创建任务
`Command + 1-9` 选中任务
`Command + d` 打开任务详情
`Command + Enter` 完成任务
`Command + Delete` 删除任务
选中任务后还可通过 ⬆️ ⬇️ 切换任务


## Mac 安装说明

由于应用未经过 Apple 签名认证，首次打开时可能会提示"无法打开，因为 Apple 无法检查其是否包含恶意软件"。这是正常现象，解决方法如下：

### 方法一：使用终端命令（推荐）

打开终端，输入以下命令：
```bash
xattr -cr /Applications/TaskTimeTracker.app
```
注意：如果你的应用安装在其他位置，请相应修改路径。

### 方法二：手动允许打开

1. 在 Finder 中找到应用程序
2. 按住 Control 键并点击应用图标（或右键点击）
3. 在弹出菜单中选择"打开"
4. 在弹出的警告对话框中点击"打开"

### 方法三：通过系统设置

1. 打开系统偏好设置
2. 点击"安全性与隐私"
3. 在"通用"选项卡中，点击"仍要打开"
4. 在弹出的警告对话框中点击"打开"

完成以上任一方法后，应用将被系统信任，后续可以正常打开使用。

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

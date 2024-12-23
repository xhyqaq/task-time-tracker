# Task Time Tracker

一个简单高效的任务时间追踪工具，帮助你更好地管理和记录日常任务。

## 功能特点

- 📝 任务管理：创建、编辑、删除和恢复任务
- ⏱️ 时间追踪：自动记录任务的创建和完成时间
- 📊 数据统计：按日、周、月、季度、年查看任务完成情况
- 🗑️ 回收站：支持任务的软删除和恢复
- 💾 数据持久化：自动保存所有任务数据
- ⌨️ 快捷键支持：提供丰富的键盘快捷操作
- 🌙 主题切换：支持明暗主题切换
- 💻 跨平台：支持 Windows、macOS 和 Linux

## 安装说明

### 从源码构建

1. 克隆仓库：
```bash
git clone https://gitee.com/XhyQAQ/task-time-tracker.git
cd task-time-tracker
```

2. 安装依赖：
```bash
npm install
```

3. 开发模式运行：
```bash
npm run dev
```

4. 构建应用：
```bash
npm run build
```

### 直接下载

访问 [Releases](https://gitee.com/XhyQAQ/task-time-tracker/releases) 页面下载对应平台的安装包。

#### macOS 用户注意事项

如果在打开应用时遇到"无法打开，因为它来自身份不明的开发者"或"应用已损坏"的提示，请按照以下步骤操作：

方法一：通过系统设置允许打开（推荐）
1. 在 Finder 中找到应用程序
2. 按住 Control 键并点击应用图标
3. 从快捷菜单中选择"打开"
4. 点击"打开"按钮

方法二：通过终端命令解除限制
1. 打开终端（Terminal）
2. 输入以下命令：
```bash
xattr -cr "/Applications/Task Time Tracker.app"
```
3. 输入管理员密码
4. 重新打开应用

## 使用指南

### 基本操作

- 添加任务：点击"添加任务"按钮或使用快捷键 `Cmd/Ctrl + I`
- 编辑任务：双击任务或选中后按 `Enter`
- 完成任务：点击任务前的复选框或使用快捷键 `Space`
- 删除任务：选中任务后按 `Delete` 或点击删除按钮
- 恢复任务：在回收站中选择要恢复的任务，点击恢复按钮

### 键盘快捷键

- `Cmd/Ctrl + I`: 快速添加任务
- `Enter`: 编辑选中的任务
- `Space`: 切换任务完成状态
- `Delete`: 删除选中的任务
- `↑/↓`: 在任务列表中上下移动
- `Esc`: 关闭当前对话框

### 数据管理

- 数据自动保存：所有操作都会自动保存
- 数据导出：支持导出任务数据（即将支持）
- 数据导入：支持导入历史数据（即将支持）
- 数据备份：清空数据时会自动创建备份

## 技术栈

- 前端框架：Vue 3 + TypeScript
- UI 组件：Element Plus
- 构建工具：Vite
- 桌面端框架：Electron
- 数据存储：electron-store

## 开发相关

### 推荐的 IDE 配置

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (禁用 Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### TypeScript 配置

如果独立的 TypeScript 插件性能不够理想，Volar 还提供了 [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) 以提升性能。启用步骤：

1. 禁用内置的 TypeScript 扩展
   1. 运行 `Extensions: Show Built-in Extensions` 命令
   2. 找到 `TypeScript and JavaScript Language Features`，右键选择 `Disable (Workspace)`
2. 通过命令面板运行 `Developer: Reload Window` 重新加载窗口

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

[MIT License](LICENSE)

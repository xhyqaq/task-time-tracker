"use strict";
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
console.log("Main process starting...");
process.env.DIST_ELECTRON = node_path.join(__dirname, "..");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if (!process.env.VITE_DEV_SERVER_URL) {
  process.env.VITE_DEV_SERVER_URL = "http://localhost:5173";
}
console.log("Environment paths:", {
  DIST_ELECTRON: process.env.DIST_ELECTRON,
  DIST: process.env.DIST,
  VITE_PUBLIC: process.env.VITE_PUBLIC,
  VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
  NODE_ENV: process.env.NODE_ENV,
  __dirname,
  cwd: process.cwd()
});
if (node_os.release().startsWith("6.1")) electron.app.disableHardwareAcceleration();
if (process.platform === "win32") electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
async function createWindow() {
  console.log("Creating main window...");
  win = new electron.BrowserWindow({
    title: "Task Time Tracker",
    width: 1200,
    height: 800,
    webPreferences: {
      preload: node_path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      devTools: true
    }
  });
  console.log("Loading URL...");
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log("Development mode detected");
    console.log("Dev server URL:", process.env.VITE_DEV_SERVER_URL);
    try {
      await win.loadURL(process.env.VITE_DEV_SERVER_URL);
      console.log("Successfully loaded dev server URL");
    } catch (error) {
      console.error("Failed to load dev server URL:", error);
      try {
        const indexPath = node_path.join(process.env.DIST || "", "index.html");
        console.log("Fallback: Loading local file:", indexPath);
        await win.loadFile(indexPath);
      } catch (fallbackError) {
        console.error("Failed to load fallback file:", fallbackError);
      }
    }
  } else {
    console.log("Production mode detected");
    try {
      const indexPath = node_path.join(process.env.DIST || "", "index.html");
      console.log("Index HTML path:", indexPath);
      await win.loadFile(indexPath);
      console.log("Successfully loaded production file");
    } catch (error) {
      console.error("Failed to load production file:", error);
    }
  }
  win.webContents.openDevTools();
  console.log("DevTools opened");
  win.webContents.on("did-finish-load", () => {
    console.log("Window finished loading");
    win?.webContents.executeJavaScript('console.log("Window JavaScript context is ready")');
  });
  win.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Failed to load:", errorCode, errorDescription);
  });
  win.webContents.on("dom-ready", () => {
    console.log("DOM is ready");
  });
  win.webContents.on("crashed", (event) => {
    console.error("Renderer process crashed:", event);
  });
  win.on("unresponsive", () => {
    console.error("Window became unresponsive");
  });
}
electron.app.whenReady().then(() => {
  console.log("App is ready");
  createWindow();
});
electron.app.on("window-all-closed", () => {
  console.log("All windows closed");
  win = null;
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("second-instance", () => {
  console.log("Second instance detected");
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  console.log("App activated");
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
electron.ipcMain.on("add-task", (event, task) => {
  console.log("Adding task:", task);
  event.reply("task-added", task);
});
electron.ipcMain.on("update-task", (event, task) => {
  console.log("Updating task:", task);
  if (!task.id) {
    console.error("Task ID is required for update");
    return;
  }
  event.reply("task-updated", task);
});
electron.ipcMain.on("delete-task", (event, taskId) => {
  console.log("Deleting task:", taskId);
  if (!taskId) {
    console.error("Task ID is required for deletion");
    return;
  }
  event.reply("task-deleted", { id: taskId, deleted: true });
});
electron.ipcMain.on("restore-task", (event, taskId) => {
  console.log("Restoring task:", taskId);
  if (!taskId) {
    console.error("Task ID is required for restoration");
    return;
  }
  event.reply("task-restored", { id: taskId, deleted: false });
});
electron.ipcMain.on("get-tasks", (event) => {
  console.log("Getting tasks");
  event.reply("tasks-loaded", {
    all: [],
    deleted: [],
    today: [],
    week: [],
    month: [],
    quarter: [],
    year: []
  });
});
electron.ipcMain.on("get-range-tasks", (event, range) => {
  console.log("Getting range tasks:", range);
  event.reply("range-tasks-loaded", {
    tasks: [],
    stats: {
      total: 0,
      completed: 0,
      pending: 0
    }
  });
});

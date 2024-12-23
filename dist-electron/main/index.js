"use strict";
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
const fs = require("fs");
console.log("Main process starting...");
process.env.DIST_ELECTRON = node_path.join(__dirname, "..");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
console.log("Environment paths:", {
  DIST_ELECTRON: process.env.DIST_ELECTRON,
  DIST: process.env.DIST,
  PUBLIC: process.env.PUBLIC,
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
let tasks = [];
let config = {
  dataPath: node_path.join(electron.app.getPath("userData"), "data"),
  tasksFile: "tasks.json",
  version: electron.app.getVersion(),
  lastBackup: null
};
const CONFIG_FILE = node_path.join(electron.app.getPath("userData"), "config.json");
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf8");
      config = { ...config, ...JSON.parse(data) };
    } else {
      saveConfig();
    }
  } catch (error) {
    console.error("Error loading config:", error);
  }
}
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving config:", error);
  }
}
function ensureDataDirectory() {
  try {
    if (!fs.existsSync(config.dataPath)) {
      fs.mkdirSync(config.dataPath, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}
function loadTasks() {
  try {
    ensureDataDirectory();
    const filePath = node_path.join(config.dataPath, config.tasksFile);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const loadedTasks = JSON.parse(data);
      console.log("Tasks loaded:", loadedTasks);
      return loadedTasks;
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
  return [];
}
function saveTasks(tasksToSave) {
  try {
    ensureDataDirectory();
    const filePath = node_path.join(config.dataPath, config.tasksFile);
    fs.writeFileSync(filePath, JSON.stringify(tasksToSave, null, 2), "utf-8");
    console.log("Tasks saved:", tasksToSave);
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}
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
      sandbox: false,
      webSecurity: false,
      devTools: true
    }
  });
  console.log("Loading URL...");
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log("Development mode detected");
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    console.log("Production mode detected");
    const indexHtml = node_path.join(process.env.DIST, "index.html");
    console.log("Loading index from:", indexHtml);
    try {
      if (!fs.existsSync(indexHtml)) {
        console.error("index.html does not exist at:", indexHtml);
        console.log("Current directory structure:");
        console.log("DIST directory exists:", fs.existsSync(process.env.DIST));
        console.log("DIST directory contents:", fs.existsSync(process.env.DIST) ? fs.readFileSync(node_path.join(process.env.DIST, "*")) : "N/A");
        throw new Error("index.html not found");
      }
      const indexContent = fs.readFileSync(indexHtml, "utf8");
      console.log("index.html content length:", indexContent.length);
      await win.loadFile(indexHtml);
      console.log("Successfully loaded index.html");
    } catch (error) {
      console.error("Failed to load index.html:", error);
      try {
        const backupPath = electron.app.getAppPath();
        const backupIndexHtml = node_path.join(backupPath, "dist", "index.html");
        console.log("Trying backup path:", backupIndexHtml);
        await win.loadFile(backupIndexHtml);
      } catch (backupError) {
        console.error("Backup loading also failed:", backupError);
      }
    }
  }
  win.webContents.openDevTools();
  win.webContents.on("did-start-loading", () => {
    console.log("Window started loading");
  });
  win.webContents.on("did-finish-load", () => {
    console.log("Window finished loading");
    win?.webContents.send("load-tasks", tasks);
  });
  win.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL) => {
    console.error("Failed to load:", {
      errorCode,
      errorDescription,
      validatedURL,
      env: {
        DIST: process.env.DIST,
        VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
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
  win.webContents.on("did-fail-provisional-load", (...args) => {
    console.error("Provisional load failed:", ...args);
  });
  win.webContents.on("console-message", (event, level, message, line, sourceId) => {
    console.log("Console message:", { level, message, line, sourceId });
  });
}
electron.app.whenReady().then(() => {
  console.log("App is ready, initializing...");
  loadConfig();
  ensureDataDirectory();
  tasks = loadTasks();
  console.log("Initial tasks loaded:", tasks);
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
electron.ipcMain.handle("get-tasks", () => {
  console.log("Getting tasks:", tasks);
  return tasks.filter((task) => !task.deleted);
});
electron.ipcMain.handle("get-deleted-tasks", () => {
  return tasks.filter((task) => task.deleted);
});
function getAllStats() {
  return {
    today: getTodayTasks(),
    week: getWeekTasks(),
    month: getMonthTasks(),
    quarter: getQuarterTasks(),
    year: getYearTasks(),
    deleted: tasks.filter((t) => t.deleted)
  };
}
function isToday(date, today) {
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}
function isThisWeek(date, today) {
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  const day = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  console.log("Week range check:", {
    date: date.toLocaleString(),
    startOfWeek: startOfWeek.toLocaleString(),
    endOfWeek: endOfWeek.toLocaleString(),
    isInRange: date >= startOfWeek && date <= endOfWeek
  });
  return date >= startOfWeek && date <= endOfWeek;
}
function isThisMonth(date, today) {
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}
function isThisQuarter(date, today) {
  const quarter = Math.floor(today.getMonth() / 3);
  const dateQuarter = Math.floor(date.getMonth() / 3);
  return quarter === dateQuarter && date.getFullYear() === today.getFullYear();
}
function isThisYear(date, today) {
  return date.getFullYear() === today.getFullYear();
}
function getTodayTasks() {
  const today = /* @__PURE__ */ new Date();
  return tasks.filter((t) => !t.deleted && isToday(new Date(t.createdAt), today));
}
function getWeekTasks() {
  const today = /* @__PURE__ */ new Date();
  return tasks.filter((t) => {
    if (t.deleted) return false;
    const taskDate = new Date(t.createdAt);
    if (isNaN(taskDate.getTime())) {
      console.error("Invalid date for task:", t);
      return false;
    }
    console.log("Checking task for week:", {
      taskId: t.id,
      taskDate: taskDate.toLocaleString(),
      isInWeek: isThisWeek(taskDate, today)
    });
    return isThisWeek(taskDate, today);
  });
}
function getMonthTasks() {
  const today = /* @__PURE__ */ new Date();
  return tasks.filter((t) => !t.deleted && isThisMonth(new Date(t.createdAt), today));
}
function getQuarterTasks() {
  const today = /* @__PURE__ */ new Date();
  return tasks.filter((t) => !t.deleted && isThisQuarter(new Date(t.createdAt), today));
}
function getYearTasks() {
  const today = /* @__PURE__ */ new Date();
  return tasks.filter((t) => !t.deleted && isThisYear(new Date(t.createdAt), today));
}
electron.ipcMain.handle("get-range-tasks", (event, range) => {
  console.log("Getting range tasks for:", range);
  const allTasks = tasks.filter((t) => !t.deleted);
  let rangeTasks = [];
  switch (range) {
    case "today":
      rangeTasks = getTodayTasks();
      break;
    case "week":
      rangeTasks = getWeekTasks();
      break;
    case "month":
      rangeTasks = getMonthTasks();
      break;
    case "quarter":
      rangeTasks = getQuarterTasks();
      break;
    case "year":
      rangeTasks = getYearTasks();
      break;
    default:
      rangeTasks = allTasks;
  }
  console.log(`Found ${rangeTasks.length} tasks for range: ${range}`);
  return {
    tasks: rangeTasks,
    stats: {
      total: rangeTasks.length,
      completed: rangeTasks.filter((t) => t.completed).length,
      pending: rangeTasks.filter((t) => !t.completed).length
    }
  };
});
electron.ipcMain.handle("add-task", (event, task) => {
  console.log("Adding new task:", task);
  try {
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      deleted: false
    };
    tasks.push(newTask);
    saveTasks(tasks);
    console.log("Task added successfully:", newTask);
    const stats = getAllStats();
    win?.webContents.send("task-added", {
      task: newTask,
      stats
    });
    return newTask;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
});
electron.ipcMain.handle("update-task", (event, updatedTask) => {
  const index = tasks.findIndex((t) => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      ...updatedTask,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveTasks(tasks);
    const stats = getAllStats();
    win?.webContents.send("task-updated", {
      task: tasks[index],
      stats
    });
    return tasks[index];
  }
  return null;
});
electron.ipcMain.handle("delete-task", (event, taskId) => {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      deleted: true,
      deletedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveTasks(tasks);
    const stats = getAllStats();
    win?.webContents.send("task-deleted", {
      task: tasks[index],
      stats
    });
    return tasks[index];
  }
  return null;
});
electron.ipcMain.handle("restore-task", (event, taskId) => {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      deleted: false,
      deletedAt: null,
      restoredAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveTasks(tasks);
    const stats = getAllStats();
    win?.webContents.send("task-restored", {
      task: tasks[index],
      stats
    });
    return tasks[index];
  }
  return null;
});
electron.ipcMain.handle("permanently-delete-task", (event, taskId) => {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks.splice(index, 1);
    saveTasks(tasks);
    return true;
  }
  return false;
});
electron.ipcMain.handle("get-config", () => {
  return config;
});
electron.ipcMain.handle("update-config", (event, newConfig) => {
  config = { ...config, ...newConfig };
  saveConfig();
  return config;
});
electron.ipcMain.handle("select-data-path", async () => {
  const result = await electron.dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    config.dataPath = result.filePaths[0];
    saveConfig();
    return config;
  }
  return null;
});
electron.ipcMain.handle("clear-all-data", async () => {
  try {
    console.log("Clearing all data...");
    console.log("Current tasks:", tasks);
    const backupPath = node_path.join(config.dataPath, `backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(tasks, null, 2), "utf-8");
    console.log("Backup created at:", backupPath);
    tasks = [];
    saveTasks(tasks);
    console.log("Tasks cleared and saved");
    config.lastBackup = (/* @__PURE__ */ new Date()).toISOString();
    saveConfig();
    console.log("Config updated");
    win?.webContents.send("tasks-stats-updated", {
      today: [],
      week: [],
      month: [],
      quarter: [],
      year: [],
      deleted: []
    });
    console.log("Renderer process notified");
    return {
      success: true,
      backupPath
    };
  } catch (error) {
    console.error("Failed to clear data:", error);
    return {
      success: false,
      error: error.message
    };
  }
});

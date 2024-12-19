"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const fs = require("fs");
if (process.platform === "win32" && process.versions.major === "6.1") {
  app.disableHardwareAcceleration();
}
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
let win = null;
const TASKS_FILE = join(app.getPath("userData"), "tasks.json");
function ensureTasksFile() {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, "[]", "utf8");
  }
}
function loadTasks() {
  try {
    ensureTasksFile();
    const data = fs.readFileSync(TASKS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
}
function saveTasks(tasks) {
  try {
    const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    fs.writeFileSync(TASKS_FILE, JSON.stringify(sortedTasks, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}
function getTasksInRange(tasks, startDate, endDate) {
  return tasks.filter((task) => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= startDate && taskDate <= endDate && !task.deleted;
  });
}
function getTodayTasks(tasks) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTasksInRange(tasks, today, tomorrow);
}
function getWeekTasks(tasks) {
  const today = /* @__PURE__ */ new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return getTasksInRange(tasks, startOfWeek, endOfWeek);
}
function getMonthTasks(tasks) {
  const today = /* @__PURE__ */ new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  return getTasksInRange(tasks, startOfMonth, endOfMonth);
}
function getDeletedTasks(tasks) {
  return tasks.filter((task) => task.deleted);
}
function getActiveTasks(tasks) {
  return tasks.filter((task) => !task.deleted);
}
function getQuarterTasks(tasks) {
  const today = /* @__PURE__ */ new Date();
  const quarter = Math.floor(today.getMonth() / 3);
  const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
  const endOfQuarter = new Date(today.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
  return getTasksInRange(tasks, startOfQuarter, endOfQuarter);
}
function getYearTasks(tasks) {
  const today = /* @__PURE__ */ new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
  return getTasksInRange(tasks, startOfYear, endOfYear);
}
async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "../preload/index.js")
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, "../../dist/index.html"));
  }
}
ipcMain.on("get-tasks", (event) => {
  const tasks = loadTasks();
  const activeTasks = getActiveTasks(tasks);
  const deletedTasks = getDeletedTasks(tasks);
  win?.webContents.send("tasks-loaded", {
    all: activeTasks,
    deleted: deletedTasks,
    today: getTodayTasks(tasks),
    week: getWeekTasks(tasks),
    month: getMonthTasks(tasks),
    quarter: getQuarterTasks(tasks),
    year: getYearTasks(tasks)
  });
});
ipcMain.on("get-range-tasks", (event, range) => {
  const tasks = loadTasks();
  let rangeTasks = [];
  switch (range) {
    case "today":
      rangeTasks = getTodayTasks(tasks);
      break;
    case "week":
      rangeTasks = getWeekTasks(tasks);
      break;
    case "month":
      rangeTasks = getMonthTasks(tasks);
      break;
    case "quarter":
      rangeTasks = getQuarterTasks(tasks);
      break;
    case "year":
      rangeTasks = getYearTasks(tasks);
      break;
  }
  win?.webContents.send("range-tasks-loaded", {
    range,
    tasks: rangeTasks,
    stats: {
      total: rangeTasks.length,
      completed: rangeTasks.filter((t) => t.completed).length,
      pending: rangeTasks.filter((t) => !t.completed).length
    }
  });
});
ipcMain.on("add-task", (event, taskData) => {
  const tasks = loadTasks();
  const newTask = {
    id: Date.now(),
    name: taskData.name,
    completed: false,
    deleted: false,
    createdAt: taskData.createdAt,
    deletedAt: null,
    description: ""
  };
  tasks.push(newTask);
  saveTasks(tasks);
  win?.webContents.send("task-added", newTask);
  getActiveTasks(tasks);
  win?.webContents.send("tasks-stats-updated", {
    today: getTodayTasks(tasks),
    week: getWeekTasks(tasks),
    month: getMonthTasks(tasks),
    quarter: getQuarterTasks(tasks),
    year: getYearTasks(tasks),
    deleted: getDeletedTasks(tasks)
  });
});
ipcMain.on("update-task", (event, taskData) => {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskData.id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
    saveTasks(tasks);
    win?.webContents.send("task-updated", tasks[taskIndex]);
    getActiveTasks(tasks);
    win?.webContents.send("tasks-stats-updated", {
      today: getTodayTasks(tasks),
      week: getWeekTasks(tasks),
      month: getMonthTasks(tasks),
      quarter: getQuarterTasks(tasks),
      year: getYearTasks(tasks),
      deleted: getDeletedTasks(tasks)
    });
  }
});
ipcMain.on("delete-task", (event, taskId) => {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].deleted = true;
    tasks[taskIndex].deletedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveTasks(tasks);
    win?.webContents.send("task-deleted", tasks[taskIndex]);
    getActiveTasks(tasks);
    win?.webContents.send("tasks-stats-updated", {
      today: getTodayTasks(tasks),
      week: getWeekTasks(tasks),
      month: getMonthTasks(tasks),
      quarter: getQuarterTasks(tasks),
      year: getYearTasks(tasks),
      deleted: getDeletedTasks(tasks)
    });
  }
});
ipcMain.on("restore-task", (event, taskId) => {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].deleted = false;
    tasks[taskIndex].deletedAt = null;
    saveTasks(tasks);
    win?.webContents.send("task-restored", tasks[taskIndex]);
    getActiveTasks(tasks);
    win?.webContents.send("tasks-stats-updated", {
      today: getTodayTasks(tasks),
      week: getWeekTasks(tasks),
      month: getMonthTasks(tasks),
      quarter: getQuarterTasks(tasks),
      year: getYearTasks(tasks),
      deleted: getDeletedTasks(tasks)
    });
  }
});
ipcMain.on("hard-delete-task", (event, taskId) => {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    saveTasks(tasks);
    win?.webContents.send("tasks-stats-updated", {
      today: getTodayTasks(tasks),
      week: getWeekTasks(tasks),
      month: getMonthTasks(tasks),
      quarter: getQuarterTasks(tasks),
      year: getYearTasks(tasks),
      deleted: getDeletedTasks(tasks)
    });
  }
});
app.whenReady().then(() => {
  createWindow();
  ensureTasksFile();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

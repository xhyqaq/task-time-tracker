import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

console.log('Main process starting...')

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

console.log('Environment paths:', {
  DIST_ELECTRON: process.env.DIST_ELECTRON,
  DIST: process.env.DIST,
  PUBLIC: process.env.PUBLIC,
  VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
  NODE_ENV: process.env.NODE_ENV,
  __dirname,
  cwd: process.cwd()
})

if (release().startsWith('6.1')) app.disableHardwareAcceleration()

if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// 初始化全局变量
let win: BrowserWindow | null = null
let tasks: any[] = []

// 配置和数据管理
let config = {
  dataPath: join(app.getPath('userData'), 'data'),
  tasksFile: 'tasks.json',
  version: app.getVersion(),
  lastBackup: null
}

const CONFIG_FILE = join(app.getPath('userData'), 'config.json')

// 加载配置
function loadConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      const data = readFileSync(CONFIG_FILE, 'utf8')
      config = { ...config, ...JSON.parse(data) }
    } else {
      saveConfig()
    }
  } catch (error) {
    console.error('Error loading config:', error)
  }
}

// 保存配置
function saveConfig() {
  try {
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving config:', error)
  }
}

// 确保数据目录存在
function ensureDataDirectory() {
  try {
    if (!existsSync(config.dataPath)) {
      mkdirSync(config.dataPath, { recursive: true })
    }
  } catch (error) {
    console.error('Error creating data directory:', error)
  }
}

// 加载任务数据
function loadTasks(): any[] {
  try {
    ensureDataDirectory()
    const filePath = join(config.dataPath, config.tasksFile)
    if (existsSync(filePath)) {
      const data = readFileSync(filePath, 'utf-8')
      const loadedTasks = JSON.parse(data)
      console.log('Tasks loaded:', loadedTasks)
      return loadedTasks
    }
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
  return []
}

// 保存任务数据
function saveTasks(tasksToSave: any[]) {
  try {
    ensureDataDirectory()
    const filePath = join(config.dataPath, config.tasksFile)
    writeFileSync(filePath, JSON.stringify(tasksToSave, null, 2), 'utf-8')
    console.log('Tasks saved:', tasksToSave)
  } catch (error) {
    console.error('Error saving tasks:', error)
  }
}

async function createWindow() {
  console.log('Creating main window...')
  
  win = new BrowserWindow({
    title: 'Task Time Tracker',
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      devTools: true
    },
  })

  console.log('Loading URL...')
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('Development mode detected')
    await win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    console.log('Production mode detected')
    const indexHtml = join(process.env.DIST, 'index.html')
    console.log('Loading index from:', indexHtml)
    
    try {
      if (!existsSync(indexHtml)) {
        console.error('index.html does not exist at:', indexHtml)
        console.log('Current directory structure:')
        console.log('DIST directory exists:', existsSync(process.env.DIST))
        console.log('DIST directory contents:', existsSync(process.env.DIST) ? readFileSync(join(process.env.DIST, '*')) : 'N/A')
        throw new Error('index.html not found')
      }

      const indexContent = readFileSync(indexHtml, 'utf8')
      console.log('index.html content length:', indexContent.length)
      
      await win.loadFile(indexHtml)
      console.log('Successfully loaded index.html')
    } catch (error) {
      console.error('Failed to load index.html:', error)
      // 尝试使用备用加载方法
      try {
        const backupPath = app.getAppPath()
        const backupIndexHtml = join(backupPath, 'dist', 'index.html')
        console.log('Trying backup path:', backupIndexHtml)
        await win.loadFile(backupIndexHtml)
      } catch (backupError) {
        console.error('Backup loading also failed:', backupError)
      }
    }
  }

  win.webContents.openDevTools()

  // 添加更多的事件监听器来帮助调试
  win.webContents.on('did-start-loading', () => {
    console.log('Window started loading')
  })

  win.webContents.on('did-finish-load', () => {
    console.log('Window finished loading')
    win?.webContents.send('load-tasks', tasks)
  })

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL,
      env: {
        DIST: process.env.DIST,
        VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    })
  })

  win.webContents.on('dom-ready', () => {
    console.log('DOM is ready')
  })

  win.webContents.on('crashed', (event) => {
    console.error('Renderer process crashed:', event)
  })

  win.on('unresponsive', () => {
    console.error('Window became unresponsive')
  })

  // 监听页面加载错误
  win.webContents.on('did-fail-provisional-load', (...args) => {
    console.error('Provisional load failed:', ...args)
  })

  // 监听控制台消息
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Console message:', { level, message, line, sourceId })
  })
}

// 初始化应用
app.whenReady().then(() => {
  console.log('App is ready, initializing...')
  loadConfig()
  ensureDataDirectory()
  tasks = loadTasks()
  console.log('Initial tasks loaded:', tasks)
  createWindow()
})

app.on('window-all-closed', () => {
  console.log('All windows closed')
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  console.log('Second instance detected')
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  console.log('App activated')
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// IPC 事件处理
ipcMain.handle('get-tasks', () => {
  console.log('Getting tasks:', tasks)
  return tasks.filter(task => !task.deleted)
})

ipcMain.handle('get-deleted-tasks', () => {
  return tasks.filter(task => task.deleted)
})

// 添加获取所有统计数据的函数
function getAllStats() {
  return {
    today: getTodayTasks(),
    week: getWeekTasks(),
    month: getMonthTasks(),
    quarter: getQuarterTasks(),
    year: getYearTasks(),
    deleted: tasks.filter(t => t.deleted)
  }
}

// 修改日期相关的辅助函数
function isToday(date: Date, today: Date): boolean {
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

function isThisWeek(date: Date, today: Date): boolean {
  // 获取本周一的日期
  const startOfWeek = new Date(today)
  startOfWeek.setHours(0, 0, 0, 0)
  const day = startOfWeek.getDay() || 7 // 将周日的0转换为7
  startOfWeek.setDate(startOfWeek.getDate() - day + 1) // 设置为本周一
  
  // 获取本周日的日期
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  console.log('Week range check:', {
    date: date.toLocaleString(),
    startOfWeek: startOfWeek.toLocaleString(),
    endOfWeek: endOfWeek.toLocaleString(),
    isInRange: date >= startOfWeek && date <= endOfWeek
  })
  
  return date >= startOfWeek && date <= endOfWeek
}

function isThisMonth(date: Date, today: Date): boolean {
  return date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

function isThisQuarter(date: Date, today: Date): boolean {
  const quarter = Math.floor(today.getMonth() / 3)
  const dateQuarter = Math.floor(date.getMonth() / 3)
  return quarter === dateQuarter &&
    date.getFullYear() === today.getFullYear()
}

function isThisYear(date: Date, today: Date): boolean {
  return date.getFullYear() === today.getFullYear()
}

// 获取不同时间范围的任务
function getTodayTasks() {
  const today = new Date()
  return tasks.filter(t => !t.deleted && isToday(new Date(t.createdAt), today))
}

function getWeekTasks() {
  const today = new Date()
  return tasks.filter(t => {
    if (t.deleted) return false
    const taskDate = new Date(t.createdAt)
    // 确保 taskDate 是有效的日期对象
    if (isNaN(taskDate.getTime())) {
      console.error('Invalid date for task:', t)
      return false
    }
    console.log('Checking task for week:', {
      taskId: t.id,
      taskDate: taskDate.toLocaleString(),
      isInWeek: isThisWeek(taskDate, today)
    })
    return isThisWeek(taskDate, today)
  })
}

function getMonthTasks() {
  const today = new Date()
  return tasks.filter(t => !t.deleted && isThisMonth(new Date(t.createdAt), today))
}

function getQuarterTasks() {
  const today = new Date()
  return tasks.filter(t => !t.deleted && isThisQuarter(new Date(t.createdAt), today))
}

function getYearTasks() {
  const today = new Date()
  return tasks.filter(t => !t.deleted && isThisYear(new Date(t.createdAt), today))
}

// 修改时间范围任务查询处理器
ipcMain.handle('get-range-tasks', (event, range: string) => {
  console.log('Getting range tasks for:', range)
  const today = new Date()
  const allTasks = tasks.filter(t => !t.deleted)
  let rangeTasks: any[] = []
  
  switch (range) {
    case 'today':
      rangeTasks = getTodayTasks()
      break
    case 'week':
      rangeTasks = getWeekTasks()
      break
    case 'month':
      rangeTasks = getMonthTasks()
      break
    case 'quarter':
      rangeTasks = getQuarterTasks()
      break
    case 'year':
      rangeTasks = getYearTasks()
      break
    default:
      rangeTasks = allTasks
  }
  
  console.log(`Found ${rangeTasks.length} tasks for range: ${range}`)
  
  return {
    tasks: rangeTasks,
    stats: {
      total: rangeTasks.length,
      completed: rangeTasks.filter(t => t.completed).length,
      pending: rangeTasks.filter(t => !t.completed).length
    }
  }
})

// 修改添加任务的处理器
ipcMain.handle('add-task', (event, task) => {
  console.log('Adding new task:', task)
  try {
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      deleted: false
    }
    tasks.push(newTask)
    saveTasks(tasks)
    console.log('Task added successfully:', newTask)
    
    // 获取最新统计数据
    const stats = getAllStats()
    
    // 通知渲染进程更新任务列表和统计数据
    win?.webContents.send('task-added', {
      task: newTask,
      stats: stats
    })
    
    return newTask
  } catch (error) {
    console.error('Error adding task:', error)
    throw error
  }
})

// 修改更新任务的处理器
ipcMain.handle('update-task', (event, updatedTask) => {
  const index = tasks.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      ...updatedTask,
      updatedAt: new Date().toISOString()
    }
    saveTasks(tasks)
    
    // 获取最新的统计数据
    const stats = getAllStats()
    
    // 通知渲染进程更新任务列表和统计数据
    win?.webContents.send('task-updated', {
      task: tasks[index],
      stats: stats
    })
    
    return tasks[index]
  }
  return null
})

// 修改删除任务的处理器
ipcMain.handle('delete-task', (event, taskId) => {
  const index = tasks.findIndex(t => t.id === taskId)
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      deleted: true,
      deletedAt: new Date().toISOString()
    }
    saveTasks(tasks)
    
    // 获取最新的统计数据
    const stats = getAllStats()
    
    // 通知渲染进程更新任务列表和统计数据
    win?.webContents.send('task-deleted', {
      task: tasks[index],
      stats: stats
    })
    
    return tasks[index]
  }
  return null
})

// 修改恢复任务的处理器
ipcMain.handle('restore-task', (event, taskId) => {
  const index = tasks.findIndex(t => t.id === taskId)
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      deleted: false,
      deletedAt: null,
      restoredAt: new Date().toISOString()
    }
    saveTasks(tasks)
    
    // 获取最新的统计数据
    const stats = getAllStats()
    
    // 通知渲染进程更新任务列表和统计数据
    win?.webContents.send('task-restored', {
      task: tasks[index],
      stats: stats
    })
    
    return tasks[index]
  }
  return null
})

ipcMain.handle('permanently-delete-task', (event, taskId) => {
  const index = tasks.findIndex(t => t.id === taskId)
  if (index !== -1) {
    tasks.splice(index, 1)
    saveTasks(tasks)
    return true
  }
  return false
})

ipcMain.handle('get-config', () => {
  return config
})

ipcMain.handle('update-config', (event, newConfig) => {
  config = { ...config, ...newConfig }
  saveConfig()
  return config
})

ipcMain.handle('select-data-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    config.dataPath = result.filePaths[0]
    saveConfig()
    return config
  }
  return null
})

ipcMain.handle('clear-all-data', async () => {
  try {
    console.log('Clearing all data...')
    console.log('Current tasks:', tasks)
    
    // 在清空前先创建备份
    const backupPath = join(config.dataPath, `backup_${Date.now()}.json`)
    writeFileSync(backupPath, JSON.stringify(tasks, null, 2), 'utf-8')
    console.log('Backup created at:', backupPath)
    
    // 清空任务数组
    tasks = []
    
    // 保存空数据
    saveTasks(tasks)
    console.log('Tasks cleared and saved')
    
    // 更新配置中的最后备份时间
    config.lastBackup = new Date().toISOString()
    saveConfig()
    console.log('Config updated')
    
    // 通知渲染进程数据已更新
    win?.webContents.send('tasks-stats-updated', {
      today: [],
      week: [],
      month: [],
      quarter: [],
      year: [],
      deleted: []
    })
    console.log('Renderer process notified')
    
    return {
      success: true,
      backupPath
    }
  } catch (error) {
    console.error('Failed to clear data:', error)
    return {
      success: false,
      error: error.message
    }
  }
}) 
import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'

console.log('Main process starting...')

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// 添加开发服务器 URL 检查
if (!process.env.VITE_DEV_SERVER_URL) {
  process.env.VITE_DEV_SERVER_URL = 'http://localhost:5173'
}

console.log('Environment paths:', {
  DIST_ELECTRON: process.env.DIST_ELECTRON,
  DIST: process.env.DIST,
  VITE_PUBLIC: process.env.VITE_PUBLIC,
  VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
  NODE_ENV: process.env.NODE_ENV,
  __dirname: __dirname,
  cwd: process.cwd()
})

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

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
      webSecurity: false,
      devTools: true
    },
  })

  console.log('Loading URL...')
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('Development mode detected')
    console.log('Dev server URL:', process.env.VITE_DEV_SERVER_URL)
    try {
      await win.loadURL(process.env.VITE_DEV_SERVER_URL)
      console.log('Successfully loaded dev server URL')
    } catch (error) {
      console.error('Failed to load dev server URL:', error)
      // 如果开发服务器加载失败，尝试加载本地文件
      try {
        const indexPath = join(process.env.DIST || '', 'index.html')
        console.log('Fallback: Loading local file:', indexPath)
        await win.loadFile(indexPath)
      } catch (fallbackError) {
        console.error('Failed to load fallback file:', fallbackError)
      }
    }
  } else {
    console.log('Production mode detected')
    try {
      const indexPath = join(process.env.DIST || '', 'index.html')
      console.log('Index HTML path:', indexPath)
      await win.loadFile(indexPath)
      console.log('Successfully loaded production file')
    } catch (error) {
      console.error('Failed to load production file:', error)
    }
  }

  // 开发者工具
  win.webContents.openDevTools()
  console.log('DevTools opened')

  win.webContents.on('did-finish-load', () => {
    console.log('Window finished loading')
    win?.webContents.executeJavaScript('console.log("Window JavaScript context is ready")')
  })

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
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
}

app.whenReady().then(() => {
  console.log('App is ready')
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
    // Focus on the main window if the user tried to open another
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

// IPC handlers
ipcMain.on('add-task', (event, task) => {
  console.log('Adding task:', task)
  event.reply('task-added', task)
})

ipcMain.on('update-task', (event, task) => {
  console.log('Updating task:', task)
  if (!task.id) {
    console.error('Task ID is required for update')
    return
  }
  event.reply('task-updated', task)
})

ipcMain.on('delete-task', (event, taskId) => {
  console.log('Deleting task:', taskId)
  if (!taskId) {
    console.error('Task ID is required for deletion')
    return
  }
  event.reply('task-deleted', { id: taskId, deleted: true })
})

ipcMain.on('restore-task', (event, taskId) => {
  console.log('Restoring task:', taskId)
  if (!taskId) {
    console.error('Task ID is required for restoration')
    return
  }
  event.reply('task-restored', { id: taskId, deleted: false })
})

ipcMain.on('get-tasks', (event) => {
  console.log('Getting tasks')
  event.reply('tasks-loaded', {
    all: [],
    deleted: [],
    today: [],
    week: [],
    month: [],
    quarter: [],
    year: []
  })
})

ipcMain.on('get-range-tasks', (event, range) => {
  console.log('Getting range tasks:', range)
  event.reply('range-tasks-loaded', {
    tasks: [],
    stats: {
      total: 0,
      completed: 0,
      pending: 0
    }
  })
}) 
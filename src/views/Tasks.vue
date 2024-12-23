<template>
  <div class="tasks-view" @keydown="handleKeyboardShortcuts" tabindex="0" ref="tasksViewRef">
    <!-- 统计卡片 -->
    <statistics-cards
      :today-count="todayTasks.length"
      :week-count="weekTasks.length"
      :month-count="monthTasks.length"
      :quarter-count="quarterTasks.length"
      :year-count="yearTasks.length"
      :pending-count="pendingTasks.length"
      :completed-count="completedTasks.length"
      :deleted-count="deletedTasks.length"
      @show-range="showRangeTasks"
      @show-recycle-bin="showRecycleBin"
      @show-config="showConfig"
    />

    <!-- 任务列表 -->
    <task-list
      :pending-tasks="pendingTasks"
      :completed-tasks="completedTasks"
      :selected-task-index="selectedTaskIndex"
      :viewing-completed="viewingCompleted"
      @select-task="handleSelectTask"
      @open-detail="openTaskDetail"
      @add-task="showQuickAdd = true"
    />

    <!-- 快速添加任务对话框 -->
    <el-dialog
      v-model="showQuickAdd"
      title="快速添加任务"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      @closed="handleDialogClose"
      @open="handleDialogOpen"
      :modal-append-to-body="false"
      append-to-body
    >
      <el-input
        v-model="newTaskName"
        placeholder="输入任务名称"
        @keyup.enter="handleAddTask"
        @keyup.escape="showQuickAdd = false"
        ref="taskInput"
        autofocus
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showQuickAdd = false">取消</el-button>
          <el-button type="primary" @click="handleAddTask">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <task-detail
      v-model="taskDetailVisible"
      :task="currentTask"
      @save="handleSaveTask"
        v-if="currentTask" 
    />

    <!-- 回收站对话框 -->
    <recycle-bin
      v-model="showRecycleBinDialog"
      :tasks="deletedTasks"
      @restore="handleRestoreTask"
      @delete="handleHardDeleteTask"
      @open-detail="openTaskDetail"
    />

    <!-- 时间分布对话框 -->
    <time-distribution
      v-model="showTaskDashboard"
      :type="currentRange"
      :tasks="rangeTasks"
      :stats="rangeStats"
      @open-detail="openTaskDetail"
    />

    <!-- 配置对话框 -->
    <el-dialog
      v-model="showConfigDialog"
      title="系统配置"
      width="50%"
      destroy-on-close
    >
      <div class="config-container">
        <el-form label-width="120px">
          <el-form-item label="数据存储路径">
            <div class="path-selector">
              <el-input v-model="configInfo.dataPath" readonly />
              <el-button type="primary" @click="handleSelectDataPath">
                选择路径
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="版本信息">
            <el-tag>{{ configInfo.version || '1.0.0' }}</el-tag>
          </el-form-item>
          <el-form-item label="最后备份时间">
            <span>{{ configInfo.lastBackup ? formatDate(configInfo.lastBackup) : '从未备份' }}</span>
          </el-form-item>
          <el-divider />
          <el-form-item label="数据管理">
            <div class="data-management">
              <el-button type="primary" @click="handleExportData">
                导出数据
              </el-button>
              <el-button type="warning" @click="handleImportData">
                导入数据
              </el-button>
              <el-popconfirm
                title="确定要清空所有数据吗？此操作不可恢复"
                @confirm="handleClearData"
              >
                <template #reference>
                  <el-button type="danger">清空数据</el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!-- macOS 帮助对话框 -->
    <el-dialog
      v-model="showHelpDialog"
      title="macOS 用户须知"
      width="500px"
      :show-close="true"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
    >
      <div class="help-content">
        <p>如果您在打开应用时遇到"无法打开，因为它来自身份不明的开发者"或"应用已损坏"的提示，请按照以下步骤操作：</p>
        
        <h4>方法一：通过系统设置允许打开（推荐）</h4>
        <ol>
          <li>在 Finder 中找到应用程序</li>
          <li>按住 Control 键并点击应用图标</li>
          <li>从快捷菜单中选择"打开"</li>
          <li>点击"打开"按钮</li>
        </ol>

        <h4>方法二：通过终端命令解除限制</h4>
        <ol>
          <li>打开终端（Terminal）</li>
          <li>复制粘贴以下命令并回车：</li>
          <code>xattr -cr "/Applications/Task Time Tracker.app"</code>
          <li>输入管理员密码</li>
          <li>重新打开应用</li>
        </ol>
          </div>
      <template #footer>
        <div class="dialog-footer">
          <el-checkbox v-model="isFirstTime" label="不再显示" />
          <el-button type="primary" @click="showHelpDialog = false">
            我知道了
          </el-button>
          </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useKeyboardShortcuts } from '../components/KeyboardShortcuts'
import StatisticsCards from '../components/tasks/StatisticsCards.vue'
import TaskList from '../components/tasks/TaskList.vue'
import TaskDetail from '../components/tasks/TaskDetail.vue'
import RecycleBin from '../components/tasks/RecycleBin.vue'
import TimeDistribution from '../components/tasks/TimeDistribution.vue'

console.log('Tasks component setup starting')

// 添加类型声明
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>
        on(channel: string, func: (...args: any[]) => void): void
        removeAllListeners(channel: string): void
      }
    }
  }
}

// 添加必要的类型定
interface Task {
  id: number;
  name: string;
  completed: boolean;
  createdAt: string;
  deleted?: boolean;
  deletedAt?: string | null;
  description?: string;
}

interface TaskStats {
  today?: Task[];
  week?: Task[];
  month?: Task[];
  quarter?: Task[];
  year?: Task[];
  deleted?: Task[];
}

interface TaskEvent {
  task?: Task;
  stats?: TaskStats;
}

type RangeType = 'today' | 'week' | 'month' | 'quarter' | 'year';
type ViewRangeType = Exclude<RangeType, 'today'>;

// 定义 Actions 接口
interface Actions {
  selectTask: (index: number, isCompleted: boolean) => void;
  openTaskDetail: (task: Task) => void;
  handleHardDeleteTask: (task: Task) => Promise<void>;
  handleRestoreTask: (task: Task) => Promise<void>;
  showRecycleBin: () => void;
  handleSaveTask: (task: Task) => Promise<void>;
  updateTaskCompletion: (task: Task) => void;
  deleteTask: (task: Task) => void;
}

// 定义响应式变量
const tasks = ref<Task[]>([])
const todayTasks = ref<Task[]>([])
const weekTasks = ref<Task[]>([])
const monthTasks = ref<Task[]>([])
const deletedTasks = ref<Task[]>([])
const selectedTaskIndex = ref(-1)
const viewingCompleted = ref(false)
const showQuickAdd = ref(false)
const newTaskName = ref('')
const taskInput = ref<any>()
const isProcessingTask = ref(false)
const lastTaskAddTime = ref(0)
const quarterTasks = ref<Task[]>([])
const yearTasks = ref<Task[]>([])
const showTaskDashboard = ref(false)
const rangeTasks = ref<Task[]>([])
const rangeStats = ref({
  total: 0,
  completed: 0,
  pending: 0
})
const currentRange = ref<ViewRangeType>('week')
const taskDetailVisible = ref(false)
const currentTask = ref<Task | null>(null)
const showRecycleBinDialog = ref(false)
const viewingRecycleBin = ref(false)
const showConfigDialog = ref(false)
const showHelpDialog = ref(false)
const isFirstTime = ref(true)

// 计算属性
const pendingTasks = computed(() => {
  const allPendingTasks = tasks.value
    .filter(task => !task.completed && !task.deleted)
    
  return allPendingTasks.sort((a, b) => {
    const aIsToday = isToday(new Date(a.createdAt))
    const bIsToday = isToday(new Date(b.createdAt))
    if (aIsToday && !bIsToday) return -1
    if (!aIsToday && bIsToday) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const completedTasks = computed(() => 
  tasks.value
    .filter(task => {
      if (!task.completed || task.deleted) return false
      const taskDate = new Date(task.createdAt)
      return isToday(taskDate)
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

// 辅助函数
const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

const formatDate = (dateString: string) => {
  try {
    if (!dateString) return '未知时间'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '无效日期'
    
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  } catch (error) {
    console.error('Date formatting error:', error)
    return '无效日期'
  }
}

// 事件处理函数
const handleError = (error: Error | string | unknown, context: string): void => {
  console.error(`Error in ${context}:`, error)
  let message = '操作失败'
  
  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }
  
  ElMessage.error(message)
}

const handleAddTask = async () => {
  const now = Date.now()
  if (isProcessingTask.value || !newTaskName.value.trim() || now - lastTaskAddTime.value < 1000) return
  
  try {
    isProcessingTask.value = true
    lastTaskAddTime.value = now
    const taskData = {
      name: newTaskName.value.trim(),
      completed: false,
      description: ''
    }
    
    const newTask = await window.electron.ipcRenderer.invoke('add-task', taskData)
    if (newTask) {
      tasks.value.push(newTask)
      newTaskName.value = ''
      showQuickAdd.value = false
      ElMessage.success('任务添加成功')
      
      await initializeTaskStats()
    }
    
    selectedTaskIndex.value = -1
    viewingCompleted.value = false
    
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'handleAddTask')
  } finally {
    isProcessingTask.value = false
  }
}

const handleDialogOpen = () => {
  nextTick(() => {
    nextTick(() => {
      if (taskInput.value) {
        const input = taskInput.value.$el.querySelector('input') || taskInput.value.input || taskInput.value
        if (input && typeof input.focus === 'function') {
          input.focus()
          input.select()
        }
      }
    })
  })
}

const handleDialogClose = () => {
  newTaskName.value = ''
  isProcessingTask.value = false
}

const handleNewTask = (taskData: any) => {
  try {
    if (!taskData || typeof taskData.name !== 'string') {
      throw new Error('无效的任务数据')
    }
    const newTask = {
      id: Date.now(),
      name: taskData.name,
      completed: false,
      createdAt: taskData.createdAt || new Date().toISOString()
    }
    tasks.value.push(newTask)
  } catch (error) {
    handleError(error, 'handleNewTask')
  }
}

const handleTaskUpdate = (updatedTask: Task): void => {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value = tasks.value.map((task, i) => 
      i === index ? { ...updatedTask } : task
    )
  }
  
  if (currentTask.value && currentTask.value.id === updatedTask.id) {
    currentTask.value = { ...updatedTask }
  }
}

const handleSaveTask = async (updatedTask: Task) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('update-task', updatedTask)
    if (result) {
      ElMessage.success('任务已保存')
      handleTaskUpdate(result)
      taskDetailVisible.value = false
    }
  } catch (error) {
    handleError(error, 'handleSaveTask')
  }
}

const handleSelectTask = (index: number, isCompleted: boolean) => {
  if (viewingRecycleBin.value) {
    viewingRecycleBin.value = false
    showRecycleBinDialog.value = false
  }
  selectedTaskIndex.value = index
  viewingCompleted.value = isCompleted
  
  nextTick(() => {
    tasksViewRef.value?.focus()
  })
}

const openTaskDetail = (task: Task) => {
  currentTask.value = { ...task }
  taskDetailVisible.value = true
}

const handleRestoreTask = async (task: Task) => {
  try {
    const restoredTask = await window.electron.ipcRenderer.invoke('restore-task', task.id)
    
    if (restoredTask) {
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value = [
          ...tasks.value.slice(0, index),
          restoredTask,
          ...tasks.value.slice(index + 1)
        ]
        
        const deletedIndex = deletedTasks.value.findIndex(t => t.id === task.id)
        if (deletedIndex !== -1) {
          deletedTasks.value.splice(deletedIndex, 1)
        }
      }
      
      ElMessage.success(`任务"${task.name}"已恢复`)
      await initializeTaskStats()
    }
    
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'handleRestoreTask')
  }
}

const handleHardDeleteTask = async (task: Task) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('permanently-delete-task', task.id)
    if (result) {
      const index = deletedTasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        deletedTasks.value.splice(index, 1)
      }
      ElMessage.success(`任务"${task.name}"已永久删除`)
    }
  } catch (error) {
    handleError(error, 'handleHardDeleteTask')
  }
}

const showRecycleBin = () => {
  showRecycleBinDialog.value = true
  viewingRecycleBin.value = true
  selectedTaskIndex.value = -1
}

const showRangeTasks = (range: RangeType) => {
  if (range === 'today') {
    return
  }
  currentRange.value = range as ViewRangeType
  window.electron.ipcRenderer.invoke('get-range-tasks', range)
    .then((data) => {
      if (data) {
        rangeTasks.value = (data.tasks || []).map((task: any) => ({
          ...task,
          deletedAt: task.deletedAt || undefined
        })) as Task[]
        rangeStats.value = data.stats || { total: 0, completed: 0, pending: 0 }
        showTaskDashboard.value = true
      }
    })
    .catch((error: unknown) => {
      handleError(error, 'showRangeTasks')
    })
}

// 配置相关
const configInfo = ref({
  dataPath: '',
  version: '',
  lastBackup: null
})

const showConfig = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-config')
    if (result) {
    configInfo.value = result
      showConfigDialog.value = true
    }
  } catch (error) {
    handleError(error, 'showConfig')
  }
}

const handleSelectDataPath = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('select-data-path')
    if (result) {
      configInfo.value = result
      ElMessage.success('数据存储路径已更新')
    }
  } catch (error) {
    handleError(error, 'handleSelectDataPath')
  }
}

const handleExportData = () => {
  ElMessage.info('即将支持数据导出功能')
}

const handleImportData = () => {
  ElMessage.info('即将支持数据导入功能')
}

const handleClearData = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('clear-all-data')
    if (result.success) {
      tasks.value = []
      todayTasks.value = []
      weekTasks.value = []
      monthTasks.value = []
      quarterTasks.value = []
      yearTasks.value = []
      deletedTasks.value = []
      
      selectedTaskIndex.value = -1
      viewingCompleted.value = false
      
      showTaskDashboard.value = false
      taskDetailVisible.value = false
      showRecycleBinDialog.value = false
      showConfigDialog.value = false
      
      ElMessage({
        type: 'success',
        message: `数据已清空，备份已保存至: ${result.backupPath}`,
        duration: 5000
      })
      
      await loadConfig()
    } else {
      throw new Error(result.error || '清空数据失败')
    }
  } catch (error) {
    handleError(error, 'handleClearData')
  }
}

// 初始化任务统计
const initializeTaskStats = async (): Promise<void> => {
  try {
    const ranges = ['today', 'week', 'month', 'quarter', 'year'] as const
    for (const range of ranges) {
      const result = await window.electron.ipcRenderer.invoke('get-range-tasks', range)
      if (result && result.tasks) {
        switch (range) {
          case 'today':
            todayTasks.value = result.tasks
            break
          case 'week':
            weekTasks.value = result.tasks
            break
          case 'month':
            monthTasks.value = result.tasks
            break
          case 'quarter':
            quarterTasks.value = result.tasks
            break
          case 'year':
            yearTasks.value = result.tasks
            break
        }
      }
    }
  } catch (error) {
    handleError(error, 'initializeTaskStats')
  }
}

// 加载配置
const loadConfig = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-config')
    configInfo.value = result
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

// 更新任务统计
const updateTaskStats = (stats: TaskStats): void => {
  if (stats.today) todayTasks.value = stats.today
  if (stats.week) weekTasks.value = stats.week
  if (stats.month) monthTasks.value = stats.month
  if (stats.quarter) quarterTasks.value = stats.quarter
  if (stats.year) yearTasks.value = stats.year
  if (stats.deleted) deletedTasks.value = stats.deleted
}

// 键盘快捷键
const tasksViewRef = ref<HTMLElement | null>(null)

// 修改 keyboardState 类型
interface KeyboardState {
  selectedTaskIndex: number;
  viewingRecycleBin: boolean;
  showQuickAdd: boolean;
  taskDetailVisible: boolean;
  showTaskDashboard: boolean;
  viewingCompleted: boolean;
  selectedDeletedIndex: number;
}

const keyboardState = computed<KeyboardState>(() => ({
  selectedTaskIndex: selectedTaskIndex.value,
  viewingRecycleBin: viewingRecycleBin.value,
  showQuickAdd: showQuickAdd.value,
  taskDetailVisible: taskDetailVisible.value,
  showTaskDashboard: showTaskDashboard.value,
  viewingCompleted: viewingCompleted.value,
  selectedDeletedIndex: -1 // 添加缺失的属性
}))

const taskLists = computed(() => ({
  pendingTasks: pendingTasks.value,
  completedTasks: completedTasks.value,
  deletedTasks: deletedTasks.value
}))

const keyboardActions: Actions = {
  selectTask: handleSelectTask,
  openTaskDetail,
  handleHardDeleteTask,
  handleRestoreTask,
  showRecycleBin,
  handleSaveTask,
  updateTaskCompletion,
  deleteTask
}

const { handleKeydown: handleKeyboardShortcuts } = useKeyboardShortcuts(
  keyboardState,
  taskLists,
  keyboardActions
)

// 生命周期钩子
onMounted(async () => {
  if (tasksViewRef.value) {
    tasksViewRef.value.focus()
  }

  try {
    const initialTasks = await window.electron.ipcRenderer.invoke('get-tasks')
    if (initialTasks) {
      tasks.value = initialTasks
    }

    // 检查是否是第一次打开应用
    const isFirstTimeOpen = await window.electron.ipcRenderer.invoke('get-first-time')
    if (isFirstTimeOpen && window.electron.ipcRenderer.invoke('is-mac')) {
      isFirstTime.value = true
      showHelpDialog.value = true
      // 标记为非首次打开
      await window.electron.ipcRenderer.invoke('set-first-time', false)
    }
  } catch (error) {
    handleError(error, 'initial tasks loading')
  }

  await initializeTaskStats()

  window.electron.ipcRenderer.on('task-added', (_: unknown, data: TaskEvent) => {
    if (data.task) handleNewTask(data.task)
    if (data.stats) updateTaskStats(data.stats)
  })

  window.electron.ipcRenderer.on('task-updated', (_: unknown, data: TaskEvent) => {
    if (data.task) handleTaskUpdate(data.task)
    if (data.stats) updateTaskStats(data.stats)
  })

  window.electron.ipcRenderer.on('task-deleted', (_: unknown, data: TaskEvent) => {
    if (data.task) {
      const deletedTask = data.task
      const index = tasks.value.findIndex(t => t.id === deletedTask.id)
      if (index !== -1) {
        const taskWithDates = {
          ...deletedTask,
          deleted: true,
          deletedAt: deletedTask.deletedAt || new Date().toISOString(),
          createdAt: deletedTask.createdAt || new Date().toISOString()
        }
        tasks.value = tasks.value.map((task, i) => 
          i === index ? taskWithDates : task
        )
        
        const existingIndex = deletedTasks.value.findIndex(t => t.id === deletedTask.id)
        if (existingIndex === -1) {
          deletedTasks.value = [...deletedTasks.value, taskWithDates]
        }
      }
    }
    if (data.stats) updateTaskStats(data.stats)
  })

  window.electron.ipcRenderer.on('task-restored', (_: unknown, data: TaskEvent) => {
    if (data.task) {
      const restoredTask = data.task
      const index = tasks.value.findIndex(t => t.id === restoredTask.id)
      if (index !== -1) {
        const taskWithAllData = {
          ...tasks.value[index],
          ...restoredTask,
          deleted: false,
          deletedAt: null
        }
        tasks.value = tasks.value.map((task, i) => 
          i === index ? taskWithAllData : task
        )
        
        const deletedIndex = deletedTasks.value.findIndex(t => t.id === restoredTask.id)
        if (deletedIndex !== -1) {
          deletedTasks.value = deletedTasks.value.filter((_, i) => i !== deletedIndex)
        }
      }
    }
    if (data.stats) updateTaskStats(data.stats)
  })

  const quickAddHandler = (e: KeyboardEvent) => {
    if (e.metaKey && e.key.toLowerCase() === 'i' && !showQuickAdd.value && !taskDetailVisible.value) {
      e.preventDefault()
      showQuickAdd.value = true
      nextTick(() => {
        if (taskInput.value) {
          taskInput.value.focus()
          taskInput.value.select()
        }
      })
    }
  }
  window.addEventListener('keydown', quickAddHandler)

  onUnmounted(() => {
    window.removeEventListener('keydown', quickAddHandler)
    window.electron.ipcRenderer.removeAllListeners('task-added')
    window.electron.ipcRenderer.removeAllListeners('task-updated')
    window.electron.ipcRenderer.removeAllListeners('task-deleted')
    window.electron.ipcRenderer.removeAllListeners('task-restored')
  })
})

// 添加缺失的函数
const updateTaskCompletion = (task: Task): void => {
  const updatedTask = {
    ...task,
    completed: !task.completed
  }
  window.electron.ipcRenderer.invoke('update-task', updatedTask)
    .then((result) => {
      if (result) {
        ElMessage.success(`任务"${task.name}"已${result.completed ? '完成' : '取消完成'}`)
        
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index !== -1) {
          tasks.value[index] = result
        }
        
        selectedTaskIndex.value = -1
        viewingCompleted.value = false
        
        initializeTaskStats()
      }
      
      nextTick(() => {
        tasksViewRef.value?.focus()
      })
    })
    .catch((error: unknown) => {
      handleError(error, 'updateTaskCompletion')
    })
}

const deleteTask = (task: Task): void => {
  console.log('Deleting task:', task)
  if (!task || task.deleted) return
  
  window.electron.ipcRenderer.invoke('delete-task', task.id)
    .then((deletedTask) => {
      if (deletedTask) {
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index !== -1) {
          tasks.value = [
            ...tasks.value.slice(0, index),
            deletedTask,
            ...tasks.value.slice(index + 1)
          ]
          deletedTasks.value = [...deletedTasks.value, deletedTask]
        }
        
        selectedTaskIndex.value = -1
        viewingCompleted.value = false
        
        ElMessage.success(`任务"${task.name}"已移至回收站`)
        
        initializeTaskStats()
      }
      
      nextTick(() => {
        tasksViewRef.value?.focus()
      })
    })
    .catch((error: unknown) => {
      handleError(error, 'deleteTask')
    })
}
</script>

<style lang="scss" scoped>
.tasks-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  outline: none;
}

.config-container {
  padding: 20px;

  .path-selector {
    display: flex;
    gap: 12px;
    align-items: center;

    .el-input {
      flex: 1;
    }
  }

  .data-management {
    display: flex;
    gap: 12px;
  }
}

.help-content {
  padding: 20px;
  
  h4 {
    margin: 16px 0 8px;
    color: var(--el-color-primary);
  }

  ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  code {
          display: block;
    margin: 8px 0;
    padding: 8px;
    background-color: var(--el-color-info-light-9);
    border-radius: 4px;
    font-family: monospace;
  }
}

.dialog-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
}
</style>
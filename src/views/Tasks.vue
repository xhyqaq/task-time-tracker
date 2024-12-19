<template>
  <div class="tasks-view" @keydown="handleKeyboardShortcuts" tabindex="0" ref="tasksViewRef">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('today')">
          <div class="statistic-item">
            <div class="title">今日任务</div>
            <div class="value">{{ todayTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('week')">
          <div class="statistic-item">
            <div class="title">本周任务</div>
            <div class="value">{{ weekTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('month')">
          <div class="statistic-item">
            <div class="title">本月任务</div>
            <div class="value">{{ monthTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('quarter')">
          <div class="statistic-item">
            <div class="title">本季度任务</div>
            <div class="value">{{ quarterTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('year')">
          <div class="statistic-item">
            <div class="title">本年度任务</div>
            <div class="value">{{ yearTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">总任务</div>
            <div class="value">{{ tasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showConfig">
          <div class="statistic-item">
            <div class="title">系统配置</div>
            <div class="value">
              <el-icon><Setting /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">待处理</div>
            <div class="value">{{ pendingTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">已完成</div>
            <div class="value">{{ completedTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="clickable recycle-bin-card" @click="showRecycleBin">
          <div class="statistic-item">
            <div class="title">回收站</div>
            <div class="value danger">{{ deletedTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <!-- 进行中的任务 -->
      <el-card class="tasks-container">
        <template #header>
          <div class="card-header">
            <h2>进行中 ({{ pendingTasks.length }})</h2>
            <el-button type="primary" @click="showQuickAdd = true">
              <el-icon><Plus /></el-icon>添加任务
            </el-button>
          </div>
        </template>

        <div class="tasks-list">
          <el-empty v-if="pendingTasks.length === 0" description="暂无进行中的任务" />
          <template v-else>
            <div
              v-for="(task, index) in pendingTasks"
              :key="task.id"
              :class="{ 'selected': selectedTaskIndex === index && !viewingCompleted }"
              class="task-item"
              @click="selectTask(index, false)"
              @dblclick="openTaskDetail(task)"
            >
              <div class="task-content">
                <div class="task-info">
                  <span class="task-index">{{ index + 1 }}</span>
                  <span class="task-name">{{ task.name }}</span>
                  <el-tag v-if="task.description" size="small" type="success">额外说明</el-tag>
                </div>
                <div class="task-actions">
                  <el-tag type="warning" size="small" class="status-tag">进行中</el-tag>
                  <span class="task-date">{{ formatDate(task.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-card>

      <!-- 已完成的任务 -->
      <el-card class="tasks-container">
        <template #header>
          <div class="card-header">
            <h2>已完成 ({{ completedTasks.length }})</h2>
          </div>
        </template>

        <div class="tasks-list">
          <el-empty v-if="completedTasks.length === 0" description="暂无已完成的任务" />
          <template v-else>
            <div
              v-for="(task, index) in completedTasks"
              :key="task.id"
              :class="{ 'selected': selectedTaskIndex === index && viewingCompleted }"
              class="task-item completed"
              @click="selectTask(index, true)"
              @dblclick="openTaskDetail(task)"
            >
              <div class="task-content">
                <div class="task-info">
                  <span class="task-index">{{ index + 1 }}</span>
                  <span class="task-name">{{ task.name }}</span>
                  <el-tag v-if="task.description" size="small" type="success">额外说明</el-tag>
                </div>
                <div class="task-actions">
                  <el-tag type="success" size="small" class="status-tag">已完成</el-tag>
                  <span class="task-date">{{ formatDate(task.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-card>
    </div>

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

    <!-- 任务仪表盘对话框 -->
    <el-dialog
      v-model="showTaskDashboard"
      :title="dashboardTitle"
      width="80%"
      :fullscreen="false"
      destroy-on-close
      top="10vh"
    >
      <div class="task-dashboard">
        <!-- 仪表盘统计 -->
        <el-row :gutter="20" class="dashboard-stats">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="statistic-item">
                <div class="title">总任务数</div>
                <div class="value">{{ rangeStats.total }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="statistic-item">
                <div class="title">已完成</div>
                <div class="value success">{{ rangeStats.completed }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="statistic-item">
                <div class="title">待处理</div>
                <div class="value warning">{{ rangeStats.pending }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="clickable" @click="showRecycleBin">
              <div class="statistic-item">
                <div class="title">回收站</div>
                <div class="value danger">{{ deletedTasks.length }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 任务列表 -->
        <div class="range-tasks-list">
          <el-table :data="rangeTasks" style="width: 100%" :max-height="500">
            <el-table-column type="index" width="50" />
            <el-table-column prop="name" label="任务名称">
              <template #default="{ row }">
                <div class="task-name-cell">
                  <span>{{ row.name }}</span>
                  <el-tag v-if="row.description" size="small" type="success">额外说明</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="completed" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.completed ? 'success' : 'warning'">
                  {{ row.completed ? '已完成' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="200">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="taskDetailVisible"
      title="任务详情"
      width="50%"
      destroy-on-close
      @keydown.stop
      @keydown.esc="taskDetailVisible = false"
    >
      <div class="task-detail" v-if="currentTask">
        <div class="task-title">
          <el-input
            v-model="taskTitle"
            placeholder="任务标题"
            @keydown.enter="handleUpdateTaskTitle"
            @keydown.stop
          />
        </div>
        <el-divider />
        <div class="task-description">
          <el-input
            v-model="taskDescription"
            type="textarea"
            :rows="4"
            placeholder="添加任务说明..."
            @keydown.enter="handleUpdateTaskDescription"
            @keydown.stop
          />
        </div>
        <div class="task-meta">
          <p>创建时间：{{ formatDate(currentTask.createdAt) }}</p>
          <p>状态：
            <el-tag :type="currentTask.completed ? 'success' : 'warning'">
              {{ currentTask.completed ? '已完成' : '进行中' }}
            </el-tag>
          </p>
        </div>
      </div>
    </el-dialog>

    <!-- 回收站对话框 -->
    <el-dialog
      v-model="showRecycleBinDialog"
      title="回收站"
      width="80%"
      destroy-on-close
      @keydown.stop
      @keydown.esc="closeRecycleBin"
      top="10vh"
    >
      <div class="recycle-bin">
        <!-- 回收站统计 -->
        <el-card class="tasks-container">
          <template #header>
            <div class="card-header">
              <h2>已删除任务 ({{ deletedTasks.length }})</h2>
              <div class="header-actions">
                <el-button type="primary" size="small" :disabled="!selectedDeletedTask" @click="handleRestoreTask(selectedDeletedTask)">
                  恢复选中任务
                </el-button>
                <el-button type="danger" size="small" :disabled="!selectedDeletedTask" @click="handleHardDeleteTask(selectedDeletedTask)">
                  永久删除
                </el-button>
              </div>
            </div>
          </template>

          <div class="tasks-list">
            <el-empty v-if="deletedTasks.length === 0" description="回收站为空" />
            <template v-else>
              <div
                v-for="(task, index) in deletedTasks"
                :key="task.id"
                :class="{ 'selected': selectedDeletedIndex === index }"
                class="task-item deleted"
                @click="selectDeletedTask(task, index)"
                @dblclick="openTaskDetail(task)"
              >
                <div class="task-content">
                  <div class="task-info">
                    <span class="task-index">{{ index + 1 }}</span>
                    <span class="task-name">{{ task.name }}</span>
                    <el-tag v-if="task.description" size="small" type="success">额外说明</el-tag>
                    <el-tag :type="task.completed ? 'success' : 'warning'" size="small" class="status-tag">
                      {{ task.completed ? '已完成' : '进行中' }}
                    </el-tag>
                  </div>
                  <div class="task-actions">
                    <el-button-group>
                      <el-button type="primary" size="small" @click.stop="handleRestoreTask(task)">
                        恢复
                      </el-button>
                      <el-button type="danger" size="small" @click.stop="handleHardDeleteTask(task)">
                        删除
                      </el-button>
                    </el-button-group>
                    <span class="task-date">删除于：{{ formatDate(task.deletedAt || task.createdAt) }}</span>
                    <span class="task-date">创建于：{{ formatDate(task.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </el-card>
      </div>
    </el-dialog>

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
                title="确定要清空所有数据吗？此操作不可恢复！"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Plus, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useKeyboardShortcuts } from '../components/KeyboardShortcuts'

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

interface Task {
  id: number
  name: string
  completed: boolean
  createdAt: string
  deleted?: boolean
  deletedAt?: string | null
  description?: string
}

interface RangeType {
  today: string
  week: string
  month: string
  quarter: string
  year: string
  [key: string]: string
}

// 关闭回收站
const closeRecycleBin = () => {
  showRecycleBinDialog.value = false
}

// 修改删除任务的方法
const deleteTask = async (task: Task) => {
  console.log('Deleting task:', task)
  if (!task || task.deleted) return
  
  try {
    const now = new Date().toISOString()
    const deletedTask = await window.electron.ipcRenderer.invoke('delete-task', task.id)
    
    if (deletedTask) {
      // 更新本地状态
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value[index] = deletedTask
        deletedTasks.value.push(deletedTask)
      }
      
      // 重置选中状态
      selectedTaskIndex.value = -1
      viewingCompleted.value = false
      
      // 显示成功消息
      ElMessage.success(`任务"${task.name}"已移至回收站`)
    }
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'deleteTask')
  }
}

const tasks = ref<Task[]>([])
const todayTasks = ref<Task[]>([])
const weekTasks = ref<Task[]>([])
const monthTasks = ref<Task[]>([])
const deletedTasks = ref<Task[]>([])
const selectedTaskIndex = ref(-1)
const viewingCompleted = ref(false)
const showQuickAdd = ref(false)
const newTaskName = ref('')
const taskInput = ref()
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
const currentRange = ref('')
const activeTab = ref('tasks')
const taskDetailVisible = ref(false)
const currentTask = ref<Task | null>(null)
const taskDescription = ref('')
const taskTitle = ref('')
const showRecycleBinDialog = ref(false)
const viewingRecycleBin = ref(false)
const selectedDeletedTask = ref<Task | null>(null)
const selectedDeletedIndex = ref(-1)

// 计算属
const pendingTasks = computed(() => 
  tasks.value
    .filter(task => !task.completed && !task.deleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

const completedTasks = computed(() => 
  tasks.value
    .filter(task => task.completed && !task.deleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

const completionRate = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedTasks.value.length / tasks.value.length) * 100)
})

const dashboardTitle = computed(() => {
  const titles: RangeType = {
    today: '今日任务仪表盘',
    week: '本周任务仪表盘',
    month: '本月任务仪表盘',
    quarter: '本季度任务仪表盘',
    year: '本年度任务仪表盘'
  }
  return titles[currentRange.value] || '任务仪表盘'
})

// 添加错误处理函数
const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error)
  ElMessage.error(`操作失败: ${error.message || '未知错误'}`)
}

// 修改处理任务添加的方法
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
    }
    
    // 重置选中状态
    selectedTaskIndex.value = -1
    viewingCompleted.value = false
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'handleAddTask')
  } finally {
    isProcessingTask.value = false
  }
}

// 处理对话框打开
const handleDialogOpen = () => {
  console.log('Dialog opened')
  nextTick(() => {
    console.log('Focusing task input after dialog open')
    if (taskInput.value) {
      taskInput.value.focus()
      taskInput.value.select()
    }
  })
}

// 处理对话框关闭
const handleDialogClose = () => {
  console.log('Dialog closed')
  newTaskName.value = ''
  isProcessingTask.value = false
}

// 监听主进程发来的新任务
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

// 格式化日期
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

// 修改恢复任务的方法
const handleRestoreTask = async (task: Task) => {
  try {
    const restoredTask = await window.electron.ipcRenderer.invoke('restore-task', task.id)
    
    if (restoredTask) {
      // 更新本地状态
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value[index] = restoredTask
        // 从回收站中移除
        const deletedIndex = deletedTasks.value.findIndex(t => t.id === task.id)
        if (deletedIndex !== -1) {
          deletedTasks.value.splice(deletedIndex, 1)
        }
      }
      
      // 重置选中状态
      selectedDeletedIndex.value = -1
      selectedDeletedTask.value = null
      
      // 显示成功消息
      ElMessage.success(`任务"${task.name}"已恢复`)
    }
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'handleRestoreTask')
  }
}

// 显示指定时间范围的任
const showRangeTasks = async (range: string) => {
  console.log('Showing range tasks:', range)
  currentRange.value = range
  showTaskDashboard.value = true
  try {
    const data = await window.electron.ipcRenderer.invoke('get-range-tasks', range)
    if (data) {
      rangeTasks.value = data.tasks || []
      rangeStats.value = data.stats || { total: 0, completed: 0, pending: 0 }
    }
  } catch (error) {
    handleError(error, 'showRangeTasks')
  }
}

// 处理任务说明更新
const handleUpdateTaskDescription = async () => {
  if (!currentTask.value) return
  
  try {
    const updatedTask = {
      id: currentTask.value.id,
      name: currentTask.value.name,
      description: taskDescription.value,
      completed: currentTask.value.completed,
      createdAt: currentTask.value.createdAt
    }
    const result = await window.electron.ipcRenderer.invoke('update-task', updatedTask)
    if (result) {
      ElMessage.success('任务说明已更新')
      handleTaskUpdate(result)
    }
  } catch (error) {
    handleError(error, 'handleUpdateTaskDescription')
  }
}

// 处理永久删除任务
const handleHardDeleteTask = async (task: Task) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('permanently-delete-task', task.id)
    if (result) {
      selectedDeletedIndex.value = -1
      selectedDeletedTask.value = null
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

// 修改打开任务详情的方法
const openTaskDetail = (task: Task) => {
  console.log('Opening task detail:', task)
  try {
    if (!task) {
      throw new Error('无效的任务数据')
    }
    currentTask.value = { ...task }
    taskTitle.value = task.name
    taskDescription.value = task.description || ''
    taskDetailVisible.value = true
  } catch (error) {
    handleError(error, 'openTaskDetail')
  }
}

// 显示回收站
const showRecycleBin = () => {
  console.log('Showing recycle bin')
  showRecycleBinDialog.value = true
  viewingRecycleBin.value = true
  selectedTaskIndex.value = -1
}

// 处理任务标题更新
const handleUpdateTaskTitle = async () => {
  if (!currentTask.value || taskTitle.value === currentTask.value.name) return
  
  try {
    const updatedTask = {
      id: currentTask.value.id,
      name: taskTitle.value,
      description: currentTask.value.description,
      completed: currentTask.value.completed,
      createdAt: currentTask.value.createdAt
    }
    const result = await window.electron.ipcRenderer.invoke('update-task', updatedTask)
    if (result) {
      ElMessage.success('任务标题已更新')
      handleTaskUpdate(result)
    }
  } catch (error) {
    handleError(error, 'handleUpdateTaskTitle')
  }
}

// 选择已删除的任务
const selectDeletedTask = (task: Task, index: number) => {
  console.log('Selecting deleted task:', { task, index })
  selectedDeletedIndex.value = index
  selectedTaskIndex.value = -1
  selectedDeletedTask.value = task
  viewingCompleted.value = false
}

// 修改 watch 函数，重置所有选中状态
watch(showRecycleBinDialog, (newValue) => {
  console.log('Recycle bin dialog state changed:', newValue)
  if (!newValue) {
    console.log('Resetting selection states')
    viewingRecycleBin.value = false
    selectedTaskIndex.value = -1
    selectedDeletedIndex.value = -1
    selectedDeletedTask.value = null
    viewingCompleted.value = false
  }
})

// 修改选择任务的方法，使其互斥
const selectTask = (index: number, isCompleted: boolean = false) => {
  console.log('Selecting task:', { index, isCompleted })
  if (viewingRecycleBin.value) {
    console.log('Closing recycle bin before selecting task')
    viewingRecycleBin.value = false
    showRecycleBinDialog.value = false
  }
  selectedTaskIndex.value = index
  viewingCompleted.value = isCompleted
  selectedDeletedIndex.value = -1
  selectedDeletedTask.value = null
  
  // 确保根元素重新获得焦点
  nextTick(() => {
    tasksViewRef.value?.focus()
  })
}

// 更新任务完成状态
const updateTaskCompletion = async (task: Task) => {
  try {
    const updatedTask = {
      ...task,
      completed: !task.completed
    }
    const result = await window.electron.ipcRenderer.invoke('update-task', updatedTask)
    if (result) {
      ElMessage.success(`任务"${task.name}"已${result.completed ? '完成' : '取消完成'}`)
      
      // 更新本地任务状态
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value[index] = result
      }
      
      // 重置选中状态
      selectedTaskIndex.value = -1
      viewingCompleted.value = false
    }
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'updateTaskCompletion')
  }
}

// 初始化快捷键
const keyboardState = computed(() => ({
  selectedTaskIndex: selectedTaskIndex.value,
  selectedDeletedIndex: selectedDeletedIndex.value,
  viewingRecycleBin: viewingRecycleBin.value,
  showQuickAdd: showQuickAdd.value,
  taskDetailVisible: taskDetailVisible.value,
  showTaskDashboard: showTaskDashboard.value,
  viewingCompleted: viewingCompleted.value
}))

const taskLists = computed(() => ({
  pendingTasks: pendingTasks.value,
  completedTasks: completedTasks.value,
  deletedTasks: deletedTasks.value
}))

const keyboardActions = {
  selectTask,
  selectDeletedTask,
  openTaskDetail,
  handleHardDeleteTask,
  handleRestoreTask,
  closeRecycleBin,
  updateTaskCompletion,
  deleteTask
}

const { handleKeydown: handleKeyboardShortcuts } = useKeyboardShortcuts(
  keyboardState,
  taskLists,
  keyboardActions
)

// 处理任务更新
const handleTaskUpdate = (updatedTask: Task) => {
  try {
    console.log('Handling task update:', updatedTask)
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index === -1) {
      throw new Error('任务不存在')
    }
    
    // 更新任务列表中的任务
    tasks.value[index] = {
      ...tasks.value[index],
      ...updatedTask
    }
    
    // 如果当前正在查看这个任务的详情，也更新详情视图
    if (currentTask.value && currentTask.value.id === updatedTask.id) {
      currentTask.value = {
        ...currentTask.value,
        ...updatedTask
      }
      taskTitle.value = updatedTask.name
      taskDescription.value = updatedTask.description || ''
    }
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'handleTaskUpdate')
  }
}

// 添加根元素引用
const tasksViewRef = ref<HTMLElement | null>(null)

// 加载配置
const loadConfig = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-config')
    configInfo.value = result
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

// 选择数据路径
const handleSelectDataPath = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('select-data-path')
    if (result) {
      configInfo.value = result
      ElMessage.success('数据存储路径已更新')
    }
  } catch (error) {
    console.error('Failed to select data path:', error)
    ElMessage.error('选择路径失败')
  }
}

// 导出数据
const handleExportData = () => {
  ElMessage.info('即将支持数据导出功能')
}

// 导入数据
const handleImportData = () => {
  ElMessage.info('即将支持数据导入功能')
}

// 清空数据
const handleClearData = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('clear-all-data')
    if (result.success) {
      // 清空本地状态
      tasks.value = []
      todayTasks.value = []
      weekTasks.value = []
      monthTasks.value = []
      quarterTasks.value = []
      yearTasks.value = []
      deletedTasks.value = []
      
      // 重置选中状态
      selectedTaskIndex.value = -1
      selectedDeletedIndex.value = -1
      selectedDeletedTask.value = null
      viewingCompleted.value = false
      
      // 关闭所有对话框
      showTaskDashboard.value = false
      taskDetailVisible.value = false
      showRecycleBinDialog.value = false
      showConfigDialog.value = false
      
      ElMessage({
        type: 'success',
        message: `数据已清空，备份已保存至: ${result.backupPath}`,
        duration: 5000
      })
      
      // 更新配置信息
      loadConfig()
    } else {
      throw new Error(result.error || '清空数据失败')
    }
  } catch (error) {
    console.error('Failed to clear data:', error)
    ElMessage.error(error.message || '清空数据失败')
  }
}

// 修改 onMounted 钩子
onMounted(async () => {
  console.log('Tasks component mounted')
  
  // 确保根元素可以接收键盘事件
  if (tasksViewRef.value) {
    tasksViewRef.value.focus()
  }

  // 初始化事件监听
  window.electron.ipcRenderer.on('task-added', (task: any) => {
    console.log('Task added:', task)
    handleNewTask(task)
  })
  
  // 添加 Command + I 快捷键处理
  const quickAddHandler = (e: KeyboardEvent) => {
    console.log('Quick add shortcut check:', e.key)
    if (e.metaKey && e.key.toLowerCase() === 'i' && !showQuickAdd.value && !taskDetailVisible.value) {
      e.preventDefault()
      showQuickAdd.value = true
      nextTick(() => {
        console.log('Focusing task input')
        if (taskInput.value) {
          taskInput.value.focus()
          taskInput.value.select()
        }
      })
    }
  }
  window.addEventListener('keydown', quickAddHandler)

  console.log('Setting up IPC listeners...')
  // 请求初始任务数据
  try {
    const initialTasks = await window.electron.ipcRenderer.invoke('get-tasks')
    if (initialTasks) {
      tasks.value = initialTasks
    }
  } catch (error) {
    handleError(error, 'initial tasks loading')
  }
  
  window.electron.ipcRenderer.on('task-updated', (updatedTask: Task) => {
    console.log('Task updated:', updatedTask)
    handleTaskUpdate(updatedTask)
  })
  
  window.electron.ipcRenderer.on('task-deleted', (deletedTask: Task) => {
    console.log('Task deleted:', deletedTask)
    const index = tasks.value.findIndex(t => t.id === deletedTask.id)
    if (index !== -1) {
      const taskWithDates = {
        ...deletedTask,
        deleted: true,
        deletedAt: deletedTask.deletedAt || new Date().toISOString(),
        createdAt: deletedTask.createdAt || new Date().toISOString()
      }
      tasks.value[index] = taskWithDates
      
      // 检查任务是否已经在回收站中
      const existingIndex = deletedTasks.value.findIndex(t => t.id === deletedTask.id)
      if (existingIndex === -1) {
        deletedTasks.value.push(taskWithDates)
      }
    }
  })
  
  window.electron.ipcRenderer.on('task-restored', (restoredTask: Task) => {
    console.log('Task restored:', restoredTask)
    const index = tasks.value.findIndex(t => t.id === restoredTask.id)
    if (index !== -1) {
      // 保留原始任务的所有数据
      const taskWithAllData = {
        ...tasks.value[index],
        ...restoredTask,
        deleted: false,
        deletedAt: null
      }
      tasks.value[index] = taskWithAllData
      
      // 从回收站中移除
      const deletedIndex = deletedTasks.value.findIndex(t => t.id === restoredTask.id)
      if (deletedIndex !== -1) {
        deletedTasks.value.splice(deletedIndex, 1)
      }
    }
  })
  
  window.electron.ipcRenderer.on('tasks-stats-updated', (stats: any) => {
    console.log('Tasks stats updated:', stats)
    todayTasks.value = stats.today
    weekTasks.value = stats.week
    monthTasks.value = stats.month
    quarterTasks.value = stats.quarter
    yearTasks.value = stats.year
    deletedTasks.value = stats.deleted
  })
  
  window.electron.ipcRenderer.on('range-tasks-loaded', (data: any) => {
    console.log('Range tasks loaded:', data)
    rangeTasks.value = data.tasks || []
    rangeStats.value = data.stats || { total: 0, completed: 0, pending: 0 }
  })

  onUnmounted(() => {
    console.log('Tasks component unmounting, cleaning up listeners...')
    window.removeEventListener('keydown', quickAddHandler)
    window.electron.ipcRenderer.removeAllListeners('task-added')
    window.electron.ipcRenderer.removeAllListeners('task-updated')
    window.electron.ipcRenderer.removeAllListeners('task-deleted')
    window.electron.ipcRenderer.removeAllListeners('task-restored')
    window.electron.ipcRenderer.removeAllListeners('tasks-loaded')
    window.electron.ipcRenderer.removeAllListeners('tasks-stats-updated')
    window.electron.ipcRenderer.removeAllListeners('range-tasks-loaded')
  })
})

// 添加 watch 以确保焦点
watch(showQuickAdd, (newValue) => {
  if (!newValue && tasksViewRef.value) {
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  }
})

watch(taskDetailVisible, (newValue) => {
  if (!newValue && tasksViewRef.value) {
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  }
})

console.log('Tasks component setup complete')

// 添加配置相关的状态
const configInfo = ref({
  dataPath: '',
  version: '',
  lastBackup: null
})

// 显示配置对话框
const showConfigDialog = ref(false)

// 显示配置
const showConfig = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-config')
    if (result) {
      configInfo.value = result
      showConfigDialog.value = true
    }
  } catch (error) {
    console.error('Failed to load config:', error)
    ElMessage.error('加载配置信息失败')
  }
}
</script>

<style lang="scss" scoped>
.tasks-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  outline: none; // 添加这行以移除点轮廓

  .statistics-cards {
    margin-bottom: 20px;

    .statistic-item {
      text-align: center;
      padding: 10px;

      .title {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 8px;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        color: var(--el-color-primary);
      }
    }
  }

  .tasks-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .tasks-container {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .task-item {
      padding: 12px;
      border-radius: 4px;
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateX(4px);
        border-color: var(--el-border-color);
      }
      
      &.selected {
        transform: translateX(10px);
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      &.completed {
        opacity: 0.8;
        .task-name {
          text-decoration: line-through;
          color: var(--el-text-color-secondary);
        }
      }
      
      &.deleted {
        opacity: 0.7;
        background-color: var(--el-color-danger-light-9);
        .task-name {
          color: var(--el-text-color-secondary);
        }
      }
      
      .task-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .task-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .task-index {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--el-color-info-light-9);
            border-radius: 12px;
            font-size: 12px;
          }
          
          .task-name {
            font-size: 16px;
          }
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 12px;

          .status-tag {
            min-width: 56px;
            text-align: center;
          }

          .task-date {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }
        }
      }
    }
  }
}

:deep(.el-dialog) {
  margin-top: 30vh !important;
  
  .el-dialog__header {
    margin-right: 0;
    padding-bottom: 10px;
  }
  
  .el-dialog__body {
    padding-top: 10px;
  }
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}

.task-dashboard {
  .dashboard-stats {
    margin-bottom: 24px;
    
    .value {
      &.success {
        color: var(--el-color-success);
      }
      
      &.warning {
        color: var(--el-color-warning);
      }
      
      &.danger {
        color: var(--el-color-danger);
      }
    }
  }
  
  .range-tasks-list {
    margin-top: 24px;
  }
}

.task-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-tag {
    opacity: 0.6;
  }
}

.task-detail {
  padding: 20px;
  
  h3 {
    margin: 0;
    color: var(--el-text-color-primary);
  }
  
  .task-description {
    margin: 20px 0;
  }
  
  .task-meta {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    
    p {
      margin: 8px 0;
    }
  }
}

.task-title {
  margin-bottom: 20px;
  
  .el-input {
    font-size: 18px;
    font-weight: 500;
  }
}

.task-detail {
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    box-shadow: none !important;
    border: 1px solid var(--el-border-color-light);
    
    &:hover, &:focus {
      border-color: var(--el-color-primary);
    }
  }
}

.recycle-bin {
  .tasks-container {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .task-item {
    &.deleted {
      .task-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .task-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .task-index {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--el-color-info-light-9);
            border-radius: 12px;
            font-size: 12px;
          }
          
          .task-name {
            font-size: 16px;
            margin-right: 12px;
          }

          .status-tag {
            margin-left: auto;
          }
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 12px;

          .task-date {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }

          .el-button-group {
            margin-right: 12px;
          }
        }
      }
    }
  }
}

.recycle-bin-card {
  .value.danger {
    color: var(--el-color-danger);
  }
  
  &:hover {
    border-color: var(--el-color-danger);
    
    .value.danger {
      transform: scale(1.1);
    }
  }
}

.value {
  .el-icon {
    font-size: 24px;
    color: var(--el-color-primary);
  }
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
</style> 
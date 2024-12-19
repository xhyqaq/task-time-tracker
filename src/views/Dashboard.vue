<template>
  <div class="dashboard">
    <!-- 第一行：时间维度统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="4">
        <el-card class="stat-card" @click="handleCardClick('today')">
          <div class="stat-content">
            <div class="stat-title">今日任务</div>
            <div class="stat-value">{{ todayStats?.total || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" @click="handleCardClick('week')">
          <div class="stat-content">
            <div class="stat-title">本周任务</div>
            <div class="stat-value">{{ weekStats?.total || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" @click="handleCardClick('month')">
          <div class="stat-content">
            <div class="stat-title">本月任务</div>
            <div class="stat-value">{{ monthStats?.total || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" @click="handleCardClick('quarter')">
          <div class="stat-content">
            <div class="stat-title">本季度任务</div>
            <div class="stat-value">{{ quarterStats?.total || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" @click="handleCardClick('year')">
          <div class="stat-content">
            <div class="stat-title">本年度任务</div>
            <div class="stat-value">{{ yearStats?.total || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">总任务</div>
            <div class="stat-value">{{ totalTasks }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：状态统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">待处理</div>
            <div class="stat-value primary">{{ pendingTasks }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">已完成</div>
            <div class="stat-value success">{{ completedTasks }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">回收站</div>
            <div class="stat-value warning">{{ deletedTasks }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：配置信息 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="24">
        <el-card class="config-card" @click="showConfigDialog = true">
          <div class="config-content">
            <div class="config-header">
              <h3>系统配置</h3>
              <el-icon><Setting /></el-icon>
            </div>
            <div class="config-info">
              <div class="config-item">
                <span class="label">数据存储路径：</span>
                <span class="value">{{ config.dataPath || '未设置' }}</span>
              </div>
              <div class="config-item">
                <span class="label">数据总量：</span>
                <span class="value">{{ totalTasks }} 条</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置详情对话框 -->
    <el-dialog
      v-model="showConfigDialog"
      title="系统配置"
      width="600px"
    >
      <el-form label-width="120px">
        <el-form-item label="数据存储路径">
          <el-input
            v-model="config.dataPath"
            readonly
            placeholder="点击选择按钮设置数据存储路径"
          >
            <template #append>
              <el-button @click="handleSelectDataPath">选择路径</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="数据管理">
          <el-button type="primary" @click="handleExportData">导出数据</el-button>
          <el-button type="warning" @click="handleImportData">导入数据</el-button>
          <el-popconfirm
            title="确定要清空所有数据吗？此操作不可恢复！"
            @confirm="handleClearData"
          >
            <template #reference>
              <el-button type="danger">清空数据</el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface TaskStats {
  total: number
  completed: number
  pending: number
}

interface Config {
  dataPath: string
}

// 统计数据
const todayStats = ref<TaskStats | null>(null)
const weekStats = ref<TaskStats | null>(null)
const monthStats = ref<TaskStats | null>(null)
const quarterStats = ref<TaskStats | null>(null)
const yearStats = ref<TaskStats | null>(null)
const totalTasks = ref(0)
const pendingTasks = ref(0)
const completedTasks = ref(0)
const deletedTasks = ref(0)

// 配置相关
const showConfigDialog = ref(false)
const config = ref<Config>({
  dataPath: ''
})

// 加载配置
const loadConfig = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-config')
    config.value = result
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

// 选择数据路径
const handleSelectDataPath = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('select-data-path')
    if (result) {
      config.value = result
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
    await window.electron.ipcRenderer.invoke('clear-all-data')
    ElMessage.success('数据已清空')
    loadStats()
  } catch (error) {
    console.error('Failed to clear data:', error)
    ElMessage.error('清空数据失败')
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    // 加载各时间维度的统计
    const ranges = ['today', 'week', 'month', 'quarter', 'year']
    for (const range of ranges) {
      const result = await window.electron.ipcRenderer.invoke('get-range-tasks', range)
      switch (range) {
        case 'today':
          todayStats.value = result.stats
          break
        case 'week':
          weekStats.value = result.stats
          break
        case 'month':
          monthStats.value = result.stats
          break
        case 'quarter':
          quarterStats.value = result.stats
          break
        case 'year':
          yearStats.value = result.stats
          break
      }
    }

    // 加载总体统计
    const tasks = await window.electron.ipcRenderer.invoke('get-tasks')
    const deletedTasksList = await window.electron.ipcRenderer.invoke('get-deleted-tasks')
    
    totalTasks.value = tasks.length + deletedTasksList.length
    pendingTasks.value = tasks.filter((t: any) => !t.completed).length
    completedTasks.value = tasks.filter((t: any) => t.completed).length
    deletedTasks.value = deletedTasksList.length
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// 处理卡片点击
const handleCardClick = (range: string) => {
  router.push(`/tasks?range=${range}`)
}

onMounted(() => {
  loadStats()
  loadConfig()
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  
  .stat-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    
    .stat-content {
      text-align: center;
      padding: 10px;
      
      .stat-title {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        
        .el-icon {
          font-size: 16px;
        }
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--el-color-primary);
        
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
  }
  
  .config-card {
    @extend .stat-card;
    
    .config-info {
      margin-top: 10px;
      
      .config-path {
        font-size: 14px;
        color: var(--el-text-color-regular);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 10px;
      }
    }
    
    &:hover {
      border-color: var(--el-color-primary);
      
      .stat-title {
        color: var(--el-color-primary);
        
        .el-icon {
          color: var(--el-color-primary);
        }
      }
    }
  }
  
  .tasks-section {
    margin-top: 20px;
  }
}

:deep(.el-dialog) {
  .el-form-item {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
      
      .el-form-item__content {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style> 
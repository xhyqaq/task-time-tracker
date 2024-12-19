<template>
  <div class="settings-view">
    <el-card class="settings-container">
      <template #header>
        <div class="card-header">
          <h2>设置</h2>
        </div>
      </template>

      <el-form label-width="120px">
        <!-- 数据管理 -->
        <el-form-item label="数据管理">
          <div class="data-management">
            <div class="data-path">
              <span class="label">数据存储路径：</span>
              <el-input
                v-model="dataPath"
                readonly
                placeholder="点击选择按钮设置数据存储路径"
              >
                <template #append>
                  <el-button @click="handleSelectDataPath">
                    选择路径
                  </el-button>
                </template>
              </el-input>
            </div>
            <div class="data-actions">
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
          </div>
        </el-form-item>

        <!-- 快捷键设置 -->
        <el-form-item label="快捷键">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="快速添加任务">
              <el-tag>Command + I</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="选择任务">
              <el-tag>Command + 数字键(1-9)</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="任务导航">
              <el-tag>↑/↓ 方向键</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="完成/取消完成">
              <el-tag>Enter</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="删除任务">
              <el-tag>Delete/Backspace</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="查看任务详情">
              <el-tag>双击任务</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="恢复已删除任务">
              <el-tag>R</el-tag>
              <span class="description">（在回收站中）</span>
            </el-descriptions-item>
            <el-descriptions-item label="永久删除任务">
              <el-tag type="danger">Enter</el-tag>
              <span class="description">（在回收站中）</span>
            </el-descriptions-item>
            <el-descriptions-item label="关闭对话框">
              <el-tag>ESC</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <!-- 关于 -->
        <el-form-item label="关于">
          <p class="about-text">
            任务管理与时间追踪工具 v1.0.0
            <br>
            <small>基于 Electron + Vue 3 开发</small>
          </p>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 数据路径
const dataPath = ref('')

// 获取配置
const getConfig = async () => {
  try {
    const config = await window.electron.ipcRenderer.invoke('get-config')
    dataPath.value = config.dataPath
  } catch (error) {
    console.error('Failed to get config:', error)
    ElMessage.error('获取配置失败')
  }
}

// 选择数据路径
const handleSelectDataPath = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('select-data-path')
    if (result) {
      dataPath.value = result.dataPath
      ElMessage.success('数据存储路径已更新')
    }
  } catch (error) {
    console.error('Failed to select data path:', error)
    ElMessage.error('选择路径失败')
  }
}

// 导出数据
const handleExportData = () => {
  ElMessageBox.alert('即将支持数据导出功能', '功能开发中')
}

// 导入数据
const handleImportData = () => {
  ElMessageBox.alert('即将支持数据导入功能', '功能开发中')
}

// 清空数据
const handleClearData = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('clear-all-data')
    if (result.success) {
      ElMessage({
        type: 'success',
        message: `数据已清空，备份已保存至: ${result.backupPath}`,
        duration: 5000
      })
      
      // 更新配置信息
      getConfig()
    } else {
      throw new Error(result.error || '清空数据失败')
    }
  } catch (error) {
    console.error('Failed to clear data:', error)
    ElMessage.error(error.message || '清空数据失败')
  }
}

// 组件挂载时获取配置
onMounted(() => {
  getConfig()
})
</script>

<style lang="scss" scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;

  .settings-container {
    .card-header {
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }
  }

  .el-form {
    max-width: 600px;
    margin: 0 auto;
  }

  .data-management {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .data-path {
      display: flex;
      align-items: center;
      gap: 12px;

      .label {
        white-space: nowrap;
        color: var(--el-text-color-regular);
      }

      .el-input {
        flex: 1;
      }
    }

    .data-actions {
      display: flex;
      gap: 12px;
    }
  }

  .el-descriptions {
    margin: 10px 0;
  }

  .el-tag {
    margin-right: 8px;
  }

  .description {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .about-text {
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin: 0;

    small {
      color: var(--el-text-color-secondary);
    }
  }

  :deep(.el-form-item__content) {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style> 
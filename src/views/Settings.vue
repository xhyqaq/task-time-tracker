<template>
  <div class="settings-view">
    <el-card class="settings-container">
      <template #header>
        <div class="card-header">
          <h2>设置</h2>
        </div>
      </template>

      <el-form label-width="120px">
        <!-- 快捷键设置 -->
        <el-form-item label="快捷键">
          <el-descriptions :column="1" border>
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
              <el-tag>Command + D</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="恢复已删除任��">
              <el-tag>R</el-tag>
              <span class="description">（在回收站中）</span>
            </el-descriptions-item>
            <el-descriptions-item label="永久删除任务">
              <el-tag type="danger">Enter</el-tag>
              <span class="description">（在回收站中）</span>
            </el-descriptions-item>
            <el-descriptions-item label="关闭回收站">
              <el-tag>ESC</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <!-- 数据管理 -->
        <el-form-item label="数据管理">
          <el-button type="primary" @click="handleExportData">
            导出数据
          </el-button>
          <el-button type="warning" @click="handleImportData">
            导入数据
          </el-button>
          <el-button type="danger" @click="handleClearData">
            清空数据
          </el-button>
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
import { ElMessageBox } from 'element-plus'

// 导出数据
const handleExportData = () => {
  // TODO: 实现数据导出功能
  ElMessageBox.alert('即将支持数据导出功能', '功能开发中')
}

// 导入数据
const handleImportData = () => {
  // TODO: 实现数据导入功能
  ElMessageBox.alert('即将支持数据导入功能', '功能开发中')
}

// 清空数据
const handleClearData = () => {
  ElMessageBox.confirm(
    '此操作将清空所有数据，包括任务记录和统计信息，是否继续？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现数据清空功能
    ElMessageBox.alert('即将支持数据清空功能', '功能开发中')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.settings-view {
  padding: 20px;
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
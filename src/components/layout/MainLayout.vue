<template>
  <div class="main-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">Task Time Tracker</div>
          <div class="header-actions">
            <el-button
              type="primary"
              @click="handleSettingsClick"
            >
              <el-icon><Setting /></el-icon>
              <span style="margin-left: 5px">设置</span>
            </el-button>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Setting } from '@element-plus/icons-vue'

const router = useRouter()

const handleSettingsClick = () => {
  router.push('/settings')
}
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  background-color: var(--el-bg-color-page);
  
  .el-container {
    height: 100%;
  }
  
  .el-header {
    padding: 0;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    
    .header-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      
      .logo {
        font-size: 18px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
  
  .el-main {
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style> 
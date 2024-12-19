<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { onMounted, onBeforeMount, onBeforeUnmount, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

console.log('App component setup starting')

const router = useRouter()

onBeforeMount(() => {
  console.log('App component before mount')
  console.log('Router instance:', router)
})

onMounted(() => {
  console.log('App component mounted')
  console.log('Current route:', router.currentRoute.value)
  console.log('Router ready state:', router.isReady())
  console.log('Available routes:', router.getRoutes())
})

onBeforeUnmount(() => {
  console.log('App component before unmount')
})

onErrorCaptured((err, instance, info) => {
  console.error('Error captured in App component:', err)
  console.error('Error instance:', instance)
  console.error('Error info:', info)
  return false
})

console.log('App component setup complete')
</script>

<style>
/* Reset styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100vh;
}

/* App container */
.app-container {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
  background-color: var(--el-bg-color);
}

/* Element Plus theme customization */
:root {
  --el-color-primary: #409eff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-info: #909399;
  
  --el-border-radius-base: 4px;
  --el-font-size-base: 14px;
}

/* Global styles */
.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  transform: translateY(-2px);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--el-bg-color-page);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}
</style>

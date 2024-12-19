<template>
  <div class="dashboard">
    <h1>欢迎使用 Task Time Tracker</h1>
    <p>这是一个基于 Electron + Vue 3 的任务管理和时间追踪应用</p>
  </div>
</template>

<script setup lang="ts">
// 暂时不需要任何逻辑
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  text-align: center;
  
  h1 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 500;
  }
  
  p {
    color: var(--el-text-color-secondary);
  }
}
</style> 
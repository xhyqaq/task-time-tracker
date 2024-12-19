<template>
  <div class="main-layout">
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  background-color: var(--el-bg-color-page);
  
  .main-content {
    height: 100%;
    padding: 20px;
    overflow-y: auto;
  }
}
</style> 
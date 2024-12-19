import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

console.log('Vue application initialization starting...')
console.log('Environment:', {
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  BASE_URL: import.meta.env.BASE_URL,
})

try {
  // 创建应用实例
  console.log('Creating Vue application instance...')
  const app = createApp(App)
  console.log('Vue app instance created')

  console.log('Registering Element Plus icons...')
  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  console.log('Element Plus icons registered')

  console.log('Installing plugins...')
  // 使用插件
  try {
    console.log('Installing Element Plus...')
    app.use(ElementPlus)
    console.log('Element Plus installed')
    
    console.log('Installing Vue Router...')
    app.use(router)
    console.log('Vue Router installed')
    
    console.log('Installing Pinia...')
    app.use(createPinia())
    console.log('Pinia installed')
    
    console.log('All plugins installed successfully')
  } catch (error) {
    console.error('Failed to install plugins:', error)
  }

  console.log('Mounting application...')
  try {
    const rootElement = document.getElementById('app')
    if (!rootElement) {
      throw new Error('Root element #app not found')
    }
    console.log('Root element found:', rootElement)
    app.mount('#app')
    console.log('Vue application mounted successfully')
  } catch (error) {
    console.error('Failed to mount application:', error)
  }
} catch (error) {
  console.error('Failed to initialize Vue application:', error)
}

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Tasks from '../views/Tasks.vue'

console.log('Router configuration starting...')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tasks'
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

console.log('Creating router with routes:', routes)

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from) => {
  console.log('Route navigation:', { from: from.path, to: to.path })
  return true
})

// 全局解析守卫
router.beforeResolve(async (to) => {
  console.log('Route resolving:', to.path)
  return true
})

// 全局后置钩子
router.afterEach((to, from) => {
  console.log('Route navigation complete:', { from: from.path, to: to.path })
})

console.log('Router configuration complete')

export default router 
declare module './TaskItem.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    task: {
      type: Object
      required: true
    }
  }>
  export default component
} 
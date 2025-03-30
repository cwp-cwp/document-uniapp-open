import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
// 国际化
import { setupI18n } from './lang'
import legacy from './utils/plugin/legacy.js'

const pinia = createPinia()

export function createApp () {
  const app = createSSRApp(App)
  app.use(setupI18n)
  app.use(pinia)
  // #ifdef H5
  app.use(legacy)
  // #endif
  return {
    app
  }
}

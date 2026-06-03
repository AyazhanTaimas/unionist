import { createApp } from 'vue'
import App from './App.vue'
import { router } from '@/app/providers/router'
import { initI18n } from '@/app/i18n'
import { initStaticTranslations, scheduleStaticTranslations } from '@/app/i18n/staticText'
import './style.css'

initI18n()

createApp(App)
  .use(router)
  .mount('#app')

initStaticTranslations()
router.afterEach(() => {
  scheduleStaticTranslations()
})

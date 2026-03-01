import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './styles/theme.css'
import './styles/vuetify-overrides.css'
import { formatCurrency } from './utils/formatters.js'

import router from './router'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'

import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

app.config.globalProperties.$formatCurrency = formatCurrency

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

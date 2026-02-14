import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './styles/theme.css'
import router from './router'
import { createPinia } from 'pinia'

import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { es } from 'vuetify/locale'

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'es',
    fallback: 'en',
    messages: { es }
  }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
// plugins/vuetify.js

import { createVuetify } from 'vuetify'
import 'vuetify/styles'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { es } from 'vuetify/locale'

export default createVuetify({
  components,
  directives,

  locale: {
    locale: 'es',
    fallback: 'en',
    messages: { es }
  },

  theme: {
    defaultTheme: 'dark',

    themes: {

      light: {
        dark: false,
        colors: {
          primary: '#6366f1',
          secondary: '#06b6d4',
          accent: '#3b82f6',
          error: '#ef4444',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          background: '#f1f5f9',
          surface: '#ffffff',
        }
      },

      dark: {
        dark: true,
        colors: {
          primary: '#818cf8',
          secondary: '#22d3ee',
          accent: '#60a5fa',
          error: '#f87171',
          info: '#60a5fa',
          success: '#34d399',
          warning: '#fbbf24',
          background: '#020617',
          surface: '#0b1220',
        }
      }

    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('vuetify')) return 'vuetify'
          if (id.includes('vue-router')) return 'vue-router'
          if (id.includes('pinia')) return 'pinia'
          if (id.includes('axios')) return 'axios'
          if (id.includes('dayjs')) return 'dayjs'
          if (id.includes('vue')) return 'vue-core'

          return 'vendor'
        }
      }
    }
  }
})

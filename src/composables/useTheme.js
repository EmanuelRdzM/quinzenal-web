// composables/useTheme.js
import { ref, watch } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

const theme = ref(localStorage.getItem('theme') || 'light')

export function useTheme() {
  // Obtener el tema de Vuetify
  const vuetifyTheme = useVuetifyTheme()

  const applyTheme = () => {
    // 1. Aplicar tu clase CSS personalizada
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // 2. Aplicar el tema de Vuetify
    vuetifyTheme.global.name.value = theme.value

    // 3. Guardar en localStorage
    localStorage.setItem('theme', theme.value)
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  // Sincronizar tema inicial con Vuetify
  watch(theme, applyTheme, { immediate: true })

  return {
    theme,
    toggleTheme
  }
}
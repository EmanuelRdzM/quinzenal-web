<template>
  <div class="min-h-screen flex bg-[var(--color-background)] text-[var(--color-text)] transition-colors">
    <!-- Sidebar con estado de apertura/cierre -->
    <Sidebar 
      :is-open="isSidebarOpen"
      :is-mobile="isMobile"
      @close="closeSidebar"
      class="z-30"
    />

    <!-- Contenido principal -->
    <main class="flex-1 min-w-0 transition-all duration-300">
      <!-- Header con botones de control -->
      <header class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 lg:px-6 lg:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Botón hamburguesa para móvil -->
            <button 
              v-if="isMobile"
              @click="toggleSidebar"
              class="p-2 rounded-lg hover:bg-[var(--color-background)] transition-colors"
              aria-label="Toggle menu"
            >
              <v-icon size="24" >mdi-menu</v-icon>
            </button>
            
            <!-- Botón para colapsar/expandir en desktop -->
            <button 
              v-else
              @click="toggleSidebar"
              class="p-2 rounded-lg hover:bg-[var(--color-background)] transition-colors hidden lg:block"
              :title="isSidebarOpen ? 'Colapsar menú' : 'Expandir menú'"
            >
              <v-icon size="24" >{{ isSidebarOpen ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
            </button>

            <h1 class="text-xl lg:text-2xl font-semibold truncate">
              Mi Control Quincenal
            </h1>
          </div>

          <!-- Botón de tema mejorado -->
          <button 
            class="theme-toggle group relative p-2 rounded-xl overflow-hidden transition-all duration-300"
            :style="themeToggleStyle"
            @click="toggleTheme"
            :aria-label="`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`"
          >
            <!-- Efecto de fondo animado -->
            <span 
              class="theme-toggle-glow absolute inset-0 rounded-xl transition-transform duration-500 scale-0 group-hover:scale-110"
              :style="themeGlowStyle"
            ></span>

            <!-- Iconos con animación -->
            <div class="relative flex items-center gap-2">
              <div class="relative w-6 h-6">
                <!-- Icono sol (modo oscuro) -->
                <v-icon 
                  name="mdi-weather-sunny"
                  size="20"
                  class="absolute inset-0 transition-all duration-500"
                  :class="theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'"
                  color="warning"
                />
                <!-- Icono luna (modo claro) -->
                <v-icon 
                  name="mdi-weather-night"
                  size="20"
                  class="absolute inset-0 transition-all duration-500"
                  :class="theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'"
                  color="primary"
                />
              </div>
              
              <!-- Texto con efecto slide -->
              <span 
                class="hidden sm:inline-block text-sm font-medium transition-all duration-300"
                :style="{ color: 'var(--color-primary)' }"
              >
                <span class="relative overflow-hidden">
                  <span 
                    class="inline-block transition-transform duration-300"
                    :class="theme === 'dark' ? 'translate-y-0' : '-translate-y-full'"
                  >
                    Modo claro
                  </span>
                  <span 
                    class="absolute left-0 top-0 inline-block transition-transform duration-300"
                    :class="theme === 'light' ? 'translate-y-0' : 'translate-y-full'"
                  >
                    Modo oscuro
                  </span>
                </span>
              </span>
            </div>

            <!-- Tooltip para móvil -->
            <span class="sr-only">
              Cambiar a modo {{ theme === 'dark' ? 'claro' : 'oscuro' }}
            </span>
          </button>
        </div>

        <!-- Breadcrumb opcional para mejor navegación -->
        <div v-if="route.path !== '/dashboard'" class="mt-2 text-sm text-[var(--color-text)]/60">
          <span class="cursor-pointer hover:text-[var(--color-primary)]" @click="router.push('/dashboard')">Inicio</span>
          <span class="mx-2">/</span>
          <span class="font-medium">{{ currentPageName }}</span>
        </div>
      </header>

      <!-- Contenido principal con padding responsivo -->
      <div class="p-4 lg:p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import { RouterView } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useAppearance } from '../composables/useAppearance'

const route = useRoute()
const router = useRouter()
const { theme, toggleTheme } = useTheme()
useAppearance()

const themeToggleStyle = computed(() => ({
  backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
}))

const themeGlowStyle = computed(() => ({
  background: 'linear-gradient(120deg, color-mix(in srgb, var(--color-primary) 28%, transparent), color-mix(in srgb, var(--color-secondary) 24%, transparent))'
}))

const isSidebarOpen = ref(true)
const isMobile = ref(false)

// Detectar si es móvil
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    isSidebarOpen.value = false
  } else {
    // En desktop, restaurar estado guardado o abrir por defecto
    const savedState = localStorage.getItem('sidebarOpen')
    isSidebarOpen.value = savedState !== null ? savedState === 'true' : true
  }
}

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  if (!isMobile.value) {
    localStorage.setItem('sidebarOpen', isSidebarOpen.value)
  }
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Obtener nombre de la página actual para breadcrumb
const currentPageName = computed(() => {
  const names = {
    '/dashboard': 'Dashboard',
    '/balance': 'Registro quincenal',
    '/cards': 'Mis tarjetas',
    '/debts': 'Control de deudas',
    '/credits': 'Control de créditos',
    '/settings': 'Configuracion'
  }
  return names[route.path] || 'Detalle'
})

// Event listeners para responsive
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('resize', checkMobile)
})

// Evita scroll del contenido al abrir el menú completo en móvil.
watch([isMobile, isSidebarOpen], ([mobile, open]) => {
  document.body.style.overflow = mobile && open ? 'hidden' : ''
})
</script>

<style scoped>
.theme-toggle {
  position: relative;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:active {
  transform: scale(0.95);
}

/* Animación de pulso suave al hacer hover */
@keyframes softPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.theme-toggle:hover .theme-toggle-glow {
  animation: softPulse 2s infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .theme-toggle {
    padding: 0.5rem;
  }
}
</style>
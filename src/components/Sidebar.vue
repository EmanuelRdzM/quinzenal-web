<template>
  <aside :class="sidebarClasses">
    <nav
      class="min-h-full border-r py-6 overflow-y-auto"
      :class="showLabels ? 'px-4' : 'px-3'"
      :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }"
    >
      <div class="mb-6" :class="showLabels ? '' : 'text-center'">
        <div class="text-lg font-bold" :class="showLabels ? '' : 'text-sm'">
          {{ showLabels ? 'Menú' : 'MC' }}
        </div>
        <div v-if="showLabels" class="text-sm text-[var(--color-text)]/70">Selecciona un módulo</div>
      </div>

      <button
        v-if="isMobile"
        class="mb-4 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors"
        @click="emit('close')"
      >
        <v-icon name="mdi-close" size="18" />
        Cerrar menú
      </button>

      <ul class="space-y-1">
        <li v-for="item in items" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center rounded-md hover:bg-[var(--color-background)] transition-colors"
            :class="[
              isActive(item.to) ? 'font-semibold bg-[var(--color-background)]' : '',
              showLabels ? 'gap-3 px-3 py-2 justify-start' : 'justify-center px-2 py-2'
            ]"
            @click="handleNavigate"
          >
            <v-icon :name="item.icon" size="20" />
            <span v-if="showLabels">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>

    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const route = useRoute()

const showLabels = computed(() => props.isMobile || props.isOpen)

const sidebarClasses = computed(() => {
  if (props.isMobile) {
    return [
      'fixed inset-0 h-screen w-screen transition-transform duration-300 ease-out',
      props.isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
    ]
  }

  return [
    'sticky top-0 h-screen shrink-0 transition-all duration-300 ease-out',
    props.isOpen ? 'w-72' : 'w-20'
  ]
})

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
  { to: '/balance', label: 'Registro quincenal', icon: 'mdi-calendar-edit' },
  { to: '/cards', label: 'Mis tarjetas', icon: 'mdi-credit-card-outline' },
  { to: '/debts', label: 'Control de deudas', icon: 'mdi-hand-coin-outline' },
  { to: '/credits', label: 'Control de creditos', icon: 'mdi-cash-fast' }
]

function handleNavigate() {
  if (props.isMobile) {
    emit('close')
  }
}

function isActive(to) {
  if (to === '/dashboard') return route.path === '/dashboard'
  if (to === '/debts') return route.path === '/debts' || route.path.startsWith('/debts/') || route.path.startsWith('/people/')
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<style scoped>
aside {
  z-index: 30;
}
</style>

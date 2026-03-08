<template>
  <aside :class="sidebarClasses">
    <button
      v-if="isMobile && isOpen"
      class="absolute inset-0 backdrop-blur-[2px]"
      :style="{ backgroundColor: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }"
      aria-label="Cerrar menú"
      @click="emit('close')"
    />

    <nav
      class="relative min-h-full border-r overflow-y-auto shadow-[var(--shadow-md)]"
      :class="[
        isMobile ? 'h-full w-[86%] max-w-[320px] py-5' : 'py-6',
        showLabels ? 'px-4' : 'px-3'
      ]"
      :style="{ borderColor: 'var(--color-border)', background: 'var(--gradient-surface)' }"
    >
      <div
        class="mb-7 rounded-2xl border p-3"
        :class="showLabels ? '' : 'text-center px-2 py-3'
        "
        :style="{
          borderColor: 'var(--color-border)',
          backgroundColor: 'color-mix(in srgb, var(--color-surface) 70%, transparent)'
        }"
      >
        <div class="flex items-center" :class="showLabels ? 'gap-3' : 'justify-center'">
          <div class="brand-mark" />
          <div v-if="showLabels" class="min-w-0">
            <div class="text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Quinzenal</div>
            <div class="text-base font-semibold leading-tight">CashFlow</div>
          </div>
        </div>

        <div v-if="!showLabels" class="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
          CF
        </div>

        <div v-if="showLabels" class="mt-3 px-1 text-sm text-[var(--color-text)]/70">
          Selecciona un módulo
        </div>
      </div>

      <button
        v-if="isMobile"
        class="mb-4 w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors"
        @click="emit('close')"
      >
        <v-icon size="18">mdi-close</v-icon>
        Cerrar menú
      </button>

      <ul class="space-y-2.5">
        <li v-for="item in items" :key="item.to" class="my-4">
          <RouterLink
            :to="item.to"
            class="group flex items-center rounded-xl transition-all duration-200"
            :class="getItemClasses(item.to)"
            @click="handleNavigate"
          >
            <span
              class="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-200"
              :class="isActive(item.to)
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text)]/80 group-hover:bg-[var(--color-background)]'"
            >
              <v-icon size="20">{{ item.icon }}</v-icon>
            </span>

            <span
              v-if="showLabels"
              class="truncate text-sm"
              :class="isActive(item.to) ? 'font-semibold' : 'font-medium'"
            >
              {{ item.label }}
            </span>

            <span
              v-if="showLabels && isActive(item.to)"
              class="ml-auto mr-4 h-2 w-2 rounded-full bg-[var(--color-primary)]"
            ></span>
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
  { to: '/credits', label: 'Control de creditos', icon: 'mdi-cash-fast' },
  { to: '/settings', label: 'Configuracion', icon: 'mdi-cog-outline' }
]

function handleNavigate() {
  if (props.isMobile) {
    emit('close')
  }
}

function getItemClasses(to) {
  const active = isActive(to)
  const layoutClasses = showLabels.value ? 'gap-3 px-2.5 py-2.5 justify-start' : 'justify-center px-1.5 py-2.5'

  if (active) {
    return `${layoutClasses} bg-[var(--color-background)] ring-1 ring-[var(--color-border)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]`
  }

  return `${layoutClasses} text-[var(--color-text)]/85 hover:bg-[var(--color-background)] hover:text-[var(--color-text)]`
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

.brand-mark {
  height: 2.1rem;
  width: 2.1rem;
  border-radius: 0.75rem;
  background: var(--gradient-primary);
  box-shadow: var(--shadow-glow);
}
</style>

<template>
  <nav class="h-full px-4 py-6 border-r" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }">
    <div class="mb-6">
      <div class="text-lg font-bold">Menú</div>
      <div class="text-sm text-[var(--color-text)]/70">Selecciona un módulo</div>
    </div>

    <ul class="space-y-1">
      <li v-for="item in items" :key="item.to">
        <RouterLink
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-background)]"
          :class="{'font-semibold bg-[var(--color-background)]': isActive(item.to)}"
        >
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="mt-8 text-xs text-[var(--color-text)]/60">
      Versión local — sin sincronizar
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/balance', label: 'Registro quincenal' },
  { to: '/cards', label: 'Mis tarjetas' },
  { to: '/debts', label: 'Control de deudas' },
  { to: '/credits', label: 'Control de créditos' }
]

function isActive(to) {
  if (to === '/dashboard') return route.path === '/dashboard'
  if (to === '/debts') return route.path === '/debts' || route.path.startsWith('/debts/') || route.path.startsWith('/people/')
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<style scoped>
nav {
  min-height: 100vh;
}
</style>

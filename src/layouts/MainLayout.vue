<template>
  <div class="min-h-screen flex bg-[var(--color-background)] text-[var(--color-text)] transition-colors">
    <Sidebar class="w-72 shrink-0" />
    <main class="flex-1 p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">Mi Control Quincenal</h1>
        <div class="flex items-center gap-3">
          <button class="button" @click="toggleTheme">
            Cambiar a {{ theme === 'dark' ? 'claro' : 'oscuro' }}
          </button>
        </div>
      </div>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
import { RouterView } from 'vue-router'
import { useTheme } from '../composables/useTheme'
const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
/* Keep scoped minimal — global colors come from theme.css */
</style>

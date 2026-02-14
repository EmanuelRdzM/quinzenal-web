<script setup>
import { useTheme } from './composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <div>

    <button class="button" @click="toggleTheme">
      Cambiar a {{ theme === 'dark' ? 'claro' : 'oscuro' }}
    </button>

    <div class="card" style="margin-top:20px;">
      Esto es una card adaptada al tema
    </div>

  </div>
</template>
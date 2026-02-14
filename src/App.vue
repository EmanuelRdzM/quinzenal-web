<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="p-10">
    <h1 class="text-4xl font-bold text-blue-500">
      Tailwind funcionando 🚀
    </h1>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

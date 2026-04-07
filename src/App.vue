<template>
  <RouterView v-if="isNotFoundRoute" />
  <MainLayout v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'

const route = useRoute()

const isNotFoundRoute = computed(() => route.name === 'not-found')
</script>

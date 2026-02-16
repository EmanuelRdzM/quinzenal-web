<!-- src/components/cards/CardFilters.vue -->
<template>
  <div class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2">
    <div style="min-width: 250px;">
      <v-text-field
        v-model="searchQuery"
        label="Buscar concepto / descripción"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        @update:model-value="$emit('update:search', $event)"
      />
    </div>

    <div class="d-flex ga-2 align-center flex-wrap">
      <v-text-field
        :model-value="fromDate"
        label="Desde"
        type="date"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="$emit('update:from-date', $event)"
      />

      <v-text-field
        :model-value="toDate"
        label="Hasta"
        type="date"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="$emit('update:to-date', $event)"
      />

      <v-btn
        icon="mdi-backspace"
        variant="text"
        size="small"
        @click="$emit('clear-dates')"
        title="Limpiar fechas"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  search: { type: String, default: '' },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' }
})

defineEmits(['update:search', 'update:from-date', 'update:to-date', 'clear-dates'])

const searchQuery = ref(props.search)

// Debounce simple para búsqueda
watch(searchQuery, (val) => {
  const handler = setTimeout(() => {
    emit('update:search', val)
  }, 300)
  
  return () => clearTimeout(handler)
})
</script>
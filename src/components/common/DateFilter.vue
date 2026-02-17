<!-- src/components/common/DateFilter.vue -->
<template>
  <div class="d-flex ga-3 align-center flex-wrap">
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
      @click="$emit('clear')"
      title="Limpiar fechas"
    />
  </div>
</template>

<script setup>
defineProps({
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' }
})

defineEmits(['update:from-date', 'update:to-date', 'clear'])
</script>
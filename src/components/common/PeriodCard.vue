<template>
  <v-card class="mb-6">
    <v-card-text>
      <div class="d-flex align-center justify-space-between flex-wrap gap-4">
        <h2 class="text-h6 font-weight-semibold">Periodo</h2>
        <div class="d-flex gap-2 align-center flex-wrap">
          <v-select
            :model-value="selectedPeriodId"
            :items="periods"
            item-title="label"
            item-value="id"
            :disabled="!periods.length"
            :placeholder="!periods.length ? 'No hay periodos disponibles' : 'Seleccionar periodo'"
            density="compact"
            variant="outlined"
            hide-details
            class="period-select"
            @update:model-value="$emit('update:selected', $event)"
          >
            <template v-if="!periods.length" #prepend-item>
              <v-list-item disabled>No hay periodos disponibles</v-list-item>
            </template>
          </v-select>

          <v-btn
            icon
            variant="text"
            @click="$emit('refresh')"
            :title="'Refrescar datos'"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-plus"
            @click="$emit('open-create-modal')"
          >
            Nuevo periodo
          </v-btn>
        </div>
      </div>
      <div class="mt-3 text-caption text-medium-emphasis d-flex align-center ga-1">
        <v-icon size="small">mdi-information</v-icon>
        Si no existe un periodo para hoy, puedes crearlo
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  periods: { type: Array, default: () => [] },
  selectedPeriodId: { type: [String, Number], default: null }
})

defineEmits(['update:selected', 'refresh', 'open-create-modal'])
</script>

<style scoped>
.period-select {
  min-width: 240px;
}
</style>
<!-- src/components/debts/DebtMovementsTimeline.vue -->
<template>
  <div v-if="loading" class="text-center pa-8">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <v-timeline
    v-else-if="movements.length"
    side="end"
    align="start"
    density="compact"
    line-inset="12"
  >
    <v-timeline-item
      v-for="movement in movements"
      :key="movement.id"
      :dot-color="movement.type === 'payment' ? 'success' : 'warning'"
      size="small"
    >
      <template v-slot:opposite>
        <span class="text-caption text-medium-emphasis">
          {{ formatDate(movement.date) }}
        </span>
      </template>

      <v-card class="movement-card" variant="outlined" hover>
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-3">
              <v-avatar
                :color="movement.type === 'payment' ? 'success' : 'warning'"
                size="32"
                rounded="lg"
              >
                <v-icon size="20" color="white">
                  {{ movement.type === 'payment' ? 'mdi-cash-check' : 'mdi-cash-plus' }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="d-flex align-center ga-2">
                  <span class="font-weight-medium">
                    {{ movement.type === 'payment' ? 'Pago' : 'Préstamo' }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="movement.type === 'payment' ? 'success' : 'warning'"
                    variant="tonal"
                  >
                    {{ $formatCurrency(movement.amount) }}
                  </v-chip>
                </div>
                <div v-if="movement.notes" class="text-caption text-medium-emphasis">
                  {{ movement.notes }}
                </div>
              </div>
            </div>

            <div class="d-flex ga-1">
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                variant="text"
                @click="$emit('edit', movement)"
              />
              <v-btn
                icon="mdi-delete"
                size="x-small"
                variant="text"
                color="error"
                @click="$emit('delete', movement)"
              />
            </div>
          </div>
        </v-card-item>
      </v-card>
    </v-timeline-item>
  </v-timeline>

  <v-card v-else variant="outlined" class="text-center pa-8">
    <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-history</v-icon>
    <h3 class="text-h6 mb-2">No hay movimientos</h3>
    <p class="text-medium-emphasis">Agrega el primer movimiento para esta deuda</p>
  </v-card>
</template>

<script setup>
defineProps({
  movements: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete'])

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.movement-card {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  transition: all 0.2s;
}

.movement-card:hover {
  transform: translateX(4px);
  border-color: var(--color-primary) !important;
}
</style>
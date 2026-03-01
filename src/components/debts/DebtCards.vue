<!-- src/components/debts/DebtCards.vue -->
<template>
  <div v-if="loading" class="text-center pa-8">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <v-row v-else-if="debts.length">
    <v-col
      v-for="debt in debts"
      :key="debt.id"
      cols="12"
      md="6"
    >
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          v-bind="props"
          class="debt-card"
          :class="{ 'debt-card-active': (debt.balance || 0) > 0 }"
          :elevation="isHovering ? 6 : 2"
          @click="$emit('open', debt.debtId || debt.id)"
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar
                :color="debt.type === 'loan' ? 'warning' : 'info'"
                size="48"
                rounded="lg"
              >
                <v-icon color="white" size="28">
                  {{ debt.type === 'loan' ? 'mdi-hand-coin' : 'mdi-home-city' }}
                </v-icon>
              </v-avatar>
            </template>

            <v-card-title class="text-h6 font-weight-bold">
              {{ debt.description || 'Sin descripción' }}
            </v-card-title>

            <v-card-subtitle>
              <v-chip
                size="small"
                :color="debt.type === 'loan' ? 'warning' : 'info'"
                variant="tonal"
              >
                {{ debt.type === 'loan' ? 'Préstamo' : 'Renta' }}
              </v-chip>
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-row>
              <v-col cols="4" class="text-center">
                <div class="text-caption text-medium-emphasis">Prestado</div>
                <div class="text-subtitle-1 font-weight-bold text-success">
                  {{ $formatCurrency(debt.totalLend) }}
                </div>
              </v-col>
              <v-col cols="4" class="text-center">
                <div class="text-caption text-medium-emphasis">Pagado</div>
                <div class="text-subtitle-1 font-weight-bold text-info">
                  {{ $formatCurrency(debt.totalPayment) }}
                </div>
              </v-col>
              <v-col cols="4" class="text-center">
                <div class="text-caption text-medium-emphasis">Saldo</div>
                <div 
                  class="text-subtitle-1 font-weight-bold"
                  :class="(debt.balance || 0) >= 0 ? 'text-success' : 'text-error'"
                >
                  {{ $formatCurrency(debt.balance) }}
                </div>
              </v-col>
            </v-row>

            <!-- Barra de progreso de pago -->
            <div class="mt-3">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Progreso de pago</span>
                <span>{{ calculateProgress(debt) }}%</span>
              </div>
              <v-progress-linear
                :model-value="calculateProgress(debt)"
                :color="debt.type === 'loan' ? 'warning' : 'info'"
                height="8"
                rounded
              />
            </div>
          </v-card-text>

          <v-card-actions class="justify-end pa-4 pt-0">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click.stop="$emit('edit', debt)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="$emit('delete', debt)"
            />
          </v-card-actions>
        </v-card>
      </v-hover>
    </v-col>
  </v-row>

  <!-- Empty state -->
  <v-card v-else variant="outlined" class="text-center pa-8">
    <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-file-document-outline</v-icon>
    <h3 class="text-h6 mb-2">No hay deudas</h3>
    <p class="text-medium-emphasis mb-4">Crea una nueva deuda para comenzar</p>
  </v-card>
</template>

<script setup>
defineProps({
  debts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['open', 'edit', 'delete'])

const calculateProgress = (debt) => {
  if (!debt.totalLend) return 0
  return Math.min(Math.round((debt.totalPayment / debt.totalLend) * 100), 100)
}
</script>

<style scoped>
.debt-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.debt-card-active {
  border-left: 4px solid var(--color-primary) !important;
}

.debt-card:hover {
  transform: translateY(-2px);
}

:deep(.v-progress-linear) {
  background-color: var(--color-surface-alt) !important;
}
</style>
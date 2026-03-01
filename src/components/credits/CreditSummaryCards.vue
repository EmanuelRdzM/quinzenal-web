<!-- src/components/credits/CreditSummaryCards.vue -->
<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">
            Total pagado
          </div>
          <div class="text-h5 font-weight-bold text-success">
            {{ $formatCurrency(summary?.totalPaid) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Pagos realizados: {{ summary?.paymentsMadeCount || 0 }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">
            Restante
          </div>
          <div class="text-h5 font-weight-bold" :class="(summary?.remaining || 0) > 0 ? 'text-warning' : 'text-success'">
            {{ $formatCurrency(summary?.remaining) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Siguiente pago sugerido: #{{ summary?.nextPaymentNumber || 1 }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">
            Estado
          </div>
          <div class="text-h5 font-weight-bold">
            <v-chip
              :color="isPaid ? 'success' : 'info'"
              size="large"
              variant="tonal"
            >
              {{ isPaid ? 'Pagado' : 'En progreso' }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ summary?.paymentsMadeCount || 0 }} de {{ summary?.months || 0 }} pagos
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: { type: Object, default: () => ({}) }
})

const isPaid = computed(() => 
  (props.summary?.paymentsMadeCount || 0) >= (props.summary?.months || 0)
)
</script>

<style scoped>
.summary-card {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md) !important;
}
</style>
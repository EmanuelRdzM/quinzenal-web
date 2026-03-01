<!-- src/components/debts/DebtHeader.vue -->
<template>
  <v-row align="center" justify="space-between" no-gutters>
    <div>
      <h2 class="text-h6">Deuda: {{ description || ('#' + debtId) }}</h2>
      <div class="text-subtitle-2 text-medium-emphasis">
        <span class="mx-1">Prestado <span class="text-success font-weight-medium">{{ $formatCurrency(summary?.totalLend) }}</span></span>
        ·
        <span class="mx-1">Pagado <span class="text-info font-weight-medium">{{ $formatCurrency(summary?.totalPayment) }}</span></span>
        ·
        <span class="mx-1">Saldo 
          <span 
            class="font-weight-medium"
            :class="(summary?.balance || 0) >= 0 ? 'text-success' : 'text-error'"
          >
            {{ $formatCurrency(summary?.balance) }}
          </span>
        </span>
      </div>
    </div>

    <div class="d-flex ga-3">
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="$emit('new-movement')"
      >
        Nuevo movimiento
      </v-btn>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        @click="$emit('back')"
      >
        Volver
      </v-btn>
    </div>
  </v-row>
</template>

<script setup>
defineProps({
  debtId: { type: [String, Number], required: true },
  description: { type: String, default: '' },
  summary: { type: Object, default: () => ({}) }
})

defineEmits(['new-movement', 'back'])
</script>
<!-- src/components/debts/PersonHeader.vue -->
<template>
  <v-row align="center" justify="space-between" no-gutters>
    <div>
      <h2 class="text-h6">{{ personName || 'Persona' }}</h2>
      <div class="text-subtitle-2 text-medium-emphasis">
        Totales: 
        <span class="mx-1">Prestado <span class="text-success font-weight-medium">{{ $formatCurrency(totals?.totalLend) }}</span></span>
        ·
        <span class="mx-1">Cobrado <span class="text-info font-weight-medium">{{ $formatCurrency(totals?.totalPayment) }}</span></span>
        ·
        <span class="mx-1">Saldo 
          <span 
            class="font-weight-medium"
            :class="(totals?.totalBalance || 0) >= 0 ? 'text-success' : 'text-error'"
          >
            {{ $formatCurrency(totals?.totalBalance) }}
          </span>
        </span>
      </div>
    </div>

    <div class="d-flex ga-3">
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="$emit('new-debt')"
      >
        Nueva deuda
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
  personName: { type: String, default: '' },
  totals: { type: Object, default: () => ({}) }
})

defineEmits(['new-debt', 'back'])
</script>
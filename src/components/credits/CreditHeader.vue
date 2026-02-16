<!-- src/components/credits/CreditHeader.vue -->
<template>
  <v-row align="center" justify="space-between" no-gutters>
    <div>
      <h2 class="text-h6">{{ creditName || ('Crédito #' + creditId) }}</h2>
      <div class="text-subtitle-2 text-medium-emphasis">
        <span class="mx-1">Total <span class="font-weight-medium">${{ formatNumber(summary?.totalAmount) }}</span></span>
        ·
        <span class="mx-1">Meses <span class="font-weight-medium">{{ summary?.months }}</span></span>
        ·
        <span class="mx-1">Pago mensual <span class="font-weight-medium">${{ formatNumber(summary?.monthlyAmount) }}</span></span>
      </div>
    </div>

    <div class="d-flex ga-3">
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="$emit('new-payment')"
      >
        Registrar pago
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
  creditId: { type: [String, Number], required: true },
  creditName: { type: String, default: '' },
  summary: { type: Object, default: () => ({}) }
})

defineEmits(['new-payment', 'back'])

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}
</script>
<!-- src/components/cards/CardDetailHeader.vue -->
<template>
  <v-row align="center" justify="space-between" no-gutters>
    <div>
      <h2 class="text-h6">{{ cardName }}</h2>
      <div class="text-subtitle-2 text-medium-emphasis">
        Saldo actual: 
        <strong :class="balanceClass">
          {{ $formatCurrency(balance) }}
        </strong>
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
import { computed } from 'vue'

const props = defineProps({
  cardName: { type: String, default: 'Tarjeta' },
  balance: { type: Number, default: 0 }
})

defineEmits(['new-movement', 'back'])

const balanceClass = computed(() => 
  props.balance >= 0 ? 'text-success' : 'text-error'
)
</script>
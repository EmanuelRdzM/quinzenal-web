<!-- src/components/cards/CardSummaryCards.vue -->
<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">
            Saldo inicial
          </div>
          <div class="text-h5 font-weight-bold">
            {{ $formatCurrency(summary?.initialBalance) }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">
            Ingresos
          </div>
          <div class="text-h5 font-weight-bold text-success">
            {{ $formatCurrency(summary?.totalIncome) }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">
            Egresos
          </div>
          <div class="text-h5 font-weight-bold text-error">
            {{ $formatCurrency(summary?.totalExpense) }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
  summary: { type: Object, default: null }
})
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
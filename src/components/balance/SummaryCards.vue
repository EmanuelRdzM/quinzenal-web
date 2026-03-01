<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-2">Ingresos totales</div>
          <div class="text-h4 text-success mb-2">
            {{ $formatCurrency(summary?.totalIncome) }}
          </div>
          <div class="d-flex flex-column ga-1 text-caption">
            <div class="d-flex align-center ga-1">
              <v-icon size="small" color="success">mdi-circle</v-icon>
              <span>Efectivo: {{ $formatCurrency(summary?.incomeCash) }}</span>
            </div>
            <div class="d-flex align-center ga-1">
              <v-icon size="small" color="info">mdi-circle</v-icon>
              <span>Tarjeta: {{ $formatCurrency(summary?.incomeCard) }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-2">Gastos totales</div>
          <div class="text-h4 text-error mb-2">
            {{ $formatCurrency(summary?.totalExpense) }}
          </div>
          <div class="d-flex flex-column ga-1 text-caption">
            <div class="d-flex align-center ga-1">
              <v-icon size="small" color="error">mdi-circle</v-icon>
              <span>Efectivo: {{ $formatCurrency(summary?.expenseCash) }}</span>
            </div>
            <div class="d-flex align-center ga-1">
              <v-icon size="small" color="warning">mdi-circle</v-icon>
              <span>Tarjeta: {{ $formatCurrency(summary?.expenseCard) }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card variant="outlined" class="summary-card" hover>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-2">Balance</div>
          <div 
            class="text-h4 mb-2"
            :class="(summary?.balanceTotal || 0) >= 0 ? 'text-success' : 'text-error'"
          >
            {{ $formatCurrency(summary?.balanceTotal) }}
          </div>
          <div class="d-flex flex-column ga-1 text-caption">
            <div class="d-flex align-center ga-1">
              <v-icon 
                size="small" 
                :color="(summary?.balanceCash || 0) >= 0 ? 'success' : 'error'"
              >mdi-circle</v-icon>
              <span>Efectivo: {{ $formatCurrency(summary?.balanceCash) }}</span>
            </div>
            <div class="d-flex align-center ga-1">
              <v-icon 
                size="small" 
                :color="(summary?.balanceCard || 0) >= 0 ? 'success' : 'error'"
              >mdi-circle</v-icon>
              <span>Tarjeta: {{ $formatCurrency(summary?.balanceCard) }}</span>
            </div>
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
  transition: transform 0.2s, box-shadow 0.2s;
}
.summary-card:hover {
  transform: translateY(-2px);
}
</style>
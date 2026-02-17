<!-- src/components/credits/CreditPaymentsTable.vue -->
<template>
  <v-data-table
    :items="payments"
    :headers="headers"
    :loading="loading"
    dense
    item-key="id"
    class="elevation-0 payments-table"
  >
    <template #item.paymentNumber="{ item }">
      <v-chip size="small" color="info" variant="tonal">
        #{{ item.paymentNumber }}
      </v-chip>
    </template>

    <template #item.date="{ item }">
      {{ formatDate(item.date) }}
    </template>

    <template #item.amount="{ item }">
      <span class="font-weight-medium text-success">
        ${{ formatNumber(item.amount) }}
      </span>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex justify-center ga-1">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="$emit('edit', item)"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="$emit('delete', item)"
        />
      </div>
    </template>

    <template #no-data>
      <div class="text-subtitle-2 text-medium-emphasis pa-4">
        No hay pagos registrados.
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
const headers = [
  { title: 'Pago #', key: 'paymentNumber', align: 'center', sortable: true },
  { title: 'Fecha', key: 'date', sortable: true },
  { title: 'Monto', key: 'amount', align: 'end', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

defineProps({
  payments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete'])

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.payments-table {
  background-color: var(--color-surface) !important;
}
</style>
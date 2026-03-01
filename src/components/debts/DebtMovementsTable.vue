<!-- src/components/debts/DebtMovementsTable.vue -->
<template>
  <v-data-table
    :items="movements"
    :headers="headers"
    :loading="loading"
    hide-default-footer
    items-per-page="-1"
    dense
    item-key="id"
    class="elevation-0 movements-table"
  >
    <template #item.date="{ item }">
      {{ formatDate(item.date) }}
    </template>

    <template #item.type="{ item }">
      <v-chip
        size="small"
        :color="item.type === 'payment' ? 'success' : 'warning'"
        variant="tonal"
      >
        {{ item.type === 'payment' ? 'Pago' : 'Préstamo' }}
      </v-chip>
    </template>

    <template #item.amount="{ item }">
      <span
        class="font-weight-medium"
        :class="item.type === 'payment' ? 'text-success' : 'text-warning'"
      >
        {{ $formatCurrency(item.amount) }}
      </span>
    </template>

    <template #item.notes="{ item }">
      <span class="text-medium-emphasis">
        {{ item.notes || '-' }}
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
        No hay movimientos registrados.
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
const headers = [
  { title: 'Fecha', key: 'date', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Monto', key: 'amount', align: 'end', sortable: true },
  { title: 'Notas', key: 'notes', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

defineProps({
  movements: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete'])

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.movements-table {
  background-color: var(--color-surface) !important;
}
</style>
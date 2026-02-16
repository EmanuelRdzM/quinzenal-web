<!-- src/components/cards/CardMovementsTable.vue -->
<template>
  <v-data-table
    :items="movements"
    :headers="headers"
    :loading="loading"
    :items-per-page="-1"
    hide-default-footer
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
        :color="item.type === 'income' ? 'success' : 'error'"
        variant="tonal"
      >
        {{ item.type === 'income' ? 'Ingreso' : 'Egreso' }}
      </v-chip>
    </template>

    <template #item.amount="{ item }">
      <span
        class="font-weight-medium"
        :class="item.type === 'income' ? 'text-success' : 'text-error'"
      >
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
        No hay movimientos para los filtros actuales.
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
const headers = [
  { title: 'Fecha', key: 'date', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Concepto', key: 'concept', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Monto', key: 'amount', align: 'end', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

defineProps({
  movements: { type: Array, default: () => [] },
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
.movements-table {
  background-color: var(--color-surface) !important;
}
</style>
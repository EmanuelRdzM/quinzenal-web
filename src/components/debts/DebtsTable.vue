<!-- src/components/debts/DebtsTable.vue -->
<template>
  <v-data-table
    :items="debts"
    :headers="headers"
    :loading="loading"
    :items-per-page="-1"
    hide-default-footer
    dense
    item-key="id"
    class="elevation-0 debts-table"
  >
    <template #item.type="{ item }">
      <v-chip
        size="small"
        :color="item.type === 'loan' ? 'warning' : 'info'"
        variant="tonal"
      >
        {{ item.type === 'loan' ? 'Préstamo' : 'Renta' }}
      </v-chip>
    </template>

    <template #item.totalLend="{ item }">
      {{ $formatCurrency(item.totalLend) }}
    </template>

    <template #item.totalPayment="{ item }">
      {{ $formatCurrency(item.totalPayment) }}
    </template>

    <template #item.balance="{ item }">
      <strong
        :class="(item.balance || 0) >= 0 ? 'text-success' : 'text-error'"
      >
        {{ $formatCurrency(item.balance) }}
      </strong>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex justify-center ga-1">
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('open', item.debtId || item.id)"
          title="Abrir"
        >
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('edit', item)"
          title="Editar"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('delete', item)"
          title="Eliminar"
        >
          <v-icon color="error">mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>

    <template #no-data>
      <div class="text-subtitle-2 text-medium-emphasis pa-4">
        No hay deudas registradas para esta persona.
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
const headers = [
  { title: 'Descripción', key: 'description', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Prestado', key: 'totalLend', align: 'end', sortable: true },
  { title: 'Pagado', key: 'totalPayment', align: 'end', sortable: true },
  { title: 'Saldo', key: 'balance', align: 'end', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

defineProps({
  debts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['open', 'edit', 'delete'])
</script>

<style scoped>
.debts-table {
  background-color: var(--color-surface) !important;
}
</style>
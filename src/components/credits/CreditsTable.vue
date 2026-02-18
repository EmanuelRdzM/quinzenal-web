<!-- src/components/credits/CreditsTable.vue -->
<template>
  <v-card class="credits-table-card">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div>
        <h2 class="text-h6">Créditos / Compras a meses</h2>
        <div class="text-subtitle-2 text-medium-emphasis">
          Registra compras, número de meses y haz seguimiento de pagos.
        </div>
      </div>

      <div class="d-flex ga-2">
        <v-btn
          icon
          variant="text"
          @click="$emit('refresh')"
          title="Refrescar"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-data-table
      :items="credits"
      :headers="headers"
      dense
      item-key="id"
      class="elevation-0"
      items-per-page="-1"
      hide-default-footer
    >
      <template #item.totalAmount="{ item }">
        <span class="font-weight-medium">
          ${{ formatNumber(item.totalAmount) }}
        </span>
      </template>

      <template #item.monthlyAmount="{ item }">
        <span class="font-weight-medium">
          ${{ formatNumber(item.monthlyAmount) }}
        </span>
      </template>

      <template #item.months="{ item }">
        <div>
          <v-icon size="small" color="info">mdi-calendar-month</v-icon>
          <span>{{ item.months }} meses</span>
        </div>
        
        <!-- <v-chip size="small" color="info" variant="tonal">
          {{ item.months }} meses
        </v-chip> -->

      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-center ga-1">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="$emit('open', item.id)"
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
          No hay créditos registrados.
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
const headers = [
  { title: 'Producto', key: 'name', sortable: true },
  { title: 'Total', key: 'totalAmount', align: 'end', sortable: true },
  { title: 'Meses', key: 'months', align: 'center', sortable: true },
  { title: 'Pago mensual', key: 'monthlyAmount', align: 'end', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

defineProps({
  credits: { type: Array, default: () => [] }
})

defineEmits(['create', 'refresh', 'open', 'edit', 'delete'])

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}
</script>

<style scoped>
.credits-table-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
}
</style>
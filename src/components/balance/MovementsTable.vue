<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6">Movimientos</span>
      <span class="text-caption text-medium-emphasis">{{ movements.length }} registros</span>
    </v-card-title>

    <v-card-text>
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
        class="d-block mx-auto my-8"
      ></v-progress-circular>

      <v-data-table
        v-else-if="movements.length"
        :headers="headers"
        :items="movements"
        :items-per-page="-1"
        class="elevation-0"
        hide-default-footer
        hover
      >
        <template #item.type="{ item }">
          <div class="d-flex align-center ga-2">
            <v-icon 
              size="small" 
              :color="item.type === 'income' ? 'success' : 'error'"
            >mdi-circle</v-icon>
            <span>{{ item.type === 'income' ? 'Ingreso' : 'Gasto' }}</span>
          </div>
        </template>

        <template #item.amount="{ item }">
          <span :class="item.type === 'income' ? 'text-success' : 'text-error'">
            {{ $formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.movementDate="{ item }">
          <span class="text-medium-emphasis">{{ formatDateOnly(item.movementDate) }}</span>
        </template>

        <template #item.category="{ item }">
          <v-chip size="small" variant="tonal" color="secondary">
            {{ item.category?.name || 'Sin categoria' }}
          </v-chip>
        </template>

        <template #item.paymentMethod="{ item }">
          <v-chip
            size="small"
            :color="item.paymentMethod === 'cash' ? 'success' : 'info'"
            variant="tonal"
          >
            {{ item.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta' }}
          </v-chip>
        </template>

        <template #item.description="{ item }">
          <span class="text-medium-emphasis">{{ item.description || '-' }}</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              icon
              size="small"
              variant="text"
              @click="$emit('edit', item)"
            >
              <v-icon size="small">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              @click="$emit('delete', item)"
            >
              <v-icon size="small">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <v-empty-state
        v-else
        icon="mdi-file-document-outline"
        title="No hay movimientos"
        text="Comienza registrando tu primer movimiento"
      ></v-empty-state>
    </v-card-text>
  </v-card>
</template>

<script setup>
const headers = [
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Fecha mov.', key: 'movementDate', sortable: true },
  { title: 'Concepto', key: 'concept', sortable: true },
  { title: 'Categoria', key: 'category', sortable: false },
  { title: 'Monto', key: 'amount', sortable: true },
  { title: 'Método', key: 'paymentMethod', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
]

defineProps({
  movements: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete'])

const formatDateOnly = (date) => {
  if (!date) return '-'

  // Handles both DATEONLY (YYYY-MM-DD) and datetime values.
  const raw = String(date)
  const dateOnly = raw.includes('T') ? raw.split('T')[0] : raw
  const parsed = new Date(`${dateOnly}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date(raw)
    return Number.isNaN(fallback.getTime()) ? '-' : fallback.toLocaleDateString('es-MX')
  }

  return parsed.toLocaleDateString('es-MX')
}
</script>
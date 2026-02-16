<!-- src/components/cards/CardsTable.vue -->
<template>
  <v-card class="cards-table-card">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div>
        <h2 class="text-h6">Historial de tarjetas</h2>
        <div class="text-subtitle-2 text-medium-emphasis">
          Gestiona tus tarjetas y abre su historial
        </div>
      </div>

      <div>
        <v-btn
          class="mr-2"
          variant="outlined"
          prepend-icon="mdi-plus"
          @click="$emit('create')"
        >
          Nueva tarjeta
        </v-btn>
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
      :items="cards"
      :headers="headers"
      class="elevation-0"
      :items-per-page="8"
      dense
    >
      <template #item.initialBalance="{ item }">
        <span class="font-weight-medium">
          ${{ formatNumber(item.initialBalance) }}
        </span>
      </template>

      <template #item.notes="{ item }">
        <span class="text-medium-emphasis">
          {{ item.notes || '-' }}
        </span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-center ga-2">
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
          No hay tarjetas. Crea una nueva.
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Saldo inicial', key: 'initialBalance', align: 'end', sortable: true },
  { title: 'Notas', key: 'notes', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

defineProps({
  cards: { type: Array, default: () => [] }
})

defineEmits(['create', 'refresh', 'open', 'edit', 'delete'])

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}
</script>

<style scoped>
.cards-table-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
}
</style>
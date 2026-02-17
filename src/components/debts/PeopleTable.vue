<!-- src/components/debts/PeopleTable.vue -->
<template>
  <v-card class="people-table-card">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div>
        <h2 class="text-h6">Contactos (Préstamos / Rentas)</h2>
        <div class="text-subtitle-2 text-medium-emphasis">
          Crea una tabla por persona para llevar sus deudas/movimientos
        </div>
      </div>

      <div class="d-flex ga-2">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="$emit('create')"
        >
          Nueva persona
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
      :items="people"
      :headers="headers"
      dense
      item-key="id"
      class="elevation-0"
      items-per-page="-1"
      hide-default-footer
    >
      <template #item.notes="{ item }">
        <span class="text-medium-emphasis">
          {{ item.notes || '-' }}
        </span>
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
          No hay personas aún.
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Notas', key: 'notes', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

defineProps({
  people: { type: Array, default: () => [] }
})

defineEmits(['create', 'refresh', 'open', 'edit', 'delete'])
</script>

<style scoped>
.people-table-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
}
</style>
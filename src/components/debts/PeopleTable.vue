<template>
  <v-card class="people-table-card" variant="outlined">
    <v-data-table
      :items="people"
      :headers="headers"
      density="comfortable"
      item-key="id"
      class="elevation-0"
      hide-default-footer
      items-per-page="-1"
      hover
    >
      <template #top>
        <v-toolbar flat class="bg-transparent">
          <v-toolbar-title class="d-flex align-center">
            <v-icon icon="mdi-account-multiple" color="primary" class="mr-2" />
            <span class="font-weight-medium">Lista de contactos</span>
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="$emit('refresh')"
            :loading="loading"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-toolbar>
      </template>

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
            title="Ver detalles"
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
            color="error"
            @click="$emit('delete', item)"
            title="Eliminar"
          >
            <v-icon>mdi-delete</v-icon>
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
  { title: 'Nombre', key: 'name', sortable: true, align: 'start' },
  { title: 'Notas', key: 'notes', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '120' }
]

defineProps({
  people: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['create', 'refresh', 'open', 'edit', 'delete'])
</script>

<style scoped>
.people-table-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 8px !important;
}
</style>
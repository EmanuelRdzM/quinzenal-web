<template>
  <v-card class="cards-table-card" variant="outlined" rounded="lg">
    <v-data-table
      :items="cards"
      :headers="headers"
      :items-per-page="10"
      hover
      density="comfortable"
      class="elevation-0"
    >
      <template #top>
        <v-toolbar flat class="bg-transparent">
          <v-toolbar-title class="d-flex align-center">
            <v-icon icon="mdi-credit-card-outline" color="primary" class="mr-2" />
            <span class="font-weight-medium">Mis tarjetas</span>
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="$emit('refresh')"
            :loading="loading"
            title="Refrescar"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{item}">
        <span @click="$emit('open', item.id)" style="cursor: pointer;">
          {{ item.name }}
        </span>
      </template>

      <template #item.initialBalance="{ item }">
        <span class="font-weight-medium text-info">
          {{ $formatCurrency(item.initialBalance) }}
        </span>
      </template>

      <template #item.notes="{ item }">
        <span class="text-medium-emphasis" @click="$emit('open', item.id)" style="cursor: pointer;">
          {{ item.notes || '—' }}
        </span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-1">
          <v-btn
            icon="mdi-open-in-new"
            size="small"
            variant="text"
            @click="$emit('open', item.id)"
            title="Ver detalles"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="$emit('edit', item)"
            title="Editar"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="$emit('delete', item)"
            title="Eliminar"
          />
        </div>
      </template>

      <template #bottom />
    </v-data-table>
  </v-card>
</template>

<script setup>
const headers = [
  { title: 'Nombre', key: 'name', sortable: true, align: 'start' },
  { title: 'Saldo inicial', key: 'initialBalance', align: 'end', sortable: true },
  { title: 'Notas', key: 'notes', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '140' }
]

defineProps({
  cards: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['create', 'refresh', 'open', 'edit', 'delete'])

</script>

<style scoped>
.cards-table-card {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
}
</style>
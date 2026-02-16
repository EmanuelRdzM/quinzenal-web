<!-- src/pages/cardsHistory/CardDetail.vue -->
<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card class="card pa-4">
          <!-- Header -->
          <CardDetailHeader
            :card-name="card?.name"
            :balance="summary?.balance"
            @new-movement="openMovementDialog"
            @back="goBack"
          />

          <v-divider class="my-4"></v-divider>

          <!-- Summary Cards -->
          <CardSummaryCards :summary="summary" />

          <v-divider class="my-4"></v-divider>

          <!-- Filters -->
          <CardFilters
            v-model:search="searchQuery"
            v-model:from-date="fromDate"
            v-model:to-date="toDate"
            @clear-dates="resetDates"
          />

          <!-- Movements Table -->
          <CardMovementsTable
            :movements="filteredMovements"
            :loading="loadingMovements"
            @edit="editMovement"
            @delete="deleteMovementConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Movement Dialog -->
    <CardMovementFormDialog
      v-model="dialogMovement"
      :movement="editingMovement"
      :loading="savingMovement"
      @save="submitMovement"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import CardDetailHeader from '../../components/cards/CardDetailHeader.vue'
import CardSummaryCards from '../../components/cards/CardSummaryCards.vue'
import CardFilters from '../../components/cards/CardFilters.vue'
import CardMovementsTable from '../../components/cards/CardMovementsTable.vue'
import CardMovementFormDialog from '../../components/cards/CardMovementFormDialog.vue'

const route = useRoute()
const router = useRouter()
const cardId = route.params.id

const card = ref(null)
const summary = ref(null)
const movements = ref([])
const loadingMovements = ref(false)
const dialogMovement = ref(false)
const editingMovement = ref(null)
const savingMovement = ref(false)

// Filters
const searchQuery = ref('')
const fromDate = ref('')
const toDate = ref('')

// Computed
const filteredMovements = computed(() => {
  let filtered = movements.value

  // Filter by search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => 
      (m.concept || '').toLowerCase().includes(q) || 
      (m.description || '').toLowerCase().includes(q)
    )
  }

  return filtered
})

// Methods
async function loadCard() {
  try {
    const res = await api.get(`/v1/cards/${cardId}`)
    card.value = res.data
  } catch (err) {
    console.error(err)
    router.back()
  }
}

async function loadSummary() {
  try {
    const res = await api.get(`/v1/cards/${cardId}/summary`)
    summary.value = res.data
  } catch (err) {
    console.error(err)
  }
}

async function loadMovements() {
  loadingMovements.value = true
  try {
    const params = { limit: 200 }
    if (fromDate.value) params.fromDate = fromDate.value
    if (toDate.value) params.toDate = toDate.value
    
    const res = await api.get(`/v1/cards/${cardId}/movements`, { params })
    movements.value = res.data || []
  } catch (err) {
    console.error(err)
    movements.value = []
  } finally {
    loadingMovements.value = false
  }
}

function openMovementDialog() {
  editingMovement.value = null
  dialogMovement.value = true
}

function editMovement(movement) {
  editingMovement.value = movement
  dialogMovement.value = true
}

async function submitMovement(formData) {
  savingMovement.value = true
  try {
    if (editingMovement.value) {
      await api.put(`/v1/card-movements/${editingMovement.value.id}`, formData)
    } else {
      await api.post(`/v1/cards/${cardId}/movements`, {
        cardId: Number(cardId),
        ...formData
      })
    }

    await Promise.all([loadMovements(), loadSummary()])
    dialogMovement.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingMovement.value = false
  }
}

function deleteMovementConfirm(movement) {
  if (confirm(`¿Eliminar movimiento "${movement.concept}"?`)) {
    deleteMovement(movement.id)
  }
}

async function deleteMovement(id) {
  try {
    await api.delete(`/v1/card-movements/${id}`)
    await Promise.all([loadMovements(), loadSummary()])
  } catch (err) {
    console.error(err)
  }
}

function resetDates() {
  fromDate.value = ''
  toDate.value = ''
  loadMovements()
}

function goBack() {
  router.back()
}

onMounted(async () => {
  await Promise.all([loadCard(), loadSummary(), loadMovements()])
})
</script>

<style scoped>
.card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
}
</style>
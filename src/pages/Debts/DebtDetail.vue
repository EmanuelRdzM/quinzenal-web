<!-- src/pages/debts/DebtDetail.vue -->
<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card class="card pa-4">
          <!-- Header -->
          <DebtHeader
            :debt-id="debtId"
            :description="debt?.description"
            :summary="summary"
            @new-movement="openMovementDialog"
            @back="goBack"
          />

          <v-divider class="my-4"></v-divider>

          <!-- Date Filters -->
          <div class="mb-3 d-flex ga-3 align-center">
            <DateFilter
              v-model:from-date="fromDate"
              v-model:to-date="toDate"
              @clear="resetDates"
            />
          </div>

          <!-- Movements Table -->
          <DebtMovementsTable
            :movements="movements"
            :loading="loadingMovements"
            @edit="editMovement"
            @delete="deleteMovementConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Movement Dialog -->
    <DebtMovementFormDialog
      v-model="dialogMovement"
      :movement="editingMovement"
      :debt-id="debtId"
      :loading="savingMovement"
      @save="submitMovement"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import DebtHeader from '../../components/debts/DebtHeader.vue'
import DateFilter from '../../components/common/DateFilter.vue'
import DebtMovementsTable from '../../components/debts/DebtMovementsTable.vue'
import DebtMovementFormDialog from '../../components/debts/DebtMovementFormDialog.vue'

const route = useRoute()
const router = useRouter()
const debtId = route.params.id

const debt = ref(null)
const summary = ref(null)
const movements = ref([])
const loadingMovements = ref(false)

const dialogMovement = ref(false)
const editingMovement = ref(null)
const savingMovement = ref(false)

// Filters
const fromDate = ref('')
const toDate = ref('')

async function loadDebt() {
  try {
    const res = await api.get(`/v1/debts/${debtId}`)
    debt.value = res.data
  } catch (err) {
    console.error(err)
  }
}

async function loadSummary() {
  try {
    const res = await api.get(`/v1/debts/${debtId}/summary`)
    summary.value = res.data
  } catch (err) {
    console.error(err)
  }
}

async function loadMovements() {
  loadingMovements.value = true
  try {
    const params = {}
    if (fromDate.value) params.fromDate = fromDate.value
    if (toDate.value) params.toDate = toDate.value
    
    const res = await api.get(`/v1/debts/${debtId}/movements`, { params })
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
      await api.put(`/v1/debt-movements/${editingMovement.value.id}`, formData)
    } else {
      await api.post(`/v1/debts/${debtId}/movements`, formData)
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
  if (confirm(`¿Eliminar movimiento de $${formatNumber(movement.amount)}?`)) {
    deleteMovement(movement.id)
  }
}

async function deleteMovement(id) {
  try {
    await api.delete(`/v1/debt-movements/${id}`)
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

// Helper
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

onMounted(async () => {
  await Promise.all([loadDebt(), loadSummary(), loadMovements()])
})
</script>

<style scoped>
.card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
}
</style>
<!-- src/pages/debts/PersonDetail.vue -->
<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card class="card pa-4">
          <!-- Header -->
          <PersonHeader
            :person-name="personName"
            :totals="summary?.totals"
            @new-debt="openDebtDialog"
            @back="goBack"
          />

          <v-divider class="my-4"></v-divider>

          <!-- Debts Table -->
          <DebtsTable
            :debts="debts"
            :loading="loadingDebts"
            @open="goToDebt"
            @edit="editDebt"
            @delete="deleteDebtConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog crear/editar deuda -->
    <DebtFormDialog
      v-model="dialogDebt"
      :debt="editingDebt"
      :person-id="personId"
      :loading="savingDebt"
      @save="submitDebt"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import PersonHeader from '../../components/debts/PersonHeader.vue'
import DebtsTable from '../../components/debts/DebtsTable.vue'
import DebtFormDialog from '../../components/debts/DebtFormDialog.vue'

const route = useRoute()
const router = useRouter()
const personId = route.params.id

const personName = ref('')
const summary = ref(null)
const debts = ref([])
const loadingDebts = ref(false)

const dialogDebt = ref(false)
const editingDebt = ref(null)
const savingDebt = ref(false)

async function loadSummary() {
  try {
    const res = await api.get(`/v1/people/${personId}/summary`)
    summary.value = res.data
    personName.value = res.data?.name || ''
    debts.value = res.data?.debts?.map(d => ({ ...d })) || []
  } catch (err) {
    console.error(err)
    router.back()
  }
}

async function loadDebts() {
  loadingDebts.value = true
  try {
    const res = await api.get('/v1/debts', { params: { personId } })
    debts.value = res.data || debts.value
  } catch (err) {
    console.error(err)
  } finally {
    loadingDebts.value = false
  }
}

function openDebtDialog() {
  editingDebt.value = null
  dialogDebt.value = true
}

function editDebt(debt) {
  editingDebt.value = debt
  dialogDebt.value = true
}

async function submitDebt(formData) {
  savingDebt.value = true
  try {
    if (editingDebt.value) {
      await api.put(`/v1/debts/${editingDebt.value.id}`, formData)
    } else {
      await api.post('/v1/debts', formData)
    }
    await Promise.all([loadSummary(), loadDebts()])
    dialogDebt.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingDebt.value = false
  }
}

function deleteDebtConfirm(debt) {
  if (confirm(`¿Eliminar deuda "${debt.description || debt.id}"?`)) {
    deleteDebt(debt.debtId || debt.id)
  }
}

async function deleteDebt(id) {
  try {
    await api.delete(`/v1/debts/${id}`)
    await Promise.all([loadSummary(), loadDebts()])
  } catch (err) {
    console.error(err)
  }
}

function goToDebt(id) {
  router.push(`/debts/${id}`)
}

function goBack() {
  router.back()
}

onMounted(async () => {
  await loadSummary()
  await loadDebts()
})
</script>

<style scoped>
.card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
}
</style>
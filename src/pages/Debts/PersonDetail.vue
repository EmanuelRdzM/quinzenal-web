<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Breadcrumb -->
        <div class="d-flex align-center mb-4">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
            class="mr-2"
          >
            Volver
          </v-btn>
          <v-divider vertical class="mx-4" />
          <div>
            <h2 class="text-h5 font-weight-bold text-primary">
              {{ personName || 'Cargando...' }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              Detalle de persona
            </span>
          </div>
        </div>

        <!-- Stats Cards -->
        <v-row class="mb-4">
          <v-col cols="12" sm="4">
            <v-card class="stat-card pa-4" variant="outlined">
              <div class="d-flex align-center">
                <v-avatar color="success" variant="tonal" size="48" class="mr-3">
                  <v-icon color="success" size="28">mdi-cash-plus</v-icon>
                </v-avatar>
                <div>
                  <span class="text-subtitle-2 text-medium-emphasis">Total prestado</span>
                  <h3 class="text-h5 font-weight-bold text-success">
                    {{ $formatCurrency(summary?.totals?.totalLend) }}
                  </h3>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="4">
            <v-card class="stat-card pa-4" variant="outlined">
              <div class="d-flex align-center">
                <v-avatar color="info" variant="tonal" size="48" class="mr-3">
                  <v-icon color="info" size="28">mdi-cash-minus</v-icon>
                </v-avatar>
                <div>
                  <span class="text-subtitle-2 text-medium-emphasis">Total pagado</span>
                  <h3 class="text-h5 font-weight-bold text-info">
                    {{ $formatCurrency(summary?.totals?.totalPayment) }}
                  </h3>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="4">
            <v-card class="stat-card pa-4" variant="outlined">
              <div class="d-flex align-center">
                <v-avatar 
                  :color="(summary?.totals?.totalBalance || 0) >= 0 ? 'success' : 'error'" 
                  variant="tonal" 
                  size="48" 
                  class="mr-3"
                >
                  <v-icon 
                    :color="(summary?.totals?.totalBalance || 0) >= 0 ? 'success' : 'error'" 
                    size="28"
                  >
                    {{ (summary?.totals?.totalBalance || 0) >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                </v-avatar>
                <div>
                  <span class="text-subtitle-2 text-medium-emphasis">Saldo actual</span>
                  <h3 
                    class="text-h5 font-weight-bold"
                    :class="(summary?.totals?.totalBalance || 0) >= 0 ? 'text-success' : 'text-error'"
                  >
                    {{ $formatCurrency(summary?.totals?.totalBalance) }}
                  </h3>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Debts Section -->
        <v-card class="pa-6" variant="outlined">
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-format-list-bulleted" color="primary" class="mr-2" />
              <h3 class="text-h6 font-weight-medium">Deudas registradas</h3>
            </div>
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openDebtDialog"
              variant="flat"
              class="rounded-lg"
            >
              Nueva deuda
            </v-btn>
          </div>

          <v-divider class="mb-4"></v-divider>

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

    <DebtFormDialog
      v-model="dialogDebt"
      :debt="editingDebt"
      :person-id="personId"
      :loading="savingDebt"
      @save="submitDebt"
    />
  </v-container>
</template>

<style scoped>
.stat-card {
  background-color: var(--color-surface) !important;
  border-radius: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}
</style>

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
      await api.put(`/v1/debts/${editingDebt.value.debtId}`, formData)
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
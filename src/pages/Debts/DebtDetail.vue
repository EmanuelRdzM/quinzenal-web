<!-- src/pages/debts/DebtDetail.vue -->
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
              {{ debt?.description || 'Cargando...' }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              Detalle de deuda
            </span>
          </div>
        </div>

        <!-- Stats Cards  -->
        <v-row class="mb-4">
          <!-- Total Prestado / Ingresos totales (si es renta) -->
          <v-col cols="12" md="4">
            <v-card class="stat-card pa-4" variant="outlined">
              <div class="d-flex align-center">
                <v-avatar color="warning" variant="tonal" size="52" class="mr-4">
                  <v-icon color="warning" size="28">mdi-cash-plus</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 text-medium-emphasis">
                      {{ isRent ? 'Ingresos totales' : 'Total prestado' }}
                    </span>
                    <v-icon size="16" color="warning" class="ml-1">mdi-arrow-up-circle</v-icon>
                  </div>
                  <h3 class="text-h4 font-weight-bold text-warning">
                    {{ $formatCurrency(totalLendDisplay) }}
                  </h3>
                  <div class="d-flex align-center mt-1">
                    <v-chip size="x-small" color="warning" variant="flat" class="mr-1">
                      {{ isRent ? 'Renta' : 'Préstamo' }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ isRent ? 'Total recibido / registrado' : 'Monto original' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Total Pagado / Pagos recibidos -->
          <v-col cols="12" md="4">
            <v-card class="stat-card pa-4" variant="outlined">
              <div class="d-flex align-center">
                <v-avatar color="info" variant="tonal" size="52" class="mr-4">
                  <v-icon color="info" size="28">mdi-cash-minus</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 text-medium-emphasis">
                      {{ isRent ? 'Pagos recibidos' : 'Total pagado' }}
                    </span>
                    <v-icon size="16" color="info" class="ml-1">mdi-arrow-down-circle</v-icon>
                  </div>
                  <h3 class="text-h4 font-weight-bold text-info">
                    {{ $formatCurrency(totalPaymentDisplay) }}
                  </h3>
                  <div class="d-flex align-center mt-1">
                    <v-chip size="x-small" color="info" variant="flat" class="mr-1">
                      {{ isRent ? 'Ingresos' : 'Pagos' }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ isRent ? 'Total recibido hasta la fecha' : 'Total abonado' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Saldo Actual -->
          <v-col cols="12" md="4">
            <v-card 
              class="stat-card pa-4" 
              :class="{ 'balance-positive': isPositiveBalance, 'balance-negative': !isPositiveBalance }"
              variant="outlined"
            >
              <div class="d-flex align-center">
                <v-avatar 
                  :color="balanceColor" 
                  variant="tonal" 
                  size="52" 
                  class="mr-4"
                >
                  <v-icon :color="balanceColor" size="28">
                    {{ isPositiveBalance ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 text-medium-emphasis">Saldo actual</span>
                    <v-icon 
                      size="16" 
                      :color="balanceColor" 
                      class="ml-1"
                    >
                      {{ isPositiveBalance ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                    </v-icon>
                  </div>
                  <h3 class="text-h4 font-weight-bold" :class="`text-${balanceColor}`">
                    {{ $formatCurrency(balanceDisplay) }}
                  </h3>
                  <div class="d-flex align-center mt-1">
                    <v-chip 
                      size="x-small" 
                      :color="balanceColor" 
                      variant="flat" 
                      class="mr-1"
                    >
                      {{ isPositiveBalance ? (isRent ? 'Por recibir' : 'Por cobrar') : 'Por pagar' }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ getBalanceDescription }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Barra de progreso visual: solo para préstamos con total prestado -->
              <v-progress-linear
                v-if="!isRent && summary?.totalLend"
                class="mt-3"
                :model-value="paymentProgress"
                :color="balanceColor"
                height="6"
                rounded
              ></v-progress-linear>
            </v-card>
          </v-col>
        </v-row>

        <!-- Movements Section -->
        <v-card class="pa-6" variant="outlined">
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-history" color="primary" class="mr-2" />
              <h3 class="text-h6 font-weight-medium">Historial de movimientos</h3>
            </div>
            <v-spacer />
            
            <!-- Badge de resumen rápido -->
            <v-chip
              v-if="movements.length"
              class="mr-4"
              color="primary"
              variant="outlined"
              size="small"
            >
              {{ movements.length }} {{ movements.length === 1 ? 'movimiento' : 'movimientos' }}
            </v-chip>

            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openMovementDialog"
              variant="flat"
              class="rounded-lg"
            >
              {{ isRent ? 'Registrar pago' : 'Nuevo movimiento' }}
            </v-btn>
          </div>

          <v-divider class="mb-4"></v-divider>

          <!-- Date Filters - Más compactos -->
          <div class="mb-4 d-flex ga-3 align-center">
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
            :is-rent="isRent"
          />
        </v-card>

        <!-- Movement Dialog -->
        <DebtMovementFormDialog
          v-model="dialogMovement"
          :movement="editingMovement"
          :debt-id="debtId"
          :loading="savingMovement"
          :is-rent="isRent"
          :default-movement-type="isRent ? 'payment' : undefined"
          @save="submitMovement"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import DateFilter from '../../components/common/DateFilter.vue'
import DebtMovementsTable from '../../components/debts/DebtMovementsTable.vue'
import DebtMovementFormDialog from '../../components/debts/DebtMovementFormDialog.vue'
import { formatCurrency } from '../../utils/formatters.js'

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

// Detectar tipo renta
const isRent = computed(() => debt.value?.type === 'rent')

// Normalizamos números y mostramos valores según si es renta o no
const totalLendDisplay = computed(() => {
  // Si es renta, el concepto "total prestado" no aplica: mostramos total recibido en su lugar (si existe)
  if (isRent.value) return Number(summary.value?.totalPayment || 0)
  return Number(summary.value?.totalLend || 0)
})
const totalPaymentDisplay = computed(() => Number(summary.value?.totalPayment || 0))

// Balance para mostrar (si es renta, no permitimos negativo)
const balanceDisplay = computed(() => {
  const raw = Number(summary.value?.balance || 0)
  if (isRent.value) return Math.max(raw, 0)
  return raw
})

// Re-evaluar si es positivo en base al balanceDisplay (compatibilidad)
const isPositiveBalance = computed(() => balanceDisplay.value >= 0)
const balanceColor = computed(() => (isPositiveBalance.value ? 'success' : 'error'))

// Progreso solo tiene sentido para préstamos donde hay un total prestado
const paymentProgress = computed(() => {
  if (!summary.value?.totalLend || isRent.value) return 0
  const paid = Number(summary.value?.totalPayment || 0)
  const total = Number(summary.value?.totalLend || 0)
  return Math.min((paid / total) * 100, 100)
})

const getBalanceDescription = computed(() => {
  if (!summary.value) return ''
  if (isRent.value) {
    // Si es renta, balance 0 significa al día; >0 significa por recibir
    if (balanceDisplay.value === 0) return 'Pagos al corriente'
    return 'Por recibir'
  } else {
    if (!summary.value?.balance) return 'Deuda saldada'
    return isPositiveBalance.value ? 'Te deben' : 'Debes pagar'
  }
})

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
    // Si es renta, forzamos que el movimiento sea tipo 'payment' (solo pueden registrarse pagos)
    if (isRent.value) {
      formData.type = 'payment'
      // opcional: aseguramos amount positivo
      formData.amount = Math.abs(Number(formData.amount || 0))
    }

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
  if (confirm(`¿Eliminar movimiento de ${formatCurrency(movement.amount)}?`)) {
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

onMounted(async () => {
  await Promise.all([loadDebt(), loadSummary(), loadMovements()])
})
</script>

<style scoped>
.stat-card {
  background-color: var(--color-surface) !important;
  border-radius: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.balance-positive:hover {
  border-color: var(--color-success) !important;
}

.stat-card.balance-negative:hover {
  border-color: var(--color-error) !important;
}

/* Efecto de gradiente sutil en el fondo */
.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02));
  pointer-events: none;
}
</style>
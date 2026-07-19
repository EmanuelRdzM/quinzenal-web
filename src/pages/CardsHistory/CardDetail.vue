<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
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
              {{ card?.name || 'Cargando...' }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              {{ isCreditCard ? 'Detalle de tarjeta de crédito' : 'Detalle de tarjeta' }}
            </span>
          </div>
        </div>

        <v-card class="mb-4" variant="outlined" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap ga-4">
              <div class="d-flex align-center">
                <v-avatar
                  :color="balanceColor"
                  variant="tonal"
                  size="64"
                  class="mr-4"
                >
                  <v-icon
                    :color="balanceColor"
                    size="36"
                  >
                    mdi-credit-card
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 text-medium-emphasis">
                    {{ isCreditCard ? 'Crédito disponible' : 'Saldo actual' }}
                  </div>
                  <div class="text-h4 font-weight-bold mb-1" :class="balanceClass">
                    {{ displayMainBalance === null ? '—' : $formatCurrency(displayMainBalance) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Última actualización: {{ formatDate(new Date()) }}
                  </div>
                  <div v-if="isCreditCard" class="mt-2">
                    <v-chip
                      size="small"
                      :color="dueChipColor"
                      variant="tonal"
                    >
                      {{ dueChipText }}
                    </v-chip>
                  </div>
                </div>
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openMovementDialog"
                size="large"
                class="rounded-lg"
              >
                Nuevo movimiento
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-row class="mb-4" v-if="!isCreditCard">
          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="info" variant="tonal" size="48" class="mr-3">
                    <v-icon color="info" size="28">mdi-cash</v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Saldo inicial</span>
                    <h3 class="text-h5 font-weight-bold">
                      {{ $formatCurrency(summary?.initialBalance) }}
                    </h3>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="success" variant="tonal" size="48" class="mr-3">
                    <v-icon color="success" size="28">mdi-trending-up</v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Ingresos</span>
                    <h3 class="text-h5 font-weight-bold text-success">
                      {{ $formatCurrency(summary?.totalIncome) }}
                    </h3>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="error" variant="tonal" size="48" class="mr-3">
                    <v-icon color="error" size="28">mdi-trending-down</v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Egresos</span>
                    <h3 class="text-h5 font-weight-bold text-error">
                      {{ $formatCurrency(summary?.totalExpense) }}
                    </h3>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-4" v-else-if="summary">
          <v-col cols="12" md="3">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <span class="text-subtitle-2 text-medium-emphasis">Límite de crédito</span>
                <h3 class="text-h5 font-weight-bold">
                  {{ $formatCurrency(summary?.creditLimit) }}
                </h3>
                <div class="text-caption text-medium-emphasis">
                  Utilización: {{ Number(summary?.utilizationRate || 0).toFixed(2) }}%
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <span class="text-subtitle-2 text-medium-emphasis">Saldo usado</span>
                <h3 class="text-h5 font-weight-bold text-error">
                  {{ $formatCurrency(summary?.outstandingBalance) }}
                </h3>
                <div class="text-caption text-medium-emphasis">
                  Corte: día {{ summary?.statementCutoffDay || '—' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <span class="text-subtitle-2 text-medium-emphasis">{{ paymentRequiredLabel }}</span>
                <h3 class="text-h5 font-weight-bold text-warning">
                  {{ $formatCurrency(summary?.minimumPaymentDue) }}
                </h3>
                <div class="text-caption text-medium-emphasis">
                  Tasa anual: {{ Number(summary?.annualInterestRate || 0).toFixed(2) }}%
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <span class="text-subtitle-2 text-medium-emphasis">Pago para no generar interés</span>
                <h3 class="text-h5 font-weight-bold" :class="Number(summary?.amountDue || 0) > 0 ? 'text-error' : 'text-success'">
                  {{ $formatCurrency(summary?.amountDue) }}
                </h3>
                <div class="text-caption text-medium-emphasis">
                  Vence: {{ summary?.paymentDueDate || '—' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="text-subtitle-2 text-medium-emphasis mb-2">Desglose de deuda actual</div>
                <div class="d-flex flex-wrap ga-3">
                  <v-chip size="small" variant="tonal" color="error">Compras: {{ $formatCurrency(summary?.breakdown?.purchase) }}</v-chip>
                  <v-chip size="small" variant="tonal" color="success">Pagos: {{ $formatCurrency(summary?.breakdown?.payment) }}</v-chip>
                  <v-chip size="small" variant="tonal" color="warning">Interés: {{ $formatCurrency(summary?.breakdown?.interest) }}</v-chip>
                  <v-chip size="small" variant="tonal" color="orange">Comisiones: {{ $formatCurrency(summary?.breakdown?.lateFee) }}</v-chip>
                  <v-chip size="small" variant="tonal" color="info">MSI habilitado: {{ summary?.msiEnabled ? 'Sí' : 'No' }}</v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="text-subtitle-2 text-medium-emphasis mb-2">Proyección</div>
                <div class="text-body-2 mb-1">
                  Próximo corte: <strong>{{ summary?.nextCutoffDate || '—' }}</strong>
                </div>
                <div class="text-body-2 mb-1">
                  Compras del ciclo actual: <strong>{{ $formatCurrency(summary?.currentCycleCharges) }}</strong>
                </div>
                <div class="text-body-2 mb-1">
                  Interés estimado si no pagas a tiempo: <strong>{{ $formatCurrency(summary?.estimatedInterestIfUnpaid) }}</strong>
                </div>
                <div class="text-body-2">
                  Comisión por atraso estimada: <strong>{{ $formatCurrency(summary?.estimatedLateFeeIfUnpaid) }}</strong>
                </div>
                <div class="text-body-2 mt-1">
                  Anualidad: <strong>{{ $formatCurrency(summary?.annualFee) }}</strong>
                  <span v-if="summary?.annualFeeMonth"> (mes {{ summary.annualFeeMonth }})</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-4" v-else>
          <v-col cols="12">
            <v-alert type="info" variant="tonal" density="comfortable">
              Cargando resumen de la tarjeta de crédito...
            </v-alert>
          </v-col>
        </v-row>

        <v-card class="pa-6" variant="outlined" rounded="lg">
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-history" color="primary" class="mr-2" />
              <h3 class="text-h6 font-weight-medium">Historial de movimientos</h3>
            </div>
            <v-spacer />
            <CardFilters
              v-model:search="searchQuery"
              v-model:from-date="fromDate"
              v-model:to-date="toDate"
              @clear-dates="resetDates"
              class="mr-3"
            />
          </div>

          <v-divider class="mb-4"></v-divider>

          <CardMovementsTable
            :movements="filteredMovements"
            :loading="loadingMovements"
            @edit="editMovement"
            @delete="deleteMovementConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <CardMovementFormDialog
      v-model="dialogMovement"
      :movement="editingMovement"
      :card="card"
      :loading="savingMovement"
      @save="submitMovement"
    />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
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

const searchQuery = ref('')
const fromDate = ref('')
const toDate = ref('')

const isCreditCard = computed(() => card.value?.cardType === 'credit')

const displayMainBalance = computed(() =>
  isCreditCard.value
    ? (summary.value ? Number(summary.value.availableCredit || 0) : null)
    : (summary.value ? Number(summary.value.balance || 0) : null)
)

const balanceClass = computed(() =>
  displayMainBalance.value === null
    ? 'text-medium-emphasis'
    : (Number(displayMainBalance.value) >= 0 ? 'text-success' : 'text-error')
)

const balanceColor = computed(() =>
  displayMainBalance.value === null
    ? 'info'
    : (Number(displayMainBalance.value) >= 0 ? 'success' : 'error')
)

const dueChipColor = computed(() => {
  if (!isCreditCard.value) return 'info'
  if (summary.value?.isPastDue) return 'error'
  if (Number(summary.value?.daysUntilDue || 0) <= 3) return 'warning'
  return 'success'
})

const dueChipText = computed(() => {
  if (!isCreditCard.value) return ''
  if (summary.value?.isPastDue) return 'Pago vencido'
  const days = Number(summary.value?.daysUntilDue || 0)
  if (days <= 0) return 'Vence hoy'
  return `Vence en ${days} día${days === 1 ? '' : 's'}`
})

const paymentRequiredLabel = computed(() => {
  if (!isCreditCard.value) return 'Pago requerido'
  return summary.value?.fullStatementRequired
    ? 'Pago requerido del corte'
    : 'Pago mínimo estimado'
})

const filteredMovements = computed(() => {
  let filtered = movements.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter((m) =>
      (m.concept || '').toLowerCase().includes(q)
      || (m.description || '').toLowerCase().includes(q)
    )
  }

  return filtered
})

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
    summary.value = null
  }
}

async function loadMovements() {
  loadingMovements.value = true
  try {
    const params = { limit: 300 }
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
}

function goBack() {
  router.back()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch([fromDate, toDate], () => {
  loadMovements()
})

onMounted(async () => {
  await Promise.all([loadCard(), loadSummary(), loadMovements()])
})
</script>

<style scoped>
.stat-card {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>

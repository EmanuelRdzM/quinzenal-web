<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Breadcrumb mejorado -->
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
              {{ creditSummary?.name || 'Cargando...' }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              Detalle del crédito
            </span>
          </div>
        </div>

        <!-- Header con info principal -->
        <v-card class="mb-4" variant="outlined" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar color="primary" variant="tonal" size="64" class="mr-4">
                  <v-icon color="primary" size="36">mdi-credit-card-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 text-medium-emphasis">Crédito</div>
                  <div class="text-h5 font-weight-bold mb-1">{{ creditSummary?.name }}</div>
                  <div class="d-flex ga-4">
                    <span class="text-medium-emphasis">
                      <v-icon icon="mdi-cash" size="small" class="mr-1" />
                      Total: <span class="text-primary font-weight-bold">${{ formatNumber(creditSummary?.totalAmount) }}</span>
                    </span>
                    <span class="text-medium-emphasis">
                      <v-icon icon="mdi-calendar" size="small" class="mr-1" />
                      Meses: <span class="font-weight-bold">{{ creditSummary?.months }}</span>
                    </span>
                    <span class="text-medium-emphasis">
                      <v-icon icon="mdi-calendar-month" size="small" class="mr-1" />
                      Pago mensual: <span class="text-info font-weight-bold">${{ formatNumber(creditSummary?.monthlyAmount) }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openPaymentDialog"
                size="large"
                class="rounded-lg"
              >
                Registrar pago
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Summary Cards mejorados -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="success" variant="tonal" size="48" class="mr-3">
                    <v-icon color="success" size="28">mdi-cash-check</v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Total pagado</span>
                    <h3 class="text-h5 font-weight-bold text-success">
                      ${{ formatNumber(creditSummary?.totalPaid) }}
                    </h3>
                    <span class="text-caption text-medium-emphasis">
                      Pagos: {{ creditSummary?.paymentsMadeCount || 0 }}
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar 
                    :color="(creditSummary?.remaining || 0) > 0 ? 'warning' : 'success'" 
                    variant="tonal" 
                    size="48" 
                    class="mr-3"
                  >
                    <v-icon 
                      :color="(creditSummary?.remaining || 0) > 0 ? 'warning' : 'success'" 
                      size="28"
                    >
                      {{ (creditSummary?.remaining || 0) > 0 ? 'mdi-timer-sand' : 'mdi-check-circle' }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Restante</span>
                    <h3 
                      class="text-h5 font-weight-bold"
                      :class="(creditSummary?.remaining || 0) > 0 ? 'text-warning' : 'text-success'"
                    >
                      ${{ formatNumber(creditSummary?.remaining) }}
                    </h3>
                    <span class="text-caption text-medium-emphasis">
                      Siguiente pago: #{{ creditSummary?.nextPaymentNumber || 1 }}
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar 
                    :color="isPaid ? 'success' : 'info'" 
                    variant="tonal" 
                    size="48" 
                    class="mr-3"
                  >
                    <v-icon 
                      :color="isPaid ? 'success' : 'info'" 
                      size="28"
                    >
                      {{ isPaid ? 'mdi-check-decagram' : 'mdi-progress-clock' }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Estado</span>
                    <div class="d-flex align-center">
                      <v-chip
                        :color="isPaid ? 'success' : 'info'"
                        size="small"
                        variant="tonal"
                        class="mr-2"
                      >
                        {{ isPaid ? 'Completado' : 'Activo' }}
                      </v-chip>
                    </div>
                    <span class="text-caption text-medium-emphasis">
                      {{ creditSummary?.paymentsMadeCount || 0 }} de {{ creditSummary?.months || 0 }} pagos
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Payments Section -->
        <v-card class="pa-6" variant="outlined" rounded="lg">
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-format-list-bulleted" color="primary" class="mr-2" />
              <h3 class="text-h6 font-weight-medium">Historial de pagos</h3>
            </div>
            <v-spacer />
            <DateFilter
              v-model:from-date="fromDate"
              v-model:to-date="toDate"
              @clear="resetDates"
              class="mr-3"
            />
          </div>

          <v-divider class="mb-4"></v-divider>

          <CreditPaymentsTable
            :payments="payments"
            :loading="loadingPayments"
            @edit="editPayment"
            @delete="deletePaymentConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <CreditPaymentFormDialog
      v-model="dialogPayment"
      :payment="editingPayment"
      :credit-id="creditId"
      :suggested-amount="creditSummary?.monthlyAmount"
      :loading="savingPayment"
      @save="submitPayment"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import DateFilter from '../../components/common/DateFilter.vue'
import CreditPaymentsTable from '../../components/credits/CreditPaymentsTable.vue'
import CreditPaymentFormDialog from '../../components/credits/CreditPaymentFormDialog.vue'

const route = useRoute()
const router = useRouter()
const creditId = route.params.id

const creditSummary = ref(null)
const payments = ref([])
const loadingPayments = ref(false)

const dialogPayment = ref(false)
const editingPayment = ref(null)
const savingPayment = ref(false)

// Filters
const fromDate = ref('')
const toDate = ref('')

const isPaid = computed(() => 
  (creditSummary.value?.paymentsMadeCount || 0) >= (creditSummary.value?.months || 0)
)

async function loadSummary() {
  try {
    const res = await api.get(`/v1/credits/${creditId}/summary`)
    creditSummary.value = res.data
  } catch (err) {
    console.error(err)
  }
}

async function loadPayments() {
  loadingPayments.value = true
  try {
    const params = {}
    if (fromDate.value) params.fromDate = fromDate.value
    if (toDate.value) params.toDate = toDate.value
    
    const res = await api.get(`/v1/credits/${creditId}/payments`, { params })
    payments.value = res.data || []
  } catch (err) {
    console.error(err)
    payments.value = []
  } finally {
    loadingPayments.value = false
  }
}

function openPaymentDialog() {
  editingPayment.value = null
  dialogPayment.value = true
}

function editPayment(payment) {
  editingPayment.value = payment
  dialogPayment.value = true
}

async function submitPayment(formData) {
  savingPayment.value = true
  try {
    if (editingPayment.value) {
      await api.put(`/v1/credit-payments/${editingPayment.value.id}`, {
        amount: formData.amount,
        date: formData.date,
        allowOverpay: formData.allowOverpay
      })
    } else {
      await api.post(`/v1/credits/${creditId}/payments`, formData)
    }

    await Promise.all([loadPayments(), loadSummary()])
    dialogPayment.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingPayment.value = false
  }
}

function deletePaymentConfirm(payment) {
  if (confirm(`¿Eliminar pago #${payment.paymentNumber} de $${formatNumber(payment.amount)}?`)) {
    deletePayment(payment.id)
  }
}

async function deletePayment(id) {
  try {
    await api.delete(`/v1/credit-payments/${id}`)
    await Promise.all([loadPayments(), loadSummary()])
  } catch (err) {
    console.error(err)
  }
}

function resetDates() {
  fromDate.value = ''
  toDate.value = ''
  loadPayments()
}

function goBack() {
  router.back()
}

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

onMounted(async () => {
  await Promise.all([loadSummary(), loadPayments()])
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
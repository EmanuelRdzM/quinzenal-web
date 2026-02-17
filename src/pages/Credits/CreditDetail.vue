<!-- src/pages/credits/CreditDetail.vue -->
<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card class="card pa-4">
          <!-- Header -->
          <CreditHeader
            :credit-id="creditId"
            :credit-name="creditSummary?.name"
            :summary="creditSummary"
            @new-payment="openPaymentDialog"
            @back="goBack"
          />

          <v-divider class="my-4"></v-divider>

          <!-- Summary Cards -->
          <CreditSummaryCards :summary="creditSummary" />

          <v-divider class="my-4"></v-divider>

          <!-- Date Filters -->
          <!-- <div class="mb-3 d-flex ga-3 align-center">
            <DateFilter
              v-model:from-date="fromDate"
              v-model:to-date="toDate"
              @clear="resetDates"
            />
          </div> -->

          <!-- Payments Table -->
          <CreditPaymentsTable
            :payments="payments"
            :loading="loadingPayments"
            @edit="editPayment"
            @delete="deletePaymentConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Payment Dialog -->
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import CreditHeader from '../../components/credits/CreditHeader.vue'
import CreditSummaryCards from '../../components/credits/CreditSummaryCards.vue'
//import DateFilter from '../../components/common/DateFilter.vue'
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

// Helper
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

onMounted(async () => {
  await Promise.all([loadSummary(), loadPayments()])
})
</script>

<style scoped>
.card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
}
</style>
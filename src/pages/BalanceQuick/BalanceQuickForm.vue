<template>
  <v-container class="pa-4">
    <!-- Periodo Section -->
    <PeriodCard
      :periods="formattedPeriods"
      :selected-period-id="selectedPeriodId"
      @update:selected="handlePeriodChange"
      @refresh="refreshAll"
      @open-create-modal="showCreatePeriodModal = true"
    />

    <!-- Create Period Modal -->
    <FormModal
      v-model="showCreatePeriodModal"
      title="Crear nuevo periodo"
      save-text="Crear periodo"
      @save="createPeriod"
    >
      <template #form>
        <v-text-field
          v-model="newPeriod.startDate"
          label="Fecha inicio"
          type="date"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="newPeriod.endDate"
          label="Fecha final"
          type="date"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="newPeriod.notes"
          label="Notas (opcional)"
          placeholder="Ej: Periodo quincenal"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        ></v-text-field>
      </template>
    </FormModal>

    <!-- Quick Movement Form -->
    <v-card class="mb-6">
      <v-card-title class="text-h6">Registrar movimiento rápido</v-card-title>
      <v-card-text>
        <v-form ref="movementForm" @submit.prevent="openConfirmModal">
          <v-row>
            <v-col cols="12" md="6" lg="4">
              <v-radio-group
                v-model="form.type"
                inline
                hide-details
              >
                <v-radio label="Ingreso" value="income"></v-radio>
                <v-radio label="Gasto" value="expense"></v-radio>
              </v-radio-group>
            </v-col>

            <v-col cols="12" md="6" lg="4">
              <v-text-field
                v-model="form.concept"
                label="Concepto"
                placeholder="Ej: Venta del día"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6" lg="4">
              <v-text-field
                v-model.number="form.amount"
                label="Monto"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6" lg="4">
              <v-select
                v-model="form.paymentMethod"
                :items="paymentMethods"
                label="Método de pago"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                required
              ></v-select>
            </v-col>

            <v-col cols="12" md="6" lg="4">
              <v-select
                v-model="form.periodId"
                :items="periodOptions"
                label="Periodo"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              ></v-select>
            </v-col>

            <v-col cols="12" class="d-flex justify-end">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                prepend-icon="mdi-content-save"
              >
                Guardar movimiento
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Summary Cards -->
    <SummaryCards :summary="summary" />

    <!-- Movements Table -->
    <MovementsTable
      class="mt-6"
      :movements="movements"
      :loading="loadingMovements"
      @edit="openEditModal"
      @delete="confirmDeleteMovement"
    />

    <!-- Confirm Movement Modal -->
    <ConfirmModal
      v-model="showConfirmModal"
      title="Confirmar movimiento"
      :items="confirmItems"
      @confirm="confirmSubmitMovement"
    />

    <!-- Edit Movement Modal -->
    <FormModal
      v-model="showEditModal"
      title="Editar movimiento"
      save-text="Guardar cambios"
      @save="updateMovement"
    >
      <template #form>
        <v-text-field
          v-model="editingMovement.concept"
          label="Concepto"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model.number="editingMovement.amount"
          label="Monto"
          type="number"
          min="0.01"
          step="0.01"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
        ></v-text-field>

        <v-radio-group
          v-model="editingMovement.type"
          inline
          hide-details
          class="mb-4"
        >
          <v-radio label="Ingreso" value="income"></v-radio>
          <v-radio label="Gasto" value="expense"></v-radio>
        </v-radio-group>

        <v-select
          v-model="editingMovement.paymentMethod"
          :items="paymentMethods"
          label="Método"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
        ></v-select>

        <v-select
          v-model="editingMovement.periodId"
          :items="periodOptions"
          label="Periodo"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        ></v-select>
      </template>
    </FormModal>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../services/api'
import PeriodCard from '../../components/common/PeriodCard.vue'
import ConfirmModal from '../../components/common/ConfirmModal.vue'
import FormModal from '../../components/common/FormModal.vue'
import SummaryCards from '../../components/balance/SummaryCards.vue'
import MovementsTable from '../../components/balance/MovementsTable.vue'

// Data
const periods = ref([])
const selectedPeriodId = ref(null)
const summary = ref(null)
const movements = ref([])
const loadingMovements = ref(false)

const showEditModal = ref(false)
const editingMovement = ref(null)

const form = ref({
  type: 'expense',
  concept: '',
  amount: null,
  paymentMethod: 'cash',
  periodId: null
})

const showCreatePeriodModal = ref(false)
const newPeriod = ref({
  startDate: '',
  endDate: '',
  notes: ''
})

const showConfirmModal = ref(false)
const pendingMovement = ref({
  type: '',
  concept: '',
  amount: 0,
  paymentMethod: '',
  periodId: null,
  periodLabel: ''
})

const movementForm = ref(null)

// Constants
const paymentMethods = [
  { title: 'Efectivo', value: 'cash' },
  { title: 'Tarjeta', value: 'card' }
]

// Computed
const formattedPeriods = computed(() => {
  return periods.value.map(p => ({
    ...p,
    label: formatPeriod(p.startDate, p.endDate)
  }))
})

const periodOptions = computed(() => {
  const options = formattedPeriods.value.map(p => ({
    title: p.label,
    value: p.id
  }))
  
  if (selectedPeriodId.value) {
    options.unshift({
      title: 'Periodo actual',
      value: selectedPeriodId.value
    })
  }
  
  return options
})

const confirmItems = computed(() => [
  {
    label: 'Tipo',
    value: pendingMovement.value.type === 'income' ? 'Ingreso' : 'Gasto',
    class: pendingMovement.value.type === 'income' ? 'text-success' : 'text-error'
  },
  { label: 'Concepto', value: pendingMovement.value.concept || '-' },
  { label: 'Monto', value: `$${number(pendingMovement.value.amount)}`, class: 'text-h6' },
  { label: 'Método', value: formatPaymentMethod(pendingMovement.value.paymentMethod) },
  { label: 'Periodo', value: pendingMovement.value.periodLabel || 'Usar periodo seleccionado' }
])

// Methods
const number = (v) => {
  if (v === null || v === undefined) return '0.00'
  return Number(v).toFixed(2)
}

const formatDate = (s) => {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0, 5)
}

const formatPeriod = (start, end) => {
  const a = new Date(start)
  const b = new Date(end)
  return `${a.getDate()}/${a.getMonth() + 1}/${a.getFullYear()} — ${b.getDate()}/${b.getMonth() + 1}/${b.getFullYear()}`
}

const formatPaymentMethod = (m) => {
  if (m === 'cash') return 'Efectivo'
  if (m === 'card') return 'Tarjeta'
  return m || '-'
}

const handlePeriodChange = (id) => {
  selectedPeriodId.value = id
  form.value.periodId = id
}

const loadPeriods = async ({ keepSelected = true, preferredId = null } = {}) => {
  try {
    const res = await api.get('/v1/periods')
    periods.value = res.data || []
    
    if (periods.value.length > 0) {
      const ids = periods.value.map(p => p.id)
      if (preferredId && ids.includes(preferredId)) {
        selectedPeriodId.value = preferredId
      } else if (keepSelected && selectedPeriodId.value && ids.includes(selectedPeriodId.value)) {
        // mantener selección actual
      } else {
        selectedPeriodId.value = periods.value[0].id
      }
      form.value.periodId = selectedPeriodId.value
    } else {
      selectedPeriodId.value = null
      form.value.periodId = null
    }
  } catch (err) {
    console.error('error loading periods', err)
  }
}

const loadMovements = async (periodId) => {
  if (!periodId) {
    movements.value = []
    return
  }
  
  loadingMovements.value = true
  try {
    const res = await api.get('/v1/period-movements', { params: { periodId } })
    movements.value = res.data || []
  } catch (err) {
    console.error('error loading movements', err)
  } finally {
    loadingMovements.value = false
  }
}

const loadSummary = async (periodId) => {
  if (!periodId) {
    summary.value = null
    return
  }
  
  try {
    const res = await api.get(`/v1/periods/${periodId}/summary`)
    summary.value = res.data || null
  } catch (err) {
    console.error('error loading summary', err)
    summary.value = null
  }
}

const refreshAll = async () => {
  if (!selectedPeriodId.value) return
  await Promise.all([
    loadMovements(selectedPeriodId.value),
    loadSummary(selectedPeriodId.value)
  ])
  form.value.periodId = selectedPeriodId.value
}

const submitMovement = async (payload = null) => {
  try {
    const finalPayload = payload ?? {
      type: form.value.type,
      concept: form.value.concept,
      amount: Number(form.value.amount),
      paymentMethod: form.value.paymentMethod,
      periodId: form.value.periodId || selectedPeriodId.value
    }

    await api.post('/v1/period-movements', finalPayload)

    // limpiar formulario
    form.value.concept = ''
    form.value.amount = null

    await loadPeriods({ keepSelected: true, preferredId: finalPayload.periodId })
    await refreshAll()
  } catch (err) {
    console.error('error creating movement', err)
  }
}

const openEditModal = (m) => {
  editingMovement.value = {
    id: m.id,
    type: m.type,
    concept: m.concept,
    amount: m.amount,
    paymentMethod: m.paymentMethod,
    periodId: m.periodId
  }
  showEditModal.value = true
}

const updateMovement = async () => {
  try {
    const m = editingMovement.value

    await api.patch(`/v1/period-movement/${m.id}`, {
      type: m.type,
      concept: m.concept,
      amount: Number(m.amount),
      paymentMethod: m.paymentMethod,
      periodId: m.periodId
    })

    showEditModal.value = false
    await loadPeriods({ keepSelected: true, preferredId: m.periodId })
    await refreshAll()
  } catch (err) {
    console.error(err)
  }
}

const confirmDeleteMovement = (m) => {
  if (confirm(`¿Eliminar movimiento "${m.concept}" por $${number(m.amount)}?`)) {
    deleteMovement(m.id)
  }
}

const deleteMovement = async (id) => {
  try {
    await api.delete(`/v1/period-movements/${id}`)
    await loadPeriods({ keepSelected: true, preferredId: selectedPeriodId.value })
    await refreshAll()
  } catch (err) {
    console.error(err)
  }
}

const openConfirmModal = () => {
  // Validar formulario
  const el = movementForm.value
  if (el && !el.validate()) return

  const chosenPeriodId = form.value.periodId || selectedPeriodId.value
  const periodObj = periods.value.find(p => p.id === chosenPeriodId)
  
  pendingMovement.value = {
    type: form.value.type,
    concept: form.value.concept,
    amount: Number(form.value.amount),
    paymentMethod: form.value.paymentMethod,
    periodId: chosenPeriodId,
    periodLabel: periodObj ? formatPeriod(periodObj.startDate, periodObj.endDate) : 'Usar periodo seleccionado'
  }

  showConfirmModal.value = true
}

const confirmSubmitMovement = async () => {
  const payload = {
    type: pendingMovement.value.type,
    concept: pendingMovement.value.concept,
    amount: Number(pendingMovement.value.amount),
    paymentMethod: pendingMovement.value.paymentMethod,
    periodId: pendingMovement.value.periodId
  }
  
  showConfirmModal.value = false
  await submitMovement(payload)
}

const createPeriod = async () => {
  try {
    if (!newPeriod.value.startDate || !newPeriod.value.endDate) {
      return
    }
    
    if (new Date(newPeriod.value.startDate) > new Date(newPeriod.value.endDate)) {
      return
    }

    const payload = {
      startDate: newPeriod.value.startDate,
      endDate: newPeriod.value.endDate,
      notes: newPeriod.value.notes || 'Creado desde UI'
    }

    const res = await api.post('/v1/periods', payload)
    const createdId = res.data?.id

    await loadPeriods({ preferredId: createdId ?? undefined })
    await refreshAll()
    showCreatePeriodModal.value = false
  } catch (err) {
    console.error('create period error', err)
  }
}

// Lifecycle
onMounted(async () => {
  await loadPeriods()
  if (selectedPeriodId.value) {
    await refreshAll()
  }
})

// Watchers
watch(selectedPeriodId, async (nv) => {
  if (!nv) return
  form.value.periodId = nv
  await refreshAll()
})
</script>
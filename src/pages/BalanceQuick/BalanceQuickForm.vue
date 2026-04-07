<template>
  <v-container class="pa-4">
    <!-- Periodo Section -->
    <PeriodCard
      :periods="formattedPeriods"
      :selected-period-id="selectedPeriodId"
      @update:selected="handlePeriodChange"
      @refresh="refreshAll"
      @open-create-modal="showCreatePeriodModal = true"
      @open-edit-modal="openEditPeriodModal"
    />

    <v-alert
      v-if="categoryLoadError"
      type="warning"
      variant="tonal"
      class="mb-4"
      density="comfortable"
    >
      No se pudieron cargar las categorias desde backend.
      <v-btn variant="text" color="warning" class="ml-2" @click="loadCategories">Reintentar</v-btn>
    </v-alert>

    <v-alert
      v-if="periodError"
      type="error"
      variant="tonal"
      class="mb-4"
      density="comfortable"
      closable
      @click:close="periodError = ''"
    >
      {{ periodError }}
    </v-alert>

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

    <!-- Edit Period Modal -->
    <FormModal
      v-model="showEditPeriodModal"
      title="Editar periodo"
      save-text="Guardar periodo"
      @save="updatePeriod"
    >
      <template #form>
        <v-text-field
          v-model="editingPeriod.startDate"
          label="Fecha inicio"
          type="date"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="editingPeriod.endDate"
          label="Fecha final"
          type="date"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="editingPeriod.notes"
          label="Notas (opcional)"
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
              <v-text-field
                v-model="form.movementDate"
                label="Fecha de transacción"
                type="date"
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
                v-model="form.categoryId"
                :items="categoryOptions"
                label="Categoria"
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

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Descripción (opcional)"
                placeholder="Detalle adicional de la transacción"
                rows="2"
                auto-grow
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              ></v-textarea>
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

        <v-text-field
          v-model="editingMovement.movementDate"
          label="Fecha de transacción"
          type="date"
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
          v-model="editingMovement.categoryId"
          :items="categoryOptions"
          label="Categoria"
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

        <v-textarea
          v-model="editingMovement.description"
          label="Descripción"
          rows="2"
          auto-grow
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mt-4"
        ></v-textarea>
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
import { formatCurrency } from '../../utils/formatters'

// Data
const periods = ref([])
const selectedPeriodId = ref(null)
const summary = ref(null)
const movements = ref([])
const loadingMovements = ref(false)
const categories = ref([])
const categoryLoadError = ref(false)

const showEditModal = ref(false)
const editingMovement = ref(null)

const showEditPeriodModal = ref(false)
const editingPeriod = ref({
  id: null,
  startDate: '',
  endDate: '',
  notes: ''
})
const periodError = ref('')

const form = ref({
  type: 'expense',
  concept: '',
  amount: null,
  movementDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'cash',
  categoryId: null,
  description: '',
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
  movementDate: '',
  paymentMethod: '',
  categoryId: null,
  description: '',
  periodId: null,
  periodLabel: '',
  categoryLabel: ''
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

const categoryOptions = computed(() => categories.value.map(c => ({
  title: c.name,
  value: c.id
})))

const confirmItems = computed(() => [
  {
    label: 'Tipo',
    value: pendingMovement.value.type === 'income' ? 'Ingreso' : 'Gasto',
    class: pendingMovement.value.type === 'income' ? 'text-success' : 'text-error'
  },
  { label: 'Concepto', value: pendingMovement.value.concept || '-' },
  { label: 'Monto', value: `$${formatCurrency(pendingMovement.value.amount)}`, class: 'text-h6' },
  { label: 'Fecha', value: pendingMovement.value.movementDate || '-' },
  { label: 'Categoria', value: pendingMovement.value.categoryLabel || '-' },
  { label: 'Método', value: formatPaymentMethod(pendingMovement.value.paymentMethod) },
  { label: 'Periodo', value: pendingMovement.value.periodLabel || 'Usar periodo seleccionado' },
  { label: 'Descripción', value: pendingMovement.value.description || '-' }
])

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

const loadCategories = async () => {
  try {
    const res = await api.get('/v1/transaction-categories')
    categories.value = res.data || []
    categoryLoadError.value = false

    if (!form.value.categoryId && categories.value.length) {
      const general = categories.value.find(c => c.slug === 'general')
      form.value.categoryId = general?.id || categories.value[0].id
    }
  } catch (err) {
    categoryLoadError.value = true
    console.error('error loading categories', err)
  }
}

const toDateInput = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const openEditPeriodModal = () => {
  const current = periods.value.find(p => p.id === selectedPeriodId.value)
  if (!current) return

  editingPeriod.value = {
    id: current.id,
    startDate: toDateInput(current.startDate),
    endDate: toDateInput(current.endDate),
    notes: current.notes || ''
  }

  periodError.value = ''
  showEditPeriodModal.value = true
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
      movementDate: form.value.movementDate,
      paymentMethod: form.value.paymentMethod,
      categoryId: form.value.categoryId,
      description: form.value.description || null,
      periodId: form.value.periodId || selectedPeriodId.value
    }

    await api.post('/v1/period-movements', finalPayload)

    // limpiar formulario
    form.value.concept = ''
    form.value.amount = null
    form.value.description = ''

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
    movementDate: m.movementDate,
    paymentMethod: m.paymentMethod,
    categoryId: m.categoryId,
    description: m.description || '',
    periodId: m.periodId
  }
  showEditModal.value = true
}

const updateMovement = async () => {
  try {
    const m = editingMovement.value

    await api.patch(`/v1/period-movements/${m.id}`, {
      type: m.type,
      concept: m.concept,
      amount: Number(m.amount),
      movementDate: m.movementDate,
      paymentMethod: m.paymentMethod,
      categoryId: m.categoryId,
      description: m.description || null,
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
  if (confirm(`¿Eliminar movimiento "${m.concept}" por $${formatCurrency(m.amount)}?`)) {
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

const openConfirmModal = async () => {
  // Validar formulario
  const el = movementForm.value
  if (el) {
    const validation = await el.validate()
    if (!validation.valid) return
  }

  const chosenPeriodId = form.value.periodId || selectedPeriodId.value
  const periodObj = periods.value.find(p => p.id === chosenPeriodId)
  const categoryObj = categories.value.find(c => c.id === form.value.categoryId)
  
  pendingMovement.value = {
    type: form.value.type,
    concept: form.value.concept,
    amount: Number(form.value.amount),
    movementDate: form.value.movementDate,
    paymentMethod: form.value.paymentMethod,
    categoryId: form.value.categoryId,
    description: form.value.description,
    periodId: chosenPeriodId,
    periodLabel: periodObj ? formatPeriod(periodObj.startDate, periodObj.endDate) : 'Usar periodo seleccionado',
    categoryLabel: categoryObj?.name || '-'
  }

  showConfirmModal.value = true
}

const confirmSubmitMovement = async () => {
  const payload = {
    type: pendingMovement.value.type,
    concept: pendingMovement.value.concept,
    amount: Number(pendingMovement.value.amount),
    movementDate: pendingMovement.value.movementDate,
    paymentMethod: pendingMovement.value.paymentMethod,
    categoryId: pendingMovement.value.categoryId,
    description: pendingMovement.value.description || null,
    periodId: pendingMovement.value.periodId
  }
  
  showConfirmModal.value = false
  await submitMovement(payload)
}

const createPeriod = async () => {
  try {
    periodError.value = ''

    if (!newPeriod.value.startDate || !newPeriod.value.endDate) {
      periodError.value = 'Debes capturar fecha de inicio y fecha final.'
      return
    }
    
    if (new Date(newPeriod.value.startDate) > new Date(newPeriod.value.endDate)) {
      periodError.value = 'La fecha de inicio no puede ser mayor a la fecha final.'
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
    newPeriod.value = { startDate: '', endDate: '', notes: '' }
  } catch (err) {
    periodError.value = err?.response?.data?.error || 'No se pudo crear el periodo.'
    console.error('create period error', err)
  }
}

const updatePeriod = async () => {
  try {
    periodError.value = ''

    if (!editingPeriod.value.startDate || !editingPeriod.value.endDate) {
      periodError.value = 'Debes capturar fecha de inicio y fecha final.'
      return
    }

    if (new Date(editingPeriod.value.startDate) > new Date(editingPeriod.value.endDate)) {
      periodError.value = 'La fecha de inicio no puede ser mayor a la fecha final.'
      return
    }

    await api.put(`/v1/periods/${editingPeriod.value.id}`, {
      startDate: editingPeriod.value.startDate,
      endDate: editingPeriod.value.endDate,
      notes: editingPeriod.value.notes || null
    })

    showEditPeriodModal.value = false
    await loadPeriods({ keepSelected: true, preferredId: editingPeriod.value.id })
    await refreshAll()
  } catch (err) {
    periodError.value = err?.response?.data?.error || 'No se pudo actualizar el periodo.'
    console.error('update period error', err)
  }
}

// Lifecycle
onMounted(async () => {
  await loadCategories()
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
<template>
  <v-container fluid class="pa-4 pa-md-6">
    <v-row class="mb-3">
      <v-col cols="12">
        <div class="hero-card">
          <div class="d-flex flex-wrap align-center ga-3">
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">Balance</h1>
              <p class="text-medium-emphasis mb-0">
                Registro de periodos y movimientos reales.
              </p>
            </div>
            <v-spacer />
            <v-btn
              variant="text"
              color="secondary"
              icon="mdi-help-circle-outline"
              @click="showHelpModal = true"
            />
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              @click="openMovementModal"
            >
              Nuevo movimiento
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="12">
        <PeriodCard
          :periods="formattedPeriods"
          :selected-period-id="selectedPeriodId"
          @update:selected="handlePeriodChange"
          @refresh="refreshAll"
          @open-create-modal="showCreatePeriodModal = true"
          @open-edit-modal="openEditPeriodModal"
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="categoryLoadError"
      type="warning"
      variant="tonal"
      class="mb-2"
      density="comfortable"
    >
      No se pudieron cargar las categorias desde backend.
      <v-btn variant="text" color="warning" class="ml-2" @click="loadCategories">Reintentar</v-btn>
    </v-alert>

    <v-alert
      v-if="periodError"
      type="error"
      variant="tonal"
      class="mb-2"
      density="comfortable"
      closable
      @click:close="periodError = ''"
    >
      {{ periodError }}
    </v-alert>

    <template v-if="selectedPeriodId">
      <v-row class="mb-3">
        <v-col cols="12">
          <SummaryCards :summary="summary" />
        </v-col>
      </v-row>

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

    <!-- Calendar expansion panel -->
    <v-row class="mb-3">
      <v-col cols="12">
        <v-expansion-panels variant="outlined" class="rounded-xl">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-calendar-month" size="small" />
                <span class="font-weight-medium">Calendario del periodo</span>
                <v-chip size="x-small" class="ml-2">{{ periodDayCount }} dias</v-chip>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="weekday-header">
                <div v-for="day in weekdayLabels" :key="day" class="weekday-cell">{{ day }}</div>
              </div>
              <div class="calendar-grid">
                <div
                  v-for="(cell, index) in calendarCells"
                  :key="`cal-${index}`"
                  class="cal-cell"
                  :class="{ 'cal-cell-empty': !cell.date, 'cal-cell-active': cell.date === selectedDate }"
                  @click="selectCalendarDate(cell.date)"
                >
                  <template v-if="cell.date">
                    <span class="text-caption font-weight-bold">{{ cell.day }}</span>
                    <div v-if="dayDots[cell.date]" class="d-flex ga-2 mt-1">
                      <span v-if="dayDots[cell.date].hasIncome" class="dot dot-income" />
                      <span v-if="dayDots[cell.date].hasExpense" class="dot dot-expense" />
                    </div>
                  </template>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Movements section with tabs -->
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" variant="outlined">
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div>
                <v-card-title class="text-h6 font-weight-bold">Movimientos</v-card-title>
                <v-card-subtitle>
                  <template v-if="selectedDate">Filtrado: {{ formatDate(selectedDate) }}</template>
                  <template v-else>{{ displayedMovements.length }} movimientos</template>
                </v-card-subtitle>
              </div>
              <div class="d-flex ga-1">
                <v-btn
                  v-if="selectedDate"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="selectedDate = ''"
                />
                <v-btn
                  icon="mdi-calendar"
                  size="x-small"
                  variant="tonal"
                  :color="movementSort === 'date' ? 'primary' : undefined"
                  @click="movementSort = 'date'"
                />
                <v-btn
                  icon="mdi-cash"
                  size="x-small"
                  variant="tonal"
                  :color="movementSort === 'amount' ? 'primary' : undefined"
                  @click="movementSort = 'amount'"
                />
              </div>
            </div>
          </v-card-item>

          <v-tabs v-model="listTab" density="compact" class="px-4">
            <v-tab value="all">Todos</v-tab>
            <v-tab value="income">Ingresos</v-tab>
            <v-tab value="expense">Gastos</v-tab>
          </v-tabs>

          <v-card-text>
            <MovementsTable
              :movements="displayedMovements"
              :loading="loadingMovements"
              @edit="openEditModal"
              @delete="confirmDeleteMovement"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    </template>
    <template v-else>
      <v-row class="mb-3">
        <v-col cols="12">
          <v-card rounded="xl" variant="outlined">
            <v-card-text class="text-center py-8">
              <v-icon icon="mdi-calendar-alert" size="48" color="medium-emphasis" class="mb-3" />
              <p class="text-h6 font-weight-medium mb-2">Sin periodo para hoy</p>
              <p class="text-medium-emphasis">
                No existe un periodo que contenga la fecha de hoy.
                Crea uno nuevo desde el selector de periodo.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <v-dialog v-model="showMovementModal" max-width="640px">
      <v-card rounded="xl">
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <v-card-title class="text-h6 font-weight-bold">Nuevo movimiento</v-card-title>
            <v-btn icon variant="text" size="small" @click="showMovementModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-item>
        <v-divider />
        <v-card-text class="pt-4">
          <v-form ref="movementForm" @submit.prevent="openConfirmModal">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.concept"
                  label="Concepto"
                  placeholder="Ej: Venta del dia"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.amount"
                  label="Monto"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.movementDate"
                  label="Fecha de transaccion"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  required
                  :min="periodDateMin"
                  :max="periodDateMax"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-radio-group v-model="form.type" inline hide-details>
                  <v-radio label="Ingreso" value="income" />
                  <v-radio label="Gasto" value="expense" />
                </v-radio-group>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.paymentMethod"
                  :items="paymentMethods"
                  label="Metodo"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.categoryId"
                  :items="categoryOptions"
                  label="Categoria"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="currentPeriodLabel"
                  label="Periodo"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  disabled
                  prepend-icon="mdi-lock-outline"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="form.description"
                  label="Descripcion (opcional)"
                  rows="1"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showMovementModal = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="openConfirmModal">Continuar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          label="Fecha de transaccion"
          type="date"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
          :min="editingPeriodDateMin"
          :max="editingPeriodDateMax"
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
    <v-dialog v-model="showHelpModal" max-width="520px">
      <v-card rounded="xl">
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <v-card-title class="text-h6 font-weight-bold">
              <v-icon start icon="mdi-help-circle-outline" color="primary" />
              Como usar Balance
            </v-card-title>
            <v-btn icon variant="text" size="small" @click="showHelpModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-item>
        <v-divider />
        <v-card-text class="pt-4">
          <p class="text-body-2 mb-3">
            <strong>Balance</strong> te permite registrar periodos y movimientos reales
            (ingresos y gastos) conectados a base de datos.
          </p>
          <div v-for="item in helpSections" :key="item.title" class="mb-4">
            <div class="d-flex align-center ga-2 mb-1">
              <v-icon :icon="item.icon" size="small" color="primary" />
              <span class="font-weight-bold text-body-2">{{ item.title }}</span>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-0 ml-7">{{ item.text }}</p>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="elevated" @click="showHelpModal = false">Entendido</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const showMovementModal = ref(false)
const showHelpModal = ref(false)
const listTab = ref('all')
const movementSort = ref('date')
const selectedDate = ref('')

// Constants
const weekdayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const paymentMethods = [
  { title: 'Efectivo', value: 'cash' },
  { title: 'Tarjeta', value: 'card' }
]

const helpSections = [
  {
    icon: 'mdi-calendar-plus',
    title: 'Periodos',
    text: 'Crea o selecciona un periodo (semanal, quincenal, mensual o personalizado). Los movimientos se agrupan por periodo.'
  },
  {
    icon: 'mdi-plus-circle-outline',
    title: 'Nuevo movimiento',
    text: 'Usa el boton "Nuevo movimiento" para registrar un ingreso o gasto. Completa concepto, monto, fecha, metodo, categoria y periodo.'
  },
  {
    icon: 'mdi-calendar-month-outline',
    title: 'Calendario del periodo',
    text: 'Panel colapsable que muestra un mapa de dias del periodo con indicadores de ingresos (verde) y gastos (rojo).'
  },
  {
    icon: 'mdi-view-list-outline',
    title: 'Tabs y filtros',
    text: 'Filtra movimientos por Todos, Ingresos o Gastos. Ordena por fecha o por monto. Usa el calendario para filtrar por dia.'
  },
  {
    icon: 'mdi-chart-box-outline',
    title: 'Resumen',
    text: 'Las tarjetas superiores muestran el total de ingresos, gastos, balance y la categoria con mayor gasto.'
  }
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

const currentPeriod = computed(() => {
  return periods.value.find(p => p.id === selectedPeriodId.value) || null
})

const periodDateMin = computed(() => {
  if (!currentPeriod.value) return ''
  return toDateInput(currentPeriod.value.startDate)
})

const periodDateMax = computed(() => {
  if (!currentPeriod.value) return ''
  return toDateInput(currentPeriod.value.endDate)
})

const currentPeriodLabel = computed(() => {
  if (!currentPeriod.value) return 'Sin periodo seleccionado'
  return formatPeriod(currentPeriod.value.startDate, currentPeriod.value.endDate)
})

const editingPeriodDateMin = computed(() => {
  if (!editingMovement.value?.periodId) return ''
  const p = periods.value.find(p => p.id === editingMovement.value.periodId)
  return p ? toDateInput(p.startDate) : ''
})

const editingPeriodDateMax = computed(() => {
  if (!editingMovement.value?.periodId) return ''
  const p = periods.value.find(p => p.id === editingMovement.value.periodId)
  return p ? toDateInput(p.endDate) : ''
})

const periodDayCount = computed(() => {
  if (!currentPeriod.value) return 0
  const start = new Date(currentPeriod.value.startDate)
  const end = new Date(currentPeriod.value.endDate)
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 0
})

const calendarCells = computed(() => {
  if (!currentPeriod.value) return []
  const start = new Date(currentPeriod.value.startDate)
  const end = new Date(currentPeriod.value.endDate)
  const firstWeekday = (start.getDay() + 6) % 7
  const leading = Array.from({ length: firstWeekday }, () => ({ date: null }))

  const days = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10)
    days.push({
      date: iso,
      day: cursor.getDate(),
      month: cursor.toLocaleDateString('es-MX', { month: 'short' })
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return [...leading, ...days]
})

const dayDots = computed(() => {
  const map = {}
  movements.value.forEach(m => {
    const date = toDateInput(m.movementDate)
    if (!date) return
    if (!map[date]) map[date] = { hasIncome: false, hasExpense: false }
    const type = String(m.type || '').trim().toLowerCase()
    if (type === 'income') map[date].hasIncome = true
    if (type === 'expense') map[date].hasExpense = true
  })
  return map
})

const displayedMovements = computed(() => {
  let result = [...movements.value]

  if (selectedDate.value) {
    result = result.filter(m => toDateInput(m.movementDate) === selectedDate.value)
  }

  if (listTab.value === 'income') {
    result = result.filter(m => m.type === 'income')
  } else if (listTab.value === 'expense') {
    result = result.filter(m => m.type === 'expense')
  }

  if (movementSort.value === 'amount') {
    result.sort((a, b) => Number(b.amount) - Number(a.amount))
  } else {
    result.sort((a, b) => {
      const da = String(a.movementDate || '')
      const db = String(b.movementDate || '')
      return db.localeCompare(da)
    })
  }

  return result
})

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
  const str = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const d = new Date(str)
  if (Number.isNaN(d.getTime())) return str.slice(0, 10)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
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
        // mantener seleccion actual
      } else {
        const today = new Date().toISOString().slice(0, 10)
        const todayPeriod = periods.value.find(p => {
          const start = toDateInput(p.startDate)
          const end = toDateInput(p.endDate)
          return today >= start && today <= end
        })
        selectedPeriodId.value = todayPeriod?.id || null
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
    periodError.value = ''

    const period = periods.value.find(p => p.id === m.periodId)
    if (period) {
      const date = toDateInput(m.movementDate)
      const start = toDateInput(period.startDate)
      const end = toDateInput(period.endDate)
      if (date < start || date > end) {
        periodError.value = 'La fecha del movimiento debe estar dentro del rango del periodo seleccionado.'
        return
      }
    }

    await api.patch(`/v1/period-movements/${m.id}`, {
      type: m.type,
      concept: m.concept,
      amount: Number(m.amount),
    movementDate: toDateInput(m.movementDate),
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

const openMovementModal = () => {
  showMovementModal.value = true
}

const selectCalendarDate = (date) => {
  if (!date) return
  selectedDate.value = date
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

<style scoped>
.hero-card {
  border-radius: 18px;
  border: 1px solid var(--color-border);
  padding: 20px;
  background: linear-gradient(135deg, var(--color-surface), color-mix(in srgb, var(--color-info) 8%, var(--color-surface)));
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 4px;
}

.weekday-cell {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.cal-cell {
  min-height: 52px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 4px 6px;
  cursor: pointer;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  transition: transform 0.1s ease, border-color 0.1s ease;
}

.cal-cell:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
}

.cal-cell-empty {
  border-style: dashed;
  cursor: default;
  background: transparent;
}

.cal-cell-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-income {
  background: var(--color-success, #4caf50);
}

.dot-expense {
  background: var(--color-error, #d32f2f);
}
</style>
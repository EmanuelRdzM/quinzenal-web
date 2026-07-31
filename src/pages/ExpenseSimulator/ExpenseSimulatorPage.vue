<template>
  <v-container fluid class="pa-4 pa-md-6 simulator-page">
    <v-row class="mb-3">
      <v-col cols="12">
        <div class="hero-card">
          <div class="d-flex flex-wrap align-center ga-3">
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">Simulador de gastos</h1>
              <p class="text-medium-emphasis mb-0">
                Planea pagos futuros sin afectar tus movimientos reales.
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
              variant="tonal"
              color="primary"
              prepend-icon="mdi-content-save-outline"
              @click="saveSimulation"
            >
              Guardar
            </v-btn>
            <v-btn
              variant="tonal"
              color="info"
              prepend-icon="mdi-file-pdf-box"
              @click="exportSimulationPdf"
            >
              Exportar
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              prepend-icon="mdi-delete-outline"
              @click="resetSimulation"
            >
              Limpiar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="12">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <v-card-title class="text-h6 font-weight-bold">Escenario</v-card-title>
            <v-card-subtitle>Define ingreso y rango del periodo</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="scenario.periodType"
                  :items="periodTypeOptions"
                  label="Tipo de periodo"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="scenario.income"
                  type="number"
                  min="0"
                  step="0.01"
                  label="Ingreso esperado"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="scenario.startDate"
                  type="date"
                  label="Fecha inicio"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="scenario.endDate"
                  type="date"
                  label="Fecha fin"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :disabled="scenario.periodType !== 'custom'"
                  :min="customEndMin"
                  :max="customEndMax"
                />
              </v-col>
            </v-row>

            <v-alert
              v-if="periodError"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mt-4"
            >
              {{ periodError }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="12" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Ingreso esperado</div>
            <div class="text-h5 font-weight-bold text-success">{{ $formatCurrency(scenario.income || 0) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Gasto esperado</div>
            <div class="text-h5 font-weight-bold text-error">{{ $formatCurrency(totalExpectedExpense) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Saldo proyectado</div>
            <div class="text-h5 font-weight-bold" :class="remainingBalance >= 0 ? 'text-success' : 'text-error'">
              {{ $formatCurrency(remainingBalance) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Uso del ingreso</div>
            <div class="text-h5 font-weight-bold text-primary">{{ usagePercent.toFixed(1) }}%</div>
            <div class="text-caption text-medium-emphasis mt-1">
              Promedio diario: {{ $formatCurrency(avgDailyExpense) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <div class="d-flex align-center justify-space-between flex-wrap ga-3">
              <div>
                <v-card-title class="text-h6 font-weight-bold">Calendario del periodo</v-card-title>
                <v-card-subtitle>
                  {{ periodLabel }} • {{ periodDays.length }} días
                </v-card-subtitle>
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                variant="tonal"
                @click="openEventModal()"
              >
                Agregar pago
              </v-btn>
            </div>
          </v-card-item>
          <v-card-text>
            <div class="weekday-header">
              <div v-for="day in weekdayLabels" :key="day" class="weekday-cell">{{ day }}</div>
            </div>

            <div class="calendar-grid">
              <div
                v-for="(cell, index) in calendarCells"
                :key="`cell-${index}`"
                class="calendar-cell"
                :class="{ 'calendar-cell-empty': !cell.date, 'calendar-cell-active': cell.date === eventForm.date }"
                @click="selectDate(cell.date)"
              >
                <template v-if="cell.date">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-bold">{{ cell.day }}</span>
                    <span class="text-caption text-medium-emphasis">{{ cell.month }}</span>
                  </div>
                  <div v-if="eventsByDate[cell.date]?.length" class="event-stack">
                    <div
                      v-for="evt in eventsByDate[cell.date].slice(0, 2)"
                      :key="evt.id"
                      :class="['event-pill', `event-pill--${(evt.priority || 'Media').toLowerCase()}`]"
                    >
                      <span class="truncate">{{ evt.concept }}</span>
                      <strong>{{ $formatCurrency(evt.amount) }}</strong>
                    </div>
                    <div
                      v-if="eventsByDate[cell.date].length > 2"
                      class="text-caption text-medium-emphasis mt-1"
                    >
                      +{{ eventsByDate[cell.date].length - 2 }} más
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div>
                <v-card-title class="text-h6 font-weight-bold">Pagos planeados</v-card-title>
                <v-card-subtitle>{{ displayedEvents.length }} eventos</v-card-subtitle>
              </div>
              <div v-if="listTab === 'all'" class="d-flex ga-1">
                <v-btn
                  icon="mdi-calendar"
                  size="x-small"
                  variant="tonal"
                  :color="paymentSort === 'date' ? 'primary' : undefined"
                  @click="paymentSort = 'date'"
                />
                <v-btn
                  icon="mdi-flag"
                  size="x-small"
                  variant="tonal"
                  :color="paymentSort === 'priority' ? 'primary' : undefined"
                  @click="paymentSort = 'priority'"
                />
              </div>
            </div>
          </v-card-item>

          <v-tabs v-model="listTab" density="compact" class="px-4">
            <v-tab value="date" @click="switchToDateTab">Por fecha</v-tab>
            <v-tab value="all">Todos</v-tab>
          </v-tabs>

          <v-card-text>
            <v-list v-if="displayedEvents.length" density="comfortable" class="px-0 py-0">
              <v-list-item
                v-for="evt in displayedEvents"
                :key="evt.id"
                class="px-0"
              >
                <v-list-item-title class="font-weight-medium">{{ evt.concept }}</v-list-item-title>
                <v-list-item-subtitle>
                  <span class="d-flex align-center ga-1">
                    <v-icon
                      :color="priorityColor(evt.priority)"
                      size="10"
                      icon="mdi-circle"
                    />
                    {{ formatDate(evt.date) }} • {{ evt.category }} • {{ evt.priority }}
                  </span>
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex align-center ga-2">
                    <span class="text-caption font-weight-bold text-error">{{ $formatCurrency(evt.amount) }}</span>
                    <v-btn
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="removeEvent(evt.id)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <div v-else class="text-center py-6">
              <p class="text-medium-emphasis text-caption">
                {{ emptyListMessage }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="showEventModal" max-width="560px">
      <v-card rounded="xl">
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <v-card-title class="text-h6 font-weight-bold">Agregar pago</v-card-title>
            <v-btn icon variant="text" size="small" @click="showEventModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-item>
        <v-divider />
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="eventForm.date"
                type="date"
                label="Fecha"
                variant="outlined"
                density="comfortable"
                hide-details
                :min="scenario.startDate"
                :max="scenario.endDate"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="eventForm.amount"
                type="number"
                min="0"
                step="0.01"
                label="Monto"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="eventForm.concept"
                label="Concepto"
                placeholder="Ej: Renta"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="eventForm.category"
                :items="categoryOptions"
                label="Categoria"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="eventForm.priority"
                :items="priorityOptions"
                label="Prioridad"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="eventError"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mt-4"
            closable
            @click:close="eventError = ''"
          >
            {{ eventError }}
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEventModal = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="addEvent">Agregar pago</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showHelpModal" max-width="820px">
      <v-card rounded="xl">
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <v-card-title class="text-h6 font-weight-bold">
              <v-icon start icon="mdi-help-circle-outline" color="primary" />
              Como usar el simulador
            </v-card-title>
            <v-btn icon variant="text" size="small" @click="showHelpModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-item>
        <v-divider />
        <v-card-text class="pt-4">
          <p class="text-body-2 mb-3">
            El <strong>Simulador de gastos</strong> te permite planear pagos futuros
            sin afectar tus movimientos reales. Es una herramienta de proyeccion local.
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
import { computed, onMounted, ref, watch } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const STORAGE_KEY = 'expense-simulator:v1'

const periodTypeOptions = [
  { title: 'Semanal (7 días)', value: 'weekly' },
  { title: 'Quincenal (15 días)', value: 'biweekly' },
  { title: 'Mensual (30 días)', value: 'monthly' },
  { title: 'Personalizado', value: 'custom' }
]

const categoryOptions = [
  'Vivienda',
  'Comida',
  'Transporte',
  'Servicios',
  'Salud',
  'Educación',
  'Deudas',
  'Otros'
]

const priorityOptions = ['Baja', 'Media', 'Alta']
const weekdayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const scenario = ref({
  periodType: 'biweekly',
  startDate: todayIso(),
  endDate: addDaysIso(todayIso(), 14),
  income: 0
})

const simulationEvents = ref([])

const eventForm = ref({
  date: todayIso(),
  concept: '',
  amount: null,
  category: 'Otros',
  priority: 'Media'
})

const eventError = ref('')
const showEventModal = ref(false)
const showHelpModal = ref(false)

const helpSections = [
  {
    icon: 'mdi-cog-outline',
    title: 'Escenario',
    text: 'Define el tipo de periodo (semanal, quincenal, mensual o personalizado) y tu ingreso esperado. El periodo personalizado requiere minimo 7 dias y maximo 365.'
  },
  {
    icon: 'mdi-plus-circle-outline',
    title: 'Agregar pago',
    text: 'Usa el boton "Agregar pago" en el calendario para registrar un pago simulado. Asigna concepto, monto, categoria y prioridad (Alta, Media, Baja).'
  },
  {
    icon: 'mdi-calendar-month-outline',
    title: 'Calendario del periodo',
    text: 'Visualiza tus pagos en el calendario. Cada pago se colorea segun su prioridad. Haz clic en un dia para filtrar los pagos de esa fecha.'
  },
  {
    icon: 'mdi-view-list-outline',
    title: 'Pestañas Por fecha / Todos',
    text: '"Por fecha" muestra los pagos del dia seleccionado. "Todos" muestra la lista completa y te permite ordenar por fecha o por prioridad.'
  },
  {
    icon: 'mdi-file-pdf-box',
    title: 'Exportar',
    text: 'Genera un PDF con el resumen de tu escenario y la lista de pagos planeados para compartir o archivar.'
  },
  {
    icon: 'mdi-content-save-outline',
    title: 'Guardar',
    text: 'Los datos se guardan automaticamente en tu navegador. Usa el boton Guardar para asegurar que los cambios persistan.'
  }
]
const listTab = ref('all')
const paymentSort = ref('date')

const periodError = computed(() => {
  if (!scenario.value.startDate || !scenario.value.endDate) return 'Debes definir fecha inicio y fecha fin.'
  if (scenario.value.endDate < scenario.value.startDate) return 'La fecha final no puede ser menor a la fecha inicial.'

  if (scenario.value.periodType === 'custom') {
    const start = parseDate(scenario.value.startDate)
    const end = parseDate(scenario.value.endDate)
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24))
    if (diffDays < 6) return 'El periodo personalizado debe ser de al menos 7 días (1 semana).'
    if (diffDays > 365) return 'El periodo personalizado no puede exceder 365 días (12 meses).'
  }

  return ''
})

const periodDays = computed(() => {
  if (periodError.value) return []
  return enumerateDates(scenario.value.startDate, scenario.value.endDate)
})

const customEndMin = computed(() => addDaysIso(scenario.value.startDate, 6))
const customEndMax = computed(() => addDaysIso(scenario.value.startDate, 365))

const periodLabel = computed(() =>
  `${formatDate(scenario.value.startDate)} - ${formatDate(scenario.value.endDate)}`
)

const eventsByDate = computed(() => {
  return simulationEvents.value.reduce((acc, evt) => {
    if (!acc[evt.date]) acc[evt.date] = []
    acc[evt.date].push(evt)
    return acc
  }, {})
})

const calendarCells = computed(() => {
  if (!periodDays.value.length) return []

  const firstDate = parseDate(periodDays.value[0])
  const firstWeekdayMondayBase = (firstDate.getDay() + 6) % 7
  const leading = Array.from({ length: firstWeekdayMondayBase }, () => ({ date: null }))

  const days = periodDays.value.map((iso) => {
    const d = parseDate(iso)
    return {
      date: iso,
      day: d.getDate(),
      month: d.toLocaleDateString('es-MX', { month: 'short' })
    }
  })

  return [...leading, ...days]
})

const sortedEvents = computed(() => {
  return [...simulationEvents.value].sort((a, b) => {
    const dateDiff = a.date.localeCompare(b.date)
    if (dateDiff !== 0) return dateDiff
    return Number(a.amount) - Number(b.amount)
  })
})

const priorityOrderMap = { Alta: 0, Media: 1, Baja: 2 }

const displayedEvents = computed(() => {
  let events = [...simulationEvents.value]

  if (listTab.value === 'date' && eventForm.value.date) {
    events = events.filter(evt => evt.date === eventForm.value.date)
  }

  if (listTab.value === 'date' || paymentSort.value === 'priority') {
    events.sort((a, b) => {
      const pDiff = (priorityOrderMap[a.priority] ?? 1) - (priorityOrderMap[b.priority] ?? 1)
      if (pDiff !== 0) return pDiff
      return a.date.localeCompare(b.date)
    })
  } else {
    events.sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date)
      if (dateDiff !== 0) return dateDiff
      return Number(a.amount) - Number(b.amount)
    })
  }

  return events
})

const emptyListMessage = computed(() => {
  if (listTab.value === 'date' && !eventForm.value.date) return 'Selecciona un dia en el calendario'
  if (listTab.value === 'date') return 'Sin pagos para esta fecha'
  if (simulationEvents.value.length === 0) return 'Sin pagos planeados'
  return ''
})

const totalExpectedExpense = computed(() =>
  simulationEvents.value.reduce((sum, evt) => sum + Number(evt.amount || 0), 0)
)

const remainingBalance = computed(() => Number(scenario.value.income || 0) - totalExpectedExpense.value)

const usagePercent = computed(() => {
  const income = Number(scenario.value.income || 0)
  if (income <= 0) return 0
  return (totalExpectedExpense.value / income) * 100
})

const avgDailyExpense = computed(() => {
  const days = periodDays.value.length || 1
  return totalExpectedExpense.value / days
})

watch(
  () => scenario.value.periodType,
  (type) => {
    if (!scenario.value.startDate) {
      scenario.value.startDate = todayIso()
    }

    if (type === 'custom') return

    const lengthMap = {
      weekly: 6,
      biweekly: 14,
      monthly: 29
    }

    const offset = lengthMap[type] ?? 14
    scenario.value.endDate = addDaysIso(scenario.value.startDate, offset)
  }
)

watch(
  () => scenario.value.startDate,
  (start) => {
    if (!start || scenario.value.periodType === 'custom') return

    const lengthMap = {
      weekly: 6,
      biweekly: 14,
      monthly: 29
    }

    const offset = lengthMap[scenario.value.periodType] ?? 14
    scenario.value.endDate = addDaysIso(start, offset)
  }
)

watch(
  () => [scenario.value.startDate, scenario.value.endDate],
  () => {
    const inRange = isDateInsidePeriod(eventForm.value.date)
    if (!inRange && periodDays.value.length) {
      eventForm.value.date = periodDays.value[0]
    }
  }
)

function addEvent() {
  eventError.value = ''

  if (periodError.value) {
    eventError.value = periodError.value
    return
  }

  const amount = Number(eventForm.value.amount)
  if (!eventForm.value.date || !eventForm.value.concept.trim() || Number.isNaN(amount) || amount <= 0) {
    eventError.value = 'Completa fecha, concepto y monto mayor a 0.'
    return
  }

  if (!isDateInsidePeriod(eventForm.value.date)) {
    eventError.value = 'La fecha del pago debe estar dentro del periodo.'
    return
  }

  simulationEvents.value.push({
    id: crypto.randomUUID(),
    date: eventForm.value.date,
    concept: eventForm.value.concept.trim(),
    amount,
    category: eventForm.value.category,
    priority: eventForm.value.priority
  })

  eventForm.value.concept = ''
  eventForm.value.amount = null
  showEventModal.value = false
  saveSimulation()
}

function removeEvent(id) {
  simulationEvents.value = simulationEvents.value.filter(evt => evt.id !== id)
  saveSimulation()
}

function selectDate(date) {
  if (!date) return
  eventForm.value.date = date
  eventError.value = ''
  listTab.value = 'date'
}

function openEventModal() {
  eventError.value = ''
  if (!isDateInsidePeriod(eventForm.value.date) && periodDays.value.length) {
    eventForm.value.date = periodDays.value[0]
  }
  showEventModal.value = true
}

function switchToDateTab() {
  listTab.value = 'date'
  paymentSort.value = 'date'
}

function priorityColor(priority) {
  const map = { Alta: 'error', Media: 'warning', Baja: 'success' }
  return map[priority] || 'grey'
}

function saveSimulation() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    scenario: scenario.value,
    simulationEvents: simulationEvents.value
  }))
}

function resetSimulation() {
  scenario.value = {
    periodType: 'biweekly',
    startDate: todayIso(),
    endDate: addDaysIso(todayIso(), 14),
    income: 0
  }
  simulationEvents.value = []
  eventForm.value = {
    date: todayIso(),
    concept: '',
    amount: null,
    category: 'Otros',
    priority: 'Media'
  }
  saveSimulation()
}

function hydrateSimulation() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return

  try {
    const parsed = JSON.parse(raw)
    if (parsed?.scenario) {
      scenario.value = {
        ...scenario.value,
        ...parsed.scenario
      }
    }

    if (Array.isArray(parsed?.simulationEvents)) {
      simulationEvents.value = parsed.simulationEvents
    }

    if (!isDateInsidePeriod(eventForm.value.date) && periodDays.value.length) {
      eventForm.value.date = periodDays.value[0]
    }
  } catch (err) {
    console.error('Error loading simulation from storage', err)
  }
}

function isDateInsidePeriod(dateIso) {
  if (!dateIso || periodError.value) return false
  return dateIso >= scenario.value.startDate && dateIso <= scenario.value.endDate
}

function enumerateDates(startIso, endIso) {
  const dates = []
  const start = parseDate(startIso)
  const end = parseDate(endIso)
  const cursor = new Date(start)

  while (cursor <= end) {
    dates.push(toIsoDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

function parseDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayIso() {
  return toIsoDate(new Date())
}

function addDaysIso(baseIso, daysToAdd) {
  const date = parseDate(baseIso)
  date.setDate(date.getDate() + Number(daysToAdd || 0))
  return toIsoDate(date)
}

function formatDate(iso) {
  if (!iso) return ''
  const date = parseDate(iso)
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatCurrencyValue(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0))
}

function periodTypeLabel(value) {
  return periodTypeOptions.find(option => option.value === value)?.title || value
}

function exportSimulationPdf() {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const today = new Date().toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
  const primaryColor = [26, 58, 92]
  const accentGold = [200, 160, 60]

  doc.setProperties({
    title: 'Simulador de Gastos',
    author: 'Cash Flow',
    creator: 'Cash Flow'
  })

  // Banner
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setDrawColor(...accentGold)
  doc.setLineWidth(1)
  doc.line(0, 30, pageWidth, 30)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text('Cash Flow', margin, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Simulador de Gastos', margin, 21)

  doc.setFontSize(8)
  doc.text(`Generado: ${today}`, pageWidth - margin, 21, { align: 'right' })

  // Datos del escenario
  let y = 38
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...primaryColor)
  doc.text('Datos del Escenario', margin, y)

  y += 4
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)

  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)

  const scenarioLines = [
    { label: 'Tipo de periodo', value: periodTypeLabel(scenario.value.periodType) },
    { label: 'Inicio', value: formatDate(scenario.value.startDate) },
    { label: 'Fin', value: formatDate(scenario.value.endDate) },
    { label: 'Dias', value: String(periodDays.value.length) },
    { label: 'Pagos planeados', value: String(simulationEvents.value.length) }
  ]

  for (const line of scenarioLines) {
    doc.setFont('helvetica', 'bold')
    doc.text(`${line.label}:`, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(line.value, margin + 32, y)
    y += 5.5
  }

  // Proyeccion financiera
  y += 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...primaryColor)
  doc.text('Proyeccion Financiera', margin, y)

  y += 4
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)

  y += 8

  const kpiLines = [
    { label: 'Ingreso esperado', value: formatCurrencyValue(scenario.value.income), color: [60, 60, 60] },
    { label: 'Gasto esperado', value: formatCurrencyValue(totalExpectedExpense.value), color: [60, 60, 60] },
    { label: 'Saldo proyectado', value: formatCurrencyValue(remainingBalance.value), color: remainingBalance.value >= 0 ? [27, 94, 32] : [183, 28, 28] },
    { label: 'Promedio diario', value: formatCurrencyValue(avgDailyExpense.value), color: [60, 60, 60] }
  ]

  doc.setFontSize(9)
  for (let i = 0; i < kpiLines.length; i++) {
    const kpi = kpiLines[i]
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(`${kpi.label}:`, margin + 2, y)
    doc.setTextColor(...kpi.color)
    doc.setFont('helvetica', 'bold')
    doc.text(kpi.value, pageWidth - margin, y, { align: 'right' })
    y += 6
    if (i < kpiLines.length - 1) {
      doc.setDrawColor(235, 235, 235)
      doc.setLineWidth(0.3)
      doc.line(margin + 2, y - 3, pageWidth - margin, y - 3)
    }
  }

  // Barra de uso del ingreso
  y += 4
  const usagePct = Math.min(usagePercent.value, 100)
  const barX = margin + 2
  const barW = pageWidth - 2 * margin - 4
  const barH = 4
  const barY = y

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  const usageLabel = `Uso del ingreso: ${usagePercent.value.toFixed(1)}%`
  const labelWidth = doc.getTextWidth(usageLabel)
  doc.text(usageLabel, barX, barY - 1.5)

  const barBgY = barY + 2
  doc.setFillColor(230, 230, 230)
  doc.setDrawColor(210, 210, 210)
  doc.roundedRect(barX, barBgY, barW, barH, 2, 2, 'FD')

  const filledW = Math.max((barW * usagePct) / 100, usagePct > 0 ? 4 : 0)
  const barColor = usagePct > 90 ? [183, 28, 28] : usagePct > 60 ? [245, 124, 0] : [27, 94, 32]
  doc.setFillColor(...barColor)
  doc.roundedRect(barX, barBgY, filledW, barH, 2, 2, 'F')

  y = barBgY + barH + 6

  // Pagos planeados
  if (y > pageHeight - 80) { doc.addPage(); y = 22 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...primaryColor)
  doc.text('Pagos Planeados', margin, y)

  y += 4
  doc.setDrawColor(...accentGold)
  doc.setLineWidth(0.6)
  doc.line(margin, y, pageWidth - margin, y)
  y += 4

  const paymentRows = sortedEvents.value.map((event, index) => [
    String(index + 1),
    formatDate(event.date),
    event.concept || '-',
    event.category || '-',
    event.priority || '-',
    formatCurrencyValue(event.amount)
  ])

  if (!paymentRows.length) {
    paymentRows.push(['-', '-', 'Sin pagos planeados', '-', '-', formatCurrencyValue(0)])
  }

  const priorityColorMap = { Alta: [183, 28, 28], Media: [245, 124, 0], Baja: [27, 94, 32] }

  autoTable(doc, {
    startY: y,
    head: [['#', 'Fecha', 'Concepto', 'Categoria', 'Prioridad', 'Monto']],
    body: paymentRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 22 },
      2: { cellWidth: 44 },
      3: { cellWidth: 24 },
      4: { cellWidth: 18, halign: 'center' },
      5: { halign: 'right', cellWidth: 28 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const priority = data.cell.raw
        const pc = priorityColorMap[priority]
        if (pc) {
          data.cell.styles.textColor = pc
          data.cell.styles.fontStyle = 'bold'
        }
      }
      if (data.section === 'body' && data.column.index === 5) {
        data.cell.styles.textColor = [183, 28, 28]
      }
    },
    didDrawPage: () => {
      const bottom = pageHeight - 12
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.5)
      doc.line(margin, bottom - 4, pageWidth - margin, bottom - 4)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text('Cash Flow - Simulador de Gastos', pageWidth / 2, bottom, { align: 'center' })
      doc.text(`Pagina ${doc.getNumberOfPages()}`, pageWidth - margin, bottom, { align: 'right' })
    },
    margin: { left: margin, right: margin }
  })

  let nextY = doc.lastAutoTable.finalY + 8

  // Desglose por categoria
  if (simulationEvents.value.length > 0) {
    if (nextY > pageHeight - 60) { doc.addPage(); nextY = 22 }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.text('Desglose por Categoria', margin, nextY)

    nextY += 4
    doc.setDrawColor(...accentGold)
    doc.setLineWidth(0.6)
    doc.line(margin, nextY, pageWidth - margin, nextY)
    nextY += 4

    const catMap = {}
    simulationEvents.value.forEach(e => {
      const cat = e.category || 'Sin categoria'
      if (!catMap[cat]) catMap[cat] = { count: 0, total: 0 }
      catMap[cat].count++
      catMap[cat].total += Number(e.amount || 0)
    })

    const catRows = Object.entries(catMap).map(([cat, data]) => [
      cat,
      String(data.count),
      formatCurrencyValue(data.total)
    ])

    autoTable(doc, {
      startY: nextY,
      head: [['Categoria', 'Cantidad', 'Total']],
      body: catRows,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'right', cellWidth: 32 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          data.cell.styles.textColor = [183, 28, 28]
        }
      },
      margin: { left: margin, right: margin }
    })

    nextY = doc.lastAutoTable.finalY + 8
  }

  // Desglose por prioridad
  if (simulationEvents.value.length > 0) {
    if (nextY > pageHeight - 50) { doc.addPage(); nextY = 22 }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.text('Desglose por Prioridad', margin, nextY)

    nextY += 4
    doc.setDrawColor(...accentGold)
    doc.setLineWidth(0.6)
    doc.line(margin, nextY, pageWidth - margin, nextY)
    nextY += 4

    const prioOrder = ['Alta', 'Media', 'Baja']
    const priMap = {}
    simulationEvents.value.forEach(e => {
      const pri = e.priority || 'Media'
      if (!priMap[pri]) priMap[pri] = { count: 0, total: 0 }
      priMap[pri].count++
      priMap[pri].total += Number(e.amount || 0)
    })

    const priRows = prioOrder
      .filter(p => priMap[p])
      .map(p => [p, String(priMap[p].count), formatCurrencyValue(priMap[p].total)])

    autoTable(doc, {
      startY: nextY,
      head: [['Prioridad', 'Cantidad', 'Total']],
      body: priRows,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'right', cellWidth: 32 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const pri = data.cell.raw
          const pc = priorityColorMap[pri]
          if (pc) {
            data.cell.styles.textColor = pc
            data.cell.styles.fontStyle = 'bold'
          }
        }
        if (data.section === 'body' && data.column.index === 2) {
          data.cell.styles.textColor = [183, 28, 28]
        }
      },
      margin: { left: margin, right: margin }
    })

    nextY = doc.lastAutoTable.finalY + 8
  }

  // Resumen final
  if (nextY + 40 > pageHeight - 15) { doc.addPage(); nextY = 22 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text('Resumen', margin, nextY)

  nextY += 5
  doc.setDrawColor(...accentGold)
  doc.setLineWidth(0.6)
  doc.line(margin, nextY, pageWidth - margin, nextY)
  nextY += 6

  const boxX = margin
  const boxW = pageWidth - 2 * margin
  const boxH = 30
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(200, 210, 220)
  doc.roundedRect(boxX, nextY, boxW, boxH, 3, 3, 'FD')

  const summaryData = [
    { label: 'Ingreso esperado', value: formatCurrencyValue(scenario.value.income), color: [27, 94, 32] },
    { label: 'Gasto esperado', value: formatCurrencyValue(totalExpectedExpense.value), color: [183, 28, 28] },
    { label: 'Saldo proyectado', value: formatCurrencyValue(remainingBalance.value), color: remainingBalance.value >= 0 ? [27, 94, 32] : [183, 28, 28] },
    { label: 'Uso del ingreso', value: `${usagePercent.value.toFixed(1)}%`, color: primaryColor }
  ]

  let sy = nextY + 7
  doc.setFontSize(9)
  for (let i = 0; i < summaryData.length; i++) {
    const { label, value, color } = summaryData[i]
    const isBold = i === summaryData.length - 1
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setTextColor(...(isBold ? primaryColor : [60, 60, 60]))
    doc.text(label, boxX + 6, sy)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    doc.text(value, boxX + boxW - 6, sy, { align: 'right' })
    sy += 7
  }

  const stamp = toIsoDate(new Date()).replace(/-/g, '')
  doc.save(`simulador-gastos-${stamp}.pdf`)
}

onMounted(() => {
  hydrateSimulation()
})
</script>

<style scoped>
.simulator-page {
  background:
    radial-gradient(circle at 8% 10%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 38%),
    radial-gradient(circle at 88% 88%, color-mix(in srgb, var(--color-success) 10%, transparent), transparent 36%);
}

.hero-card {
  border-radius: 18px;
  border: 1px solid var(--color-border);
  padding: 20px;
  background: linear-gradient(135deg, var(--color-surface), color-mix(in srgb, var(--color-info) 8%, var(--color-surface)));
}

.kpi-card {
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.weekday-cell {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-cell {
  min-height: 86px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.calendar-cell:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
}

.calendar-cell-empty {
  border-style: dashed;
  cursor: default;
  background: transparent;
}

.calendar-cell-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.event-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-pill {
  border-radius: 8px;
  padding: 4px 6px;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border-left: 3px solid transparent;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
}

.event-pill--alta {
  background: color-mix(in srgb, var(--color-error) 14%, var(--color-surface));
  border-left-color: var(--color-error);
}

.event-pill--media {
  background: color-mix(in srgb, var(--color-warning) 14%, var(--color-surface));
  border-left-color: var(--color-warning);
}

.event-pill--baja {
  background: color-mix(in srgb, var(--color-success) 10%, var(--color-surface));
  border-left-color: var(--color-success);
}

@media (max-width: 960px) {
  .calendar-cell {
    min-height: 72px;
  }

  .event-pill {
    font-size: 10px;
  }
}
</style>

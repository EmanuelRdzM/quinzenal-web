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
  const margin = 12
  const contentW = pageWidth - 2 * margin
  const footerSpace = 18
  const today = new Date().toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
  const primaryColor = [26, 58, 92]
  const accentGold = [200, 160, 60]
  const incomeColor = [27, 94, 32]
  const expenseColor = [183, 28, 28]
  const warningColor = [245, 124, 0]

  doc.setProperties({
    title: 'Simulador de Gastos',
    author: 'Cash Flow',
    creator: 'Cash Flow'
  })

  // Banner delgado
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 16, 'F')

  doc.setDrawColor(...accentGold)
  doc.setLineWidth(0.5)
  doc.line(0, 16, pageWidth, 16)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('CASH FLOW', margin, 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('Simulador de Gastos', margin, 13)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text(
    `${periodTypeLabel(scenario.value.periodType)} · ${periodLabel.value}`,
    pageWidth - margin,
    7.5,
    { align: 'right' }
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`Generado: ${today}`, pageWidth - margin, 12.5, { align: 'right' })

  // Linea de datos del escenario
  let y = 21.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(90, 90, 90)
  doc.text(
    `${periodDays.value.length} dias · ${simulationEvents.value.length} pagos planeados · Ingreso esperado: ${formatCurrencyValue(scenario.value.income)}`,
    margin,
    y
  )

  y += 3
  doc.setDrawColor(225, 225, 225)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 4

  // KPIs compactos
  const kpiLines = [
    { label: 'Ingreso esperado', value: formatCurrencyValue(scenario.value.income), color: [60, 60, 60] },
    { label: 'Gasto esperado', value: formatCurrencyValue(totalExpectedExpense.value), color: [60, 60, 60] },
    { label: 'Saldo proyectado', value: formatCurrencyValue(remainingBalance.value), color: remainingBalance.value >= 0 ? incomeColor : expenseColor },
    { label: 'Promedio diario', value: formatCurrencyValue(avgDailyExpense.value), color: [60, 60, 60] }
  ]

  doc.setFontSize(7.5)
  for (let i = 0; i < kpiLines.length; i++) {
    const kpi = kpiLines[i]
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(kpi.label, margin, y)
    doc.setTextColor(...kpi.color)
    doc.setFont('helvetica', 'bold')
    doc.text(kpi.value, pageWidth - margin, y, { align: 'right' })
    y += 4.5
    if (i < kpiLines.length - 1) {
      doc.setDrawColor(235, 235, 235)
      doc.setLineWidth(0.25)
      doc.line(margin, y - 2.2, pageWidth - margin, y - 2.2)
    }
  }

  // Barra de uso del ingreso
  y += 2
  const usagePct = Math.min(usagePercent.value, 100)
  const barX = margin
  const barW = contentW
  const barH = 3
  const barY = y

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(80, 80, 80)
  doc.text(`Uso del ingreso: ${usagePercent.value.toFixed(1)}%`, barX, barY)

  const barBgY = barY + 1.5
  doc.setFillColor(230, 230, 230)
  doc.setDrawColor(210, 210, 210)
  doc.roundedRect(barX, barBgY, barW, barH, 1.5, 1.5, 'FD')

  const filledW = Math.max((barW * usagePct) / 100, usagePct > 0 ? 3 : 0)
  const barColor = usagePct > 90 ? expenseColor : usagePct > 60 ? warningColor : incomeColor
  doc.setFillColor(...barColor)
  doc.roundedRect(barX, barBgY, filledW, barH, 1.5, 1.5, 'F')

  y = barBgY + barH + 7

  // Tabla de pagos a ancho completo con saldo proyectado
  const priorityColorMap = { Alta: expenseColor, Media: warningColor, Baja: incomeColor }
  const rows = []
  const runningValues = []
  let running = Number(scenario.value.income || 0)
  let prevDate = ''
  sortedEvents.value.forEach((evt, i) => {
    const amount = Number(evt.amount) || 0
    running -= amount
    runningValues.push(running)
    rows.push([
      String(i + 1),
      evt.date && evt.date !== prevDate ? formatDate(evt.date) : '',
      evt.concept || '-',
      evt.category || '-',
      evt.priority || 'Media',
      formatCurrencyValue(amount),
      formatCurrencyValue(running)
    ])
    prevDate = evt.date
  })

  if (!rows.length) {
    rows.push(['-', '-', 'Sin pagos planeados', '-', '-', formatCurrencyValue(0), ''])
  }

  const finalBalance = Number(scenario.value.income || 0) - totalExpectedExpense.value

  autoTable(doc, {
    startY: y,
    head: [['#', 'Fecha', 'Concepto', 'Categoria', 'Prioridad', 'Monto', 'Saldo']],
    body: rows,
    foot: [
      [
        { content: 'TOTAL GASTO PLANEADO', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrencyValue(totalExpectedExpense.value), styles: { halign: 'right', fontStyle: 'bold', textColor: expenseColor } },
        ''
      ],
      [
        { content: 'SALDO FINAL PROYECTADO', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        '',
        { content: formatCurrencyValue(finalBalance), styles: { halign: 'right', fontStyle: 'bold', textColor: finalBalance >= 0 ? incomeColor : expenseColor } }
      ]
    ],
    showFoot: 'lastPage',
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.6, valign: 'middle', textColor: [45, 45, 45] },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 1.6
    },
    footStyles: {
      fillColor: [243, 246, 249],
      textColor: [30, 30, 30],
      fontSize: 7.5,
      cellPadding: 1.6,
      lineWidth: 0.25,
      lineColor: [205, 212, 220]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 20 },
      2: { cellWidth: 52 },
      3: { cellWidth: 38 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'right', cellWidth: 26 },
      6: { halign: 'right', cellWidth: 26 }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 1 && data.cell.raw) {
          data.cell.styles = data.cell.styles || {}
          data.cell.styles.fontStyle = 'bold'
        }
        if (data.column.index === 4) {
          const pc = priorityColorMap[data.cell.raw]
          if (pc) {
            data.cell.styles = data.cell.styles || {}
            data.cell.styles.textColor = pc
            data.cell.styles.fontStyle = 'bold'
          }
        }
        if (data.column.index === 5) {
          data.cell.styles = data.cell.styles || {}
          data.cell.styles.textColor = expenseColor
        }
        if (data.column.index === 6 && data.row.index < runningValues.length) {
          const v = runningValues[data.row.index]
          data.cell.styles = data.cell.styles || {}
          data.cell.styles.textColor = v < 0 ? expenseColor : [70, 70, 70]
          if (v < 0) data.cell.styles.fontStyle = 'bold'
        }
      }
      if (data.section === 'foot' && data.row.index === 1) {
        data.cell.styles.fillColor = [232, 238, 245]
      }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        doc.setDrawColor(228, 228, 228)
        doc.setLineWidth(0.12)
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
      }
    },
    margin: { left: margin, right: margin, bottom: footerSpace }
  })

  const tableFinalY = doc.lastAutoTable.finalY

  // Grafica combinada: barras de pagos + linea de saldo proyectado
  if (periodDays.value.length > 0) {
    const weeklyChart = periodDays.value.length > 45
    const buckets = []

    if (weeklyChart) {
      for (let i = 0; i < periodDays.value.length; i += 7) {
        buckets.push({ label: `S${Math.floor(i / 7) + 1}`, payments: 0, balance: null })
      }
      const dayToBucket = {}
      periodDays.value.forEach((d, i) => { dayToBucket[d] = Math.floor(i / 7) })
      sortedEvents.value.forEach(evt => {
        const bi = dayToBucket[evt.date]
        if (bi !== undefined) buckets[bi].payments += Number(evt.amount) || 0
      })
    } else {
      const idxByDate = {}
      periodDays.value.forEach((d, i) => {
        idxByDate[d] = i
        buckets.push({
          label: parseDate(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
          payments: 0,
          balance: null
        })
      })
      sortedEvents.value.forEach(evt => {
        const i = idxByDate[evt.date]
        if (i !== undefined) buckets[i].payments += Number(evt.amount) || 0
      })
    }

    let run = Number(scenario.value.income || 0)
    buckets.forEach(b => {
      run -= b.payments
      b.balance = run
    })

    let chartY = tableFinalY + 8
    if (chartY + 48 > pageHeight - footerSpace - 4) {
      doc.addPage()
      chartY = 16
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...primaryColor)
    doc.text(weeklyChart ? 'Proyeccion Semanal: Pagos y Saldo' : 'Proyeccion Diaria: Pagos y Saldo', margin, chartY)
    chartY += 2.5
    doc.setDrawColor(...accentGold)
    doc.setLineWidth(0.5)
    doc.line(margin, chartY, pageWidth - margin, chartY)
    chartY += 6

    const chartH = 24
    const chartTop = chartY
    const chartBottom = chartTop + chartH
    const maxPayments = Math.max(1, ...buckets.map(b => b.payments))
    const balances = buckets.map(b => b.balance ?? Number(scenario.value.income || 0))
    const balanceMin = Math.min(0, ...balances)
    const balanceMax = Math.max(Number(scenario.value.income || 0), ...balances, 1)
    const balanceRange = Math.max(balanceMax - balanceMin, 1)

    const balanceToY = (v) => chartBottom - ((v - balanceMin) / balanceRange) * (chartH - 2)
    const zeroY = balanceToY(0)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(120, 120, 120)
    doc.text(`Saldo: ${formatCurrencyValue(balanceMin)} a ${formatCurrencyValue(balanceMax)}`, margin, chartTop - 1)
    doc.text(`Max pagos: ${formatCurrencyValue(maxPayments)}`, pageWidth - margin, chartTop - 1, { align: 'right' })

    if (balanceMin < 0) {
      doc.setFillColor(252, 240, 240)
      doc.rect(margin, zeroY, contentW, chartBottom - zeroY, 'F')
    }

    doc.setDrawColor(190, 190, 190)
    doc.setLineWidth(0.2)
    doc.setLineDash([1, 1], 0)
    doc.line(margin, zeroY, pageWidth - margin, zeroY)
    doc.setLineDash([], 0)

    doc.setDrawColor(165, 165, 165)
    doc.setLineWidth(0.25)
    doc.line(margin, chartBottom, pageWidth - margin, chartBottom)

    const n = buckets.length
    const slot = contentW / n
    const barW = Math.max(Math.min(slot * 0.5, 3), 0.6)

    buckets.forEach((b, i) => {
      if (b.payments > 0) {
        const h = (b.payments / maxPayments) * (chartH - 3)
        doc.setFillColor(232, 158, 158)
        doc.rect(margin + slot * i + (slot - barW) / 2, chartBottom - h, barW, h, 'F')
      }
    })

    doc.setLineWidth(0.5)
    let prevX = null
    let prevY = null
    let prevBelow = false
    buckets.forEach((b, i) => {
      const x = margin + slot * i + slot / 2
      const val = b.balance ?? Number(scenario.value.income || 0)
      const yy = balanceToY(val)
      const below = yy > zeroY + 0.05
      if (prevX !== null) {
        doc.setDrawColor(...(below && prevBelow ? expenseColor : primaryColor))
        doc.line(prevX, prevY, x, yy)
      }
      prevX = x
      prevY = yy
      prevBelow = below
      if (n <= 31) {
        doc.setFillColor(...primaryColor)
        doc.circle(x, yy, 0.5, 'F')
      }
    })

    const labelEvery = Math.max(1, Math.ceil(n / 12))
    buckets.forEach((b, i) => {
      if (i % labelEvery === 0) {
        const x = margin + slot * i + slot / 2
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6)
        doc.setTextColor(120, 120, 120)
        const lw = doc.getTextWidth(b.label)
        const lx = Math.min(Math.max(x, margin + lw / 2), pageWidth - margin - lw / 2)
        doc.text(b.label, lx, chartBottom + 3)
      }
    })

    const legendY = chartBottom + 8
    doc.setFillColor(232, 158, 158)
    doc.rect(margin, legendY - 2, 3, 3, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(90, 90, 90)
    doc.text('Pagos', margin + 5, legendY)

    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(margin + 18, legendY - 0.5, margin + 26, legendY - 0.5)
    doc.text('Saldo proyectado', margin + 28, legendY)

    var nextY = legendY + 6
  } else {
    var nextY = tableFinalY + 8
  }

  // Desgloses lado a lado: categoria y prioridad
  if (simulationEvents.value.length > 0) {
    if (nextY + 40 > pageHeight - footerSpace - 4) { doc.addPage(); nextY = 16 }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...primaryColor)
    doc.text('Desgloses', margin, nextY)
    nextY += 2.5
    doc.setDrawColor(...accentGold)
    doc.setLineWidth(0.5)
    doc.line(margin, nextY, pageWidth - margin, nextY)
    nextY += 3

    const catMap = {}
    simulationEvents.value.forEach(e => {
      const cat = e.category || 'Sin categoria'
      if (!catMap[cat]) catMap[cat] = { count: 0, total: 0 }
      catMap[cat].count++
      catMap[cat].total += Number(e.amount || 0)
    })

    const catRows = Object.entries(catMap)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([cat, d]) => [cat, String(d.count), formatCurrencyValue(d.total)])

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

    const leftW = 112
    const gap = 8
    const rightX = margin + leftW + gap

    autoTable(doc, {
      startY: nextY + 1,
      head: [['Categoria', 'Cant.', 'Total']],
      body: catRows,
      theme: 'plain',
      styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle', textColor: [45, 45, 45] },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, cellPadding: 1.5 },
      alternateRowStyles: { fillColor: [247, 249, 251] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 12 },
        2: { halign: 'right', cellWidth: 26 }
      },
      margin: { left: margin, right: pageWidth - margin - leftW, bottom: footerSpace }
    })

    autoTable(doc, {
      startY: nextY + 1,
      head: [['Prioridad', 'Cant.', 'Total']],
      body: priRows,
      theme: 'plain',
      styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle', textColor: [45, 45, 45] },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, cellPadding: 1.5 },
      alternateRowStyles: { fillColor: [247, 249, 251] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 12 },
        2: { halign: 'right', cellWidth: 26 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const pc = priorityColorMap[data.cell.raw]
          if (pc) {
            data.cell.styles = data.cell.styles || {}
            data.cell.styles.textColor = pc
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
      margin: { left: rightX, right: margin, bottom: footerSpace }
    })
  }

  // Pie de pagina en todas las hojas
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    const bottom = pageHeight - 7
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.4)
    doc.line(margin, bottom - 3, pageWidth - margin, bottom - 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(150, 150, 150)
    doc.text('Cash Flow · Simulador de Gastos', margin, bottom)
    doc.text(`Pagina ${p} de ${totalPages}`, pageWidth - margin, bottom, { align: 'right' })
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

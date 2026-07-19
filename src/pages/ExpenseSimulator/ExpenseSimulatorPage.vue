<template>
  <v-container fluid class="pa-4 pa-md-6 simulator-page">
    <v-row class="mb-5">
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

    <v-row class="mb-5">
      <v-col cols="12" lg="4">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <v-card-title class="text-h6 font-weight-bold">Escenario</v-card-title>
            <v-card-subtitle>Define ingreso y rango del periodo</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-select
              v-model="scenario.periodType"
              :items="periodTypeOptions"
              label="Tipo de periodo"
              variant="outlined"
              density="comfortable"
              hide-details
              class="mb-4"
            />

            <v-row>
              <v-col cols="12" sm="6" lg="12">
                <v-text-field
                  v-model="scenario.startDate"
                  type="date"
                  label="Fecha inicio"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="mb-4"
                />
              </v-col>
              <v-col cols="12" sm="6" lg="12">
                <v-text-field
                  v-model="scenario.endDate"
                  type="date"
                  label="Fecha fin"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="mb-4"
                  :disabled="scenario.periodType !== 'custom'"
                />
              </v-col>
            </v-row>

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

      <v-col cols="12" lg="8">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <v-card-title class="text-h6 font-weight-bold">Registrar pago planeado</v-card-title>
            <v-card-subtitle>Se guarda solo como simulación local</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="eventForm.date"
                  type="date"
                  label="Fecha"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="eventForm.concept"
                  label="Concepto"
                  placeholder="Ej: Renta"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
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
              <v-col cols="12" md="5">
                <v-select
                  v-model="eventForm.category"
                  :items="categoryOptions"
                  label="Categoria"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="eventForm.priority"
                  :items="priorityOptions"
                  label="Prioridad"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-end">
                <v-btn
                  block
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="addEvent"
                >
                  Agregar pago
                </v-btn>
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
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-5">
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
            <v-card-title class="text-h6 font-weight-bold">Calendario del periodo</v-card-title>
            <v-card-subtitle>
              {{ periodLabel }} • {{ periodDays.length }} días
            </v-card-subtitle>
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
                      class="event-pill"
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
            <v-card-title class="text-h6 font-weight-bold">Pagos planeados</v-card-title>
            <v-card-subtitle>{{ simulationEvents.length }} eventos</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-list density="comfortable" class="px-0 py-0">
              <v-list-item
                v-for="evt in sortedEvents"
                :key="evt.id"
                class="px-0"
              >
                <v-list-item-title class="font-weight-medium">{{ evt.concept }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(evt.date) }} • {{ evt.category }} • {{ evt.priority }}
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

              <v-list-item v-if="!simulationEvents.length" class="px-0">
                <v-list-item-title class="text-medium-emphasis">Sin pagos planeados</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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

const periodError = computed(() => {
  if (!scenario.value.startDate || !scenario.value.endDate) return 'Debes definir fecha inicio y fecha fin.'
  if (scenario.value.endDate < scenario.value.startDate) return 'La fecha final no puede ser menor a la fecha inicial.'
  return ''
})

const periodDays = computed(() => {
  if (periodError.value) return []
  return enumerateDates(scenario.value.startDate, scenario.value.endDate)
})

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
  saveSimulation()
}

function removeEvent(id) {
  simulationEvents.value = simulationEvents.value.filter(evt => evt.id !== id)
  saveSimulation()
}

function selectDate(date) {
  if (!date) return
  eventForm.value.date = date
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
  const margin = 14
  const generatedAt = new Date().toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  // Metadatos del documento
  doc.setProperties({
    title: 'Simulación de gastos',
    author: 'Expense Simulator',
    creator: 'Expense Simulator'
  })

  // ---- ENCABEZADO ----
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.text('Simulador de Gastos', margin, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Generado: ${generatedAt}`, pageWidth - margin, 18, { align: 'right' })

  // ---- RESUMEN (recuadro) ----
  const summaryRows = [
    ['Tipo de periodo', periodTypeOptions.find(o => o.value === scenario.value.periodType)?.title || scenario.value.periodType],
    ['Inicio', formatDate(scenario.value.startDate)],
    ['Fin', formatDate(scenario.value.endDate)],
    ['Días del periodo', String(periodDays.value.length)],
    ['Ingreso esperado', formatCurrencyValue(scenario.value.income)],
    ['Gasto esperado', formatCurrencyValue(totalExpectedExpense.value)],
    ['Saldo proyectado', formatCurrencyValue(remainingBalance.value)],
    ['Uso del ingreso', `${usagePercent.value.toFixed(1)}%`],
    ['Promedio diario', formatCurrencyValue(avgDailyExpense.value)],
    ['Pagos planeados', String(simulationEvents.value.length)]
  ]

  const summaryStartY = 30
  const sumX = margin
  const sumW = pageWidth - 2 * margin
  const rowH = 7
  const pad = 3
  const totalH = summaryRows.length * rowH + pad * 2

  doc.setFillColor(245, 248, 252)
  doc.setDrawColor(200, 210, 220)
  doc.roundedRect(sumX, summaryStartY, sumW, totalH + 4, 3, 3, 'FD')

  autoTable(doc, {
    startY: summaryStartY + 2,
    margin: { left: sumX + 3, right: sumX + 3 },
    body: summaryRows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'right', cellWidth: 40, textColor: [60, 60, 60] },
      1: { cellWidth: 'auto', textColor: [40, 40, 40] }
    },
    showHead: false,
    tableWidth: sumW - 6,
    didParseCell: (data) => {
      if (data.row.index % 2 === 1) {
        data.cell.styles.fillColor = [235, 242, 250]
      }
    }
  })

  const summaryEndY = summaryStartY + totalH + 4 + 6

  // ---- TABLA DE PAGOS ----
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(25, 118, 210)
  doc.text('Pagos planeados', margin, summaryEndY)

  const paymentRows = sortedEvents.value.map((event, index) => [
    String(index + 1),
    formatDate(event.date),
    event.concept,
    event.category,
    event.priority,
    formatCurrencyValue(event.amount)
  ])

  if (!paymentRows.length) {
    paymentRows.push(['-', '-', 'Sin pagos planeados', '-', '-', formatCurrencyValue(0)])
  }

  autoTable(doc, {
    startY: summaryEndY + 5,
    head: [['#', 'Fecha', 'Concepto', 'Categoría', 'Prior.', 'Monto']],
    body: paymentRows,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 2.5, valign: 'middle' },
    headStyles: {
      fillColor: [2, 136, 209],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [240, 248, 255] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 28 },
      2: { cellWidth: 60 },
      3: { cellWidth: 26 },
      4: { cellWidth: 18 },
      5: { halign: 'right', cellWidth: 32 }
    },
    didDrawPage: (data) => {
      // Pie de página
      const bottom = pageHeight - 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.setDrawColor(200)
      doc.line(margin, bottom - 4, pageWidth - margin, bottom - 4)
      doc.text(`Página ${data.pageNumber}`, pageWidth / 2, bottom, { align: 'center' })
    },
    margin: { left: margin, right: margin }
  })

  const stamp = toIsoDate(new Date()).replace(/-/g, '')
  doc.save(`simulacion-gastos-${stamp}.pdf`)
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
  background: color-mix(in srgb, var(--color-error) 8%, var(--color-surface));
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
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

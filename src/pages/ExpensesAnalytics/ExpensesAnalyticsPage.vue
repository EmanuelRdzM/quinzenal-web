<template>
  <v-container fluid class="pa-4 pa-md-6 expenses-analytics-page">
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="hero-card">
          <div class="d-flex flex-wrap align-center ga-3">
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">Analitica de gastos</h1>
              <p class="text-medium-emphasis mb-0">
                Seguimiento visual de ingresos, egresos y categorias.
              </p>
            </div>
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              :loading="loading"
              @click="loadAll"
            >
              Actualizar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedPeriodId"
          :items="periodOptions"
          label="Periodo"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="monthsWindow"
          :items="monthsOptions"
          label="Ventana mensual"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedAnalyticsType"
          :items="analyticsTypeOptions"
          label="Tipo de análisis"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card rounded="xl" variant="outlined" class="kpi-card">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Balance del periodo</div>
            <div class="text-h4 font-weight-bold" :class="balanceClass">
              {{ $formatCurrency(summary?.balanceTotal || 0) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="xl" variant="outlined" class="kpi-card">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Ingresos</div>
            <div class="text-h4 font-weight-bold text-success">
              {{ $formatCurrency(summary?.totalIncome || 0) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="xl" variant="outlined" class="kpi-card">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Egresos</div>
            <div class="text-h4 font-weight-bold text-error">
              {{ $formatCurrency(summary?.totalExpense || 0) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <v-card-title class="text-h6 font-weight-bold">{{ analyticsTitle }} a través de los meses</v-card-title>
            <v-card-subtitle>Comparativa de {{ selectedAnalyticsType === 'income' ? 'ingresos' : 'egresos' }} en los últimos meses</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <div class="line-chart-wrap">
              <svg viewBox="0 0 660 260" class="line-chart">
                <g>
                  <line x1="40" y1="220" x2="620" y2="220" class="axis" />
                  <line x1="40" y1="20" x2="40" y2="220" class="axis" />
                </g>
                <polyline :points="incomePoints" class="income-line" :style="{ opacity: selectedAnalyticsType === 'income' ? 1 : 0.2 }" fill="none" />
                <polyline :points="expensePoints" class="expense-line" :style="{ opacity: selectedAnalyticsType === 'expense' ? 1 : 0.2 }" fill="none" />
                <g v-for="point in chartPoints" :key="`point-${point.key}`">
                  <circle :cx="point.x" :cy="point.incomeY" r="4" class="income-point" :style="{ opacity: selectedAnalyticsType === 'income' ? 1 : 0.2 }" />
                  <circle :cx="point.x" :cy="point.expenseY" r="4" class="expense-point" :style="{ opacity: selectedAnalyticsType === 'expense' ? 1 : 0.2 }" />
                  <text :x="point.x" y="242" text-anchor="middle" class="axis-label">{{ point.label }}</text>
                </g>
              </svg>
            </div>
            <div class="d-flex align-center ga-4 mt-2">
              <div class="d-flex align-center ga-2" :style="{ opacity: selectedAnalyticsType === 'income' ? 1 : 0.4 }">
                <span class="legend-dot income" />
                <span class="text-caption">Ingresos</span>
              </div>
              <div class="d-flex align-center ga-2" :style="{ opacity: selectedAnalyticsType === 'expense' ? 1 : 0.4 }">
                <span class="legend-dot expense" />
                <span class="text-caption">Egresos</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <v-card-title class="text-h6 font-weight-bold">{{ analyticsTitle }} por categoria</v-card-title>
            <v-card-subtitle>Periodo seleccionado</v-card-subtitle>
          </v-card-item>
          <v-card-text class="d-flex flex-column align-center">
            <div class="donut" :style="donutStyle">
              <div class="donut-center">
                <div class="text-caption text-medium-emphasis">Total</div>
                <div class="text-h6 font-weight-bold">{{ $formatCurrency(totalCategoryAmount) }}</div>
              </div>
            </div>

            <v-list density="compact" class="w-100 mt-4">
              <v-list-item
                v-for="item in topCategories"
                :key="item.categorySlug"
                class="px-0"
              >
                <template #prepend>
                  <span class="legend-dot" :style="{ backgroundColor: item.color }" />
                </template>
                <v-list-item-title>{{ item.categoryName }}</v-list-item-title>
                <template #append>
                  <span class="text-caption">{{ $formatCurrency(item.total) }}</span>
                </template>
              </v-list-item>

              <v-list-item v-if="!topCategories.length" class="px-0">
                <v-list-item-title class="text-medium-emphasis">Sin datos para este periodo</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" variant="outlined">
          <v-card-item>
            <v-card-title class="text-h6 font-weight-bold">Detalle de {{ selectedAnalyticsType === 'income' ? 'ingresos' : 'egresos' }} por categoria (mensual)</v-card-title>
            <v-card-subtitle>Top categorias con mayor {{ selectedAnalyticsType === 'income' ? 'ingreso' : 'gasto' }} acumulado</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-data-table
              :headers="tableHeaders"
              :items="monthlyCategoryData"
              :items-per-page="8"
              density="comfortable"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters'

const loading = ref(false)

const periods = ref([])
const selectedPeriodId = ref(null)

const summary = ref(null)
const monthlyAnalytics = ref({ months: [], expenseByCategory: [], incomeByCategory: [] })

const monthsWindow = ref(6)
const monthsOptions = [
  { title: '6 meses', value: 6 },
  { title: '12 meses', value: 12 }
]

const selectedAnalyticsType = ref('expense')
const analyticsTypeOptions = [
  { title: 'Egresos', value: 'expense' },
  { title: 'Ingresos', value: 'income' }
]

const chartColors = ['#f97316', '#ef4444', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6']

const tableHeaders = [
  { title: 'Categoria', key: 'categoryName' },
  { title: 'Total', key: 'totalFormatted', align: 'end' }
]

const periodOptions = computed(() => periods.value.map(period => ({
  title: formatPeriod(period.startDate, period.endDate),
  value: period.id
})))

const balanceClass = computed(() =>
  Number(summary.value?.balanceTotal || 0) >= 0 ? 'text-success' : 'text-error'
)

const analyticsTitle = computed(() =>
  selectedAnalyticsType.value === 'income' ? 'Ingresos' : 'Egresos'
)

const topCategories = computed(() => {
  const source = selectedAnalyticsType.value === 'income'
    ? (summary.value?.incomeByCategory || [])
    : (summary.value?.expenseByCategory || [])
  return source.slice(0, 6).map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length]
  }))
})

const totalCategoryAmount = computed(() =>
  topCategories.value.reduce((sum, item) => sum + Number(item.total || 0), 0)
)

const chartPoints = computed(() => {
  const months = monthlyAnalytics.value.months || []
  if (!months.length) return []

  const maxValue = Math.max(
    ...months.map(item => Math.max(Number(item.income || 0), Number(item.expense || 0))),
    1
  )

  const width = 580
  const startX = 40
  const baseY = 220
  const height = 180
  const step = months.length > 1 ? width / (months.length - 1) : width

  return months.map((item, index) => {
    const income = Number(item.income || 0)
    const expense = Number(item.expense || 0)

    return {
      key: item.key,
      label: item.label,
      x: startX + step * index,
      incomeY: baseY - (income / maxValue) * height,
      expenseY: baseY - (expense / maxValue) * height
    }
  })
})

const incomePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.incomeY}`).join(' '))
const expensePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.expenseY}`).join(' '))



const donutStyle = computed(() => {
  if (!topCategories.value.length || totalCategoryAmount.value <= 0) {
    return { background: 'var(--color-border)' }
  }

  let current = 0
  const segments = topCategories.value.map((item) => {
    const percent = (Number(item.total || 0) / totalCategoryAmount.value) * 100
    const start = current
    current += percent
    return `${item.color} ${start}% ${current}%`
  })

  return {
    background: `conic-gradient(${segments.join(', ')})`
  }
})

const monthlyCategoryData = computed(() => {
  const source = selectedAnalyticsType.value === 'income'
    ? (monthlyAnalytics.value.incomeByCategory || [])
    : (monthlyAnalytics.value.expenseByCategory || [])
  return source.map(item => ({
    ...item,
    totalFormatted: formatCurrency(item.total)
  }))
})

function formatPeriod(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.toLocaleDateString('es-MX')} - ${endDate.toLocaleDateString('es-MX')}`
}

async function loadPeriods() {
  const res = await api.get('/v1/periods')
  periods.value = res.data || []

  if (!selectedPeriodId.value && periods.value.length) {
    selectedPeriodId.value = periods.value[0].id
  }
}

async function loadPeriodSummary() {
  if (!selectedPeriodId.value) {
    summary.value = null
    return
  }

  const res = await api.get(`/v1/periods/${selectedPeriodId.value}/summary`)
  summary.value = res.data || null
}

async function loadMonthlyAnalytics() {
  const res = await api.get('/v1/period-movements/analytics/monthly', {
    params: { months: monthsWindow.value }
  })

  monthlyAnalytics.value = res.data || { months: [], expenseByCategory: [], incomeByCategory: [] }
}

async function loadAll() {
  loading.value = true
  try {
    await loadPeriods()
    await Promise.all([loadPeriodSummary(), loadMonthlyAnalytics()])
  } catch (err) {
    console.error('Error loading analytics', err)
  } finally {
    loading.value = false
  }
}

watch(selectedPeriodId, async () => {
  await loadPeriodSummary()
})

watch(monthsWindow, async () => {
  await loadMonthlyAnalytics()
})

onMounted(loadAll)
</script>

<style scoped>
.expenses-analytics-page {
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--color-warning) 12%, transparent), transparent 48%),
    radial-gradient(circle at bottom left, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 44%);
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

.line-chart-wrap {
  overflow-x: auto;
}

.line-chart {
  width: 100%;
  min-width: 620px;
}

.axis {
  stroke: color-mix(in srgb, var(--color-text) 20%, transparent);
  stroke-width: 1;
}

.axis-label {
  fill: var(--color-text-muted);
  font-size: 11px;
}

.income-line {
  stroke: var(--color-success);
  stroke-width: 3;
}

.expense-line {
  stroke: var(--color-error);
  stroke-width: 3;
}

.income-point {
  fill: var(--color-success);
}

.expense-point {
  fill: var(--color-error);
}

.donut {
  position: relative;
  width: 190px;
  height: 190px;
  border-radius: 999px;
  margin-top: 8px;
}

.donut-center {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: 114px;
  height: 114px;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: grid;
  place-items: center;
  text-align: center;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-dot.income {
  background: var(--color-success);
}

.legend-dot.expense {
  background: var(--color-error);
}
</style>

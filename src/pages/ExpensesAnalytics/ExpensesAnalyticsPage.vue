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
        <v-card rounded="lg" variant="outlined" class="analytics-type-switch pa-3">
          <div class="text-caption text-medium-emphasis mb-1">Tipo de análisis</div>
          <div class="analytics-type-pill" role="group" aria-label="Tipo de analisis">
            <span
              class="analytics-type-pill__thumb"
              :class="{ 'is-income': selectedAnalyticsType === 'income' }"
            />
            <button
              type="button"
              class="analytics-type-pill__option"
              :class="{ 'is-active': selectedAnalyticsType === 'expense' }"
              :aria-pressed="selectedAnalyticsType === 'expense'"
              @click="selectedAnalyticsType = 'expense'"
            >
              Egresos
            </button>
            <button
              type="button"
              class="analytics-type-pill__option"
              :class="{ 'is-active': selectedAnalyticsType === 'income' }"
              :aria-pressed="selectedAnalyticsType === 'income'"
              @click="selectedAnalyticsType = 'income'"
            >
              Ingresos
            </button>
          </div>
        </v-card>
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
              <svg viewBox="0 0 660 260" class="line-chart" @mouseleave="hoveredChartPointKey = null">
                <g>
                  <g v-for="tick in chartScaleTicks" :key="`tick-${tick.value}`">
                    <line x1="40" :y1="tick.y" x2="620" :y2="tick.y" class="grid-line" />
                    <text x="34" :y="tick.y + 4" text-anchor="end" class="axis-value">{{ tick.label }}</text>
                  </g>
                  <line x1="40" y1="220" x2="620" y2="220" class="axis" />
                  <line x1="40" y1="20" x2="40" y2="220" class="axis" />
                </g>
                <polyline :points="incomePoints" class="income-line" :style="{ opacity: selectedAnalyticsType === 'income' ? 1 : 0.28 }" fill="none" />
                <polyline :points="expensePoints" class="expense-line" :style="{ opacity: selectedAnalyticsType === 'expense' ? 1 : 0.28 }" fill="none" />
                <g v-for="zone in chartHoverZones" :key="`zone-${zone.key}`">
                  <rect
                    class="hover-zone"
                    :x="zone.x"
                    y="20"
                    :width="zone.width"
                    height="200"
                    @mouseenter="hoveredChartPointKey = zone.key"
                  />
                </g>
                <g v-for="point in chartPoints" :key="`point-${point.key}`">
                  <circle
                    :cx="point.x"
                    :cy="point.incomeY"
                    :r="activeChartPoint?.key === point.key ? 5 : 4"
                    class="income-point"
                    :style="{ opacity: selectedAnalyticsType === 'income' ? 1 : 0.28 }"
                  />
                  <circle
                    :cx="point.x"
                    :cy="point.expenseY"
                    :r="activeChartPoint?.key === point.key ? 5 : 4"
                    class="expense-point"
                    :style="{ opacity: selectedAnalyticsType === 'expense' ? 1 : 0.28 }"
                  />
                  <text :x="point.x" y="242" text-anchor="middle" class="axis-label">{{ point.label }}</text>
                </g>
              </svg>
            </div>
            <div class="d-flex align-center ga-4 mt-2">
              <div class="d-flex align-center ga-2" :style="{ opacity: selectedAnalyticsType === 'income' ? 1 : 0.55 }">
                <span class="legend-dot income" />
                <span class="text-caption">Ingresos</span>
              </div>
              <div class="d-flex align-center ga-2" :style="{ opacity: selectedAnalyticsType === 'expense' ? 1 : 0.55 }">
                <span class="legend-dot expense" />
                <span class="text-caption">Egresos</span>
              </div>
            </div>
            <div v-if="activeChartPoint" class="chart-detail mt-4">
              <div class="text-caption text-medium-emphasis">Mes activo</div>
              <div class="text-body-2 font-weight-medium mb-2">{{ activeChartPoint.label }}</div>
              <div class="chart-detail-grid">
                <div class="chart-detail-item income">
                  <span class="legend-dot income" />
                  <div>
                    <div class="text-caption text-medium-emphasis">Ingresos</div>
                    <div class="text-body-2 font-weight-medium">{{ $formatCurrency(activeChartPoint.income) }}</div>
                  </div>
                </div>
                <div class="chart-detail-item expense">
                  <span class="legend-dot expense" />
                  <div>
                    <div class="text-caption text-medium-emphasis">Egresos</div>
                    <div class="text-body-2 font-weight-medium">{{ $formatCurrency(activeChartPoint.expense) }}</div>
                  </div>
                </div>
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
            <div class="donut-wrap">
              <svg viewBox="0 0 220 220" class="donut-chart" role="img" :aria-label="`${analyticsTitle} por categoria`">
                <circle
                  class="donut-track"
                  cx="110"
                  cy="110"
                  :r="DONUT_RADIUS"
                />
                <circle
                  v-for="segment in donutSegments"
                  :key="segment.key"
                  class="donut-segment"
                  :class="{
                    'is-clickable': segment.isOthers,
                    'is-active': hoveredDonutSegmentKey === segment.key,
                    'is-inactive': hoveredDonutSegmentKey && hoveredDonutSegmentKey !== segment.key
                  }"
                  cx="110"
                  cy="110"
                  :r="DONUT_RADIUS"
                  :stroke="segment.color"
                  :stroke-dasharray="segment.dasharray"
                  :stroke-dashoffset="segment.dashoffset"
                  @mouseenter="hoveredDonutSegmentKey = segment.key"
                  @mouseleave="hoveredDonutSegmentKey = null"
                  @click="handleCategoryClick(segment)"
                >
                  <title>{{ segment.tooltip }}</title>
                </circle>
              </svg>
              <div class="donut-center">
                <div class="text-caption text-medium-emphasis">
                  {{ hoveredDonutSegment ? hoveredDonutSegment.categoryName : 'Total' }}
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ $formatCurrency(hoveredDonutSegment ? hoveredDonutSegment.total : totalCategoryAmount) }}
                </div>
              </div>
            </div>

            <v-list density="compact" class="w-100 mt-4">
              <v-list-item
                v-for="item in displayCategories"
                :key="item.key"
                class="px-0"
                :class="{ 'other-category-item': item.isOthers }"
                @click="handleCategoryClick(item)"
              >
                <template #prepend>
                  <span class="legend-dot" :style="{ backgroundColor: item.color }" />
                </template>
                <v-list-item-title>{{ item.categoryName }}</v-list-item-title>
                <template #append>
                  <span class="text-caption">{{ $formatCurrency(item.total) }}</span>
                </template>
              </v-list-item>

              <v-list-item v-if="!displayCategories.length" class="px-0">
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

    <v-dialog v-model="showOtherCategoriesDialog" max-width="640">
      <v-card rounded="xl">
        <v-card-item>
          <v-card-title class="text-h6 font-weight-bold">Todas las categorias</v-card-title>
          <v-card-subtitle>{{ analyticsTitle }} del periodo seleccionado</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th class="text-left">Categoria</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in allCategories" :key="item.key">
                <td>
                  <div class="d-flex align-center ga-2">
                    <span class="legend-dot" :style="{ backgroundColor: item.color }" />
                    <span>{{ item.categoryName }}</span>
                  </div>
                </td>
                <td class="text-right">{{ $formatCurrency(item.total) }}</td>
              </tr>
              <tr v-if="!allCategories.length">
                <td colspan="2" class="text-center text-medium-emphasis py-4">Sin categorias para este periodo</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="showOtherCategoriesDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

const chartColors = ['#f97316', '#ef4444', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6']
const MAX_VISIBLE_CATEGORIES = 5
const DONUT_RADIUS = 78
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

const tableHeaders = [
  { title: 'Categoria', key: 'categoryName' },
  { title: 'Total', key: 'totalFormatted', align: 'end' }
]

const hoveredDonutSegmentKey = ref(null)
const showOtherCategoriesDialog = ref(false)
const hoveredChartPointKey = ref(null)

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

const categorySource = computed(() =>
  selectedAnalyticsType.value === 'income'
    ? (summary.value?.incomeByCategory || [])
    : (summary.value?.expenseByCategory || [])
)

const totalCategoryAmount = computed(() =>
  categorySource.value.reduce((sum, item) => sum + Number(item.total || 0), 0)
)

const allCategories = computed(() =>
  categorySource.value
    .map((item, index) => ({
      ...item,
      key: `${item.categorySlug || 'sin-categoria'}-${item.categoryId ?? index}`,
      total: Number(item.total || 0),
      isOthers: false
    }))
    .filter(item => item.total > 0)
    .map((item, index) => ({
      ...item,
      color: chartColors[index % chartColors.length]
    }))
)

const displayCategories = computed(() => {
  const assignColors = (items) => items.map((item, index) => ({
    ...item,
    color: item.color || chartColors[index % chartColors.length]
  }))

  if (allCategories.value.length <= MAX_VISIBLE_CATEGORIES) {
    return assignColors(allCategories.value)
  }

  const visibleItems = allCategories.value.slice(0, MAX_VISIBLE_CATEGORIES)
  const otherItems = allCategories.value.slice(MAX_VISIBLE_CATEGORIES)
  const otherTotal = otherItems.reduce((sum, item) => sum + item.total, 0)

  return assignColors([
    ...visibleItems,
    {
      key: 'otras-categorias',
      categoryId: 'others',
      categoryName: 'Otras categorias',
      categorySlug: 'otras-categorias',
      total: otherTotal,
      color: '#94a3b8',
      isOthers: true
    }
  ])
})

const hoveredDonutSegment = computed(() =>
  displayCategories.value.find(item => item.key === hoveredDonutSegmentKey.value) || null
)

const chartMaxValue = computed(() => {
  const months = monthlyAnalytics.value.months || []

  return Math.max(
    ...months.map(item => Math.max(Number(item.income || 0), Number(item.expense || 0))),
    1
  )
})

const chartScaleTicks = computed(() => {
  const steps = 4

  return Array.from({ length: steps + 1 }, (_, index) => {
    const ratio = index / steps
    const value = Math.round(chartMaxValue.value * (1 - ratio))

    return {
      value,
      y: 20 + ratio * 200,
      label: formatCurrency(value)
    }
  })
})

const chartPoints = computed(() => {
  const months = monthlyAnalytics.value.months || []
  if (!months.length) return []

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
      income,
      expense,
      x: startX + step * index,
      incomeY: baseY - (income / chartMaxValue.value) * height,
      expenseY: baseY - (expense / chartMaxValue.value) * height
    }
  })
})

const chartHoverZones = computed(() => {
  if (!chartPoints.value.length) return []

  const step = chartPoints.value.length > 1
    ? chartPoints.value[1].x - chartPoints.value[0].x
    : 580

  return chartPoints.value.map((point, index) => {
    const left = index === 0 ? 40 : point.x - step / 2
    const right = index === chartPoints.value.length - 1 ? 620 : point.x + step / 2

    return {
      key: point.key,
      x: left,
      width: right - left
    }
  })
})

const activeChartPoint = computed(() => {
  if (!chartPoints.value.length) return null

  return chartPoints.value.find(point => point.key === hoveredChartPointKey.value)
    || chartPoints.value[chartPoints.value.length - 1]
})

const incomePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.incomeY}`).join(' '))
const expensePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.expenseY}`).join(' '))

const donutSegments = computed(() => {
  if (!displayCategories.value.length || totalCategoryAmount.value <= 0) {
    return []
  }

  let offset = 0

  return displayCategories.value.map((item) => {
    const segmentLength = (item.total / totalCategoryAmount.value) * DONUT_CIRCUMFERENCE
    const segment = {
      ...item,
      dasharray: `${segmentLength} ${DONUT_CIRCUMFERENCE - segmentLength}`,
      dashoffset: -offset,
      tooltip: `${item.categoryName}: ${formatCurrency(item.total)}`
    }

    offset += segmentLength
    return segment
  })
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

function handleCategoryClick(item) {
  if (!item?.isOthers) return
  showOtherCategoriesDialog.value = true
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

.analytics-type-switch {
  min-height: 56px;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
}

.analytics-type-pill {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  border-radius: 999px;
  padding: 4px;
  background: color-mix(in srgb, var(--color-border) 22%, transparent);
}

.analytics-type-pill__thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: 0 10px 20px -16px color-mix(in srgb, var(--color-primary) 85%, transparent);
  transition: transform 0.22s ease;
}

.analytics-type-pill__thumb.is-income {
  transform: translateX(100%);
}

.analytics-type-pill__option {
  position: relative;
  z-index: 1;
  min-height: 34px;
  border: 0;
  background: transparent;
  border-radius: 999px;
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
  transition: color 0.18s ease;
}

.analytics-type-pill__option.is-active {
  color: white;
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

.grid-line {
  stroke: color-mix(in srgb, var(--color-text) 10%, transparent);
  stroke-width: 1;
  stroke-dasharray: 4 6;
}

.axis-label {
  fill: var(--color-text-muted);
  font-size: 11px;
}

.axis-value {
  fill: var(--color-text-muted);
  font-size: 10px;
}

.income-line {
  stroke: var(--color-success, #16a34a);
  stroke-width: 3;
}

.expense-line {
  stroke: var(--color-error, #ef4444);
  stroke-width: 3;
}

.income-point {
  fill: var(--color-success, #16a34a);
  stroke: var(--color-surface);
  stroke-width: 2;
}

.expense-point {
  fill: var(--color-error, #ef4444);
  stroke: var(--color-surface);
  stroke-width: 2;
}

.income-point.is-highlighted,
.expense-point.is-highlighted {
  r: 5;
}

.hover-zone {
  fill: transparent;
}

.chart-detail {
  border-top: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  padding-top: 12px;
}

.chart-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chart-detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
}

.chart-detail-item.income {
  background: color-mix(in srgb, var(--color-success, #16a34a) 8%, transparent);
}

.chart-detail-item.expense {
  background: color-mix(in srgb, var(--color-error, #ef4444) 8%, transparent);
}

.donut-wrap {
  position: relative;
  width: 190px;
  height: 190px;
  margin-top: 8px;
}

.donut-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.donut-track {
  fill: none;
  stroke: color-mix(in srgb, var(--color-border) 84%, white);
  stroke-width: 32;
}

.donut-segment {
  fill: none;
  stroke-width: 32;
  stroke-linecap: butt;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: opacity 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease;
  pointer-events: stroke;
}

.donut-segment.is-clickable {
  cursor: pointer;
}

.donut-segment.is-active {
  stroke-width: 36;
  filter: brightness(1.06);
}

.donut-segment.is-inactive {
  opacity: 0.38;
}

.other-category-item {
  cursor: pointer;
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
  background: var(--color-success, #16a34a);
}

.legend-dot.expense {
  background: var(--color-error, #ef4444);
}

@media (max-width: 600px) {
  .chart-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <v-container fluid class="pa-6">
    <!-- Header con título y acciones -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex flex-wrap align-center ga-4">
          <div>
            <h1 class="text-h3 font-weight-bold gradient-text mb-1">Dashboard</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Bienvenido de nuevo, aquí tienes el resumen de tus finanzas
            </p>
          </div>
          <v-spacer />
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="goTo('/balance')"
            elevation="2"
            size="large"
            class="px-6"
          >
            Nuevo movimiento
          </v-btn>
          <v-btn
            variant="tonal"
            icon="mdi-refresh"
            :loading="loading"
            @click="loadDashboard"
            size="large"
          />
        </div>
      </v-col>
    </v-row>

    <!-- Período selector y resumen principal -->
    <v-row class="mb-6">
      <v-col cols="12" md="7">
        <v-card class="period-summary-card" rounded="xl">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-chip
                color="primary"
                variant="flat"
                size="small"
                class="text-uppercase"
              >
                <v-icon start icon="mdi-calendar-range" size="small" />
                Período activo
              </v-chip>
            </div>

            <div v-if="currentPeriod" class="period-info">
              <div class="text-h4 font-weight-bold mb-1">
                {{ currentPeriodLabel }}
              </div>
              <div class="text-body-2 text-medium-emphasis mb-6">
                {{ getPeriodDays }} días • {{ getPeriodProgress }}
              </div>

              <v-row>
                <v-col cols="6" md="4">
                  <div class="period-stat">
                    <span class="text-caption text-medium-emphasis">Ingresos</span>
                    <div class="text-h6 font-weight-bold text-success">
                      {{ $formatCurrency(currentPeriodSummary?.totalIncome) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="6" md="4">
                  <div class="period-stat">
                    <span class="text-caption text-medium-emphasis">Gastos</span>
                    <div class="text-h6 font-weight-bold text-error">
                      {{ $formatCurrency(currentPeriodSummary?.totalExpense) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="period-stat">
                    <span class="text-caption text-medium-emphasis">Balance</span>
                    <div class="text-h6 font-weight-bold" :class="periodBalanceClass">
                      {{ $formatCurrency(currentPeriodSummary?.balanceTotal) }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>

            <div v-else class="text-center py-6">
              <v-icon icon="mdi-calendar-remove" size="48" color="grey-lighten-1" />
              <div class="text-h6 mt-2">No hay períodos activos</div>
              <v-btn color="primary" class="mt-4" @click="goTo('/periods')">
                Crear período
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Actions mejorado -->
      <v-col cols="12" md="5">
        <v-card class="quick-actions-card h-100" rounded="xl">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-flash" color="warning" start />
              <span class="text-h6 font-weight-bold">Acciones rápidas</span>
            </div>

            <div class="quick-actions-grid">
              <v-btn
                v-for="action in quickActions"
                :key="action.path"
                :color="action.color"
                variant="tonal"
                block
                size="large"
                class="quick-action-btn"
                @click="goTo(action.path)"
              >
                <v-icon :icon="action.icon" size="24" />
                <span class="text-caption mt-1">{{ action.label }}</span>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- KPI Cards Rediseñados -->
    <v-row class="mb-6">
      <v-col cols="12" md="6" lg="3" v-for="(kpi, index) in kpis" :key="index">
        <v-card
          class="modern-kpi-card"
          :class="[`kpi-${kpi.color}`, { 'glass-effect': index === 0 }]"
          rounded="xl"
          elevation="0"
        >
          <v-card-text class="pa-6">
            <div class="d-flex justify-space-between align-start mb-3">
              <div>
                <span class="text-caption text-medium-emphasis">{{ kpi.label }}</span>
                <div class="text-h4 font-weight-bold mt-1" :class="kpi.valueClass">
                  {{ kpi.value }}
                </div>
              </div>
              <v-avatar :color="kpi.color" variant="tonal" size="48" rounded="lg">
                <v-icon :icon="kpi.icon" :color="kpi.color" size="28" />
              </v-avatar>
            </div>
            
            <div class="d-flex align-center ga-2">
              <v-chip
                :color="kpi.trendColor"
                size="x-small"
                variant="tonal"
                class="trend-chip"
              >
                <v-icon :icon="kpi.trendIcon" size="x-small" start />
                {{ kpi.trendValue }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">{{ kpi.subtext }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráfico y estadísticas (placeholder) -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card rounded="xl" variant="outlined">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                <v-icon icon="mdi-chart-line" color="primary" />
              </v-avatar>
            </template>
            <v-card-title class="text-h6 font-weight-bold">Evolución financiera</v-card-title>
            <v-card-subtitle>Últimos 6 meses</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div v-for="n in 6" :key="n" class="chart-bar-container">
                  <div class="chart-bar" :style="{ height: `${Math.random() * 120 + 40}px` }" />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" variant="outlined" class="h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="info" variant="tonal" size="40" rounded="lg">
                <v-icon icon="mdi-trending-up" color="info" />
              </v-avatar>
            </template>
            <v-card-title class="text-h6 font-weight-bold">Distribución</v-card-title>
            <v-card-subtitle>Ingresos vs Gastos</v-card-subtitle>
          </v-card-item>
          <v-card-text class="d-flex flex-column align-center">
            <div class="donut-chart-placeholder">
              <div class="donut-segment income" />
              <div class="donut-segment expense" />
              <div class="donut-center">
                <span class="text-h5 font-weight-bold">60/40</span>
              </div>
            </div>
            <div class="d-flex justify-center ga-4 mt-4">
              <div class="d-flex align-center">
                <div class="legend-dot income" />
                <span class="text-caption">Ingresos 60%</span>
              </div>
              <div class="d-flex align-center">
                <div class="legend-dot expense" />
                <span class="text-caption">Gastos 40%</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Listas de elementos recientes con diseño mejorado -->
    <v-row>
      <v-col cols="12" md="4" v-for="section in recentSections" :key="section.title">
        <v-card rounded="xl" variant="outlined" class="recent-section-card h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar :color="section.color" variant="tonal" size="40" rounded="lg">
                <v-icon :icon="section.icon" :color="section.color" />
              </v-avatar>
            </template>
            <v-card-title class="text-h6 font-weight-bold">{{ section.title }}</v-card-title>
            <v-card-subtitle>{{ section.subtitle }}</v-card-subtitle>
          </v-card-item>

          <v-divider />

          <v-list lines="two" density="comfortable" class="py-0">
            <v-list-item
              v-for="item in section.items"
              :key="item.id"
              @click="goTo(`${section.basePath}/${item.id}`)"
              class="recent-list-item"
            >
              <template v-slot:prepend>
                <v-avatar :color="section.color" variant="tonal" size="36" rounded="lg">
                  <v-icon :icon="section.itemIcon" :color="section.color" size="small" />
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>

              <template v-slot:append>
                <v-icon icon="mdi-chevron-right" size="small" color="grey" />
              </template>
            </v-list-item>

            <v-list-item v-if="!section.items.length" class="empty-state">
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-2" size="36" rounded="lg">
                  <v-icon icon="mdi-information-outline" color="grey" size="small" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">Sin elementos</v-list-item-title>
              <v-list-item-subtitle>{{ section.emptyMessage }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider v-if="section.items.length" />

          <v-card-actions>
            <v-btn
              :to="section.basePath"
              variant="text"
              block
              class="text-none"
              :color="section.color"
            >
              Ver todos
              <v-icon end icon="mdi-arrow-right" size="small" />
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Alerta de Error Mejorada -->
    <v-alert
      v-if="loadError"
      type="warning"
      variant="tonal"
      class="mt-6"
      density="comfortable"
      closable
      border="start"
      prominent
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-alert-circle-outline" size="large" class="mr-3" />
        <div>
          <div class="font-weight-bold">Error de conexión</div>
          <div class="text-caption">No se pudieron cargar todos los datos del dashboard</div>
        </div>
        <v-spacer />
        <v-btn color="warning" variant="text" @click="loadDashboard" :loading="loading">
          Reintentar
        </v-btn>
      </div>
    </v-alert>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters.js'

const router = useRouter()

const loading = ref(false)
const loadError = ref(false)

const periods = ref([])
const cards = ref([])
const credits = ref([])
const people = ref([])
const currentPeriodSummary = ref(null)

// Computed properties
const latestCards = computed(() => cards.value.slice(0, 3))
const latestCredits = computed(() => credits.value.slice(0, 3))
const latestPeople = computed(() => people.value.slice(0, 3))

const totalCardInitialBalance = computed(() =>
  cards.value.reduce((sum, item) => sum + Number(item.initialBalance || 0), 0)
)

const totalMonthlyCredit = computed(() =>
  credits.value.reduce((sum, item) => sum + Number(item.monthlyAmount || 0), 0)
)

const currentPeriod = computed(() => periods.value[0] || null)

const currentPeriodLabel = computed(() => {
  if (!currentPeriod.value) return ''
  const start = new Date(currentPeriod.value.startDate)
  const end = new Date(currentPeriod.value.endDate)
  return `${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
})

const getPeriodDays = computed(() => {
  if (!currentPeriod.value) return ''
  const start = new Date(currentPeriod.value.startDate)
  const end = new Date(currentPeriod.value.endDate)
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24))
  return `${days} días de duración`
})

const getPeriodProgress = computed(() => {
  if (!currentPeriod.value) return ''
  const start = new Date(currentPeriod.value.startDate)
  const end = new Date(currentPeriod.value.endDate)
  const now = new Date()
  const total = (end - start) / (1000 * 60 * 60 * 24)
  const elapsed = (now - start) / (1000 * 60 * 60 * 24)
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100))
  return `${Math.round(progress)}% completado`
})

const periodBalanceClass = computed(() =>
  Number(currentPeriodSummary.value?.balanceTotal || 0) >= 0 ? 'text-success' : 'text-error'
)

// KPIs mejorados
const kpis = computed(() => {
  const balance = Number(currentPeriodSummary.value?.balanceTotal || 0)
  return [
    {
      icon: 'mdi-wallet-outline',
      color: 'primary',
      label: 'Balance del período',
      value: formatCurrency(balance),
      valueClass: balance >= 0 ? 'text-success' : 'text-error',
      subtext: 'período actual',
      trendIcon: balance >= 0 ? 'mdi-trending-up' : 'mdi-trending-down',
      trendColor: balance >= 0 ? 'success' : 'error',
      trendValue: balance >= 0 ? '+2.5%' : '-1.2%'
    },
    {
      icon: 'mdi-credit-card-outline',
      color: 'info',
      label: 'Tarjetas',
      value: cards.value.length,
      subtext: 'activas',
      trendIcon: 'mdi-credit-card-check-outline',
      trendColor: 'info',
      trendValue: `$${formatCurrency(totalCardInitialBalance.value)}`
    },
    {
      icon: 'mdi-cash-fast',
      color: 'warning',
      label: 'Créditos',
      value: credits.value.length,
      subtext: 'registrados',
      trendIcon: 'mdi-calendar-month-outline',
      trendColor: 'warning',
      trendValue: `$${formatCurrency(totalMonthlyCredit.value)}/mes`
    },
    {
      icon: 'mdi-account-group-outline',
      color: 'success',
      label: 'Contactos',
      value: people.value.length,
      subtext: 'personas',
      trendIcon: 'mdi-account-multiple',
      trendColor: 'success',
      trendValue: `${periods.value.length} períodos`
    }
  ]
})

// Acciones rápidas mejoradas
const quickActions = [
  { label: 'Registro', icon: 'mdi-view-dashboard', path: '/balance', color: 'primary' },
  { label: 'Tarjetas', icon: 'mdi-credit-card-multiple', path: '/cards', color: 'info' },
  { label: 'Personas', icon: 'mdi-account-group', path: '/debts', color: 'warning' },
  { label: 'Créditos', icon: 'mdi-cash-clock', path: '/credits', color: 'success' }
]

// Secciones recientes
const recentSections = computed(() => [
  {
    title: 'Últimas tarjetas',
    subtitle: 'Acceso rápido',
    icon: 'mdi-credit-card-outline',
    color: 'info',
    itemIcon: 'mdi-credit-card-outline',
    items: latestCards.value.map(card => ({
      id: card.id,
      title: card.name,
      subtitle: `Saldo inicial: ${formatCurrency(card.initialBalance)}`
    })),
    basePath: '/cards',
    emptyMessage: 'Agrega una tarjeta para verla aquí'
  },
  {
    title: 'Últimos créditos',
    subtitle: 'Seguimiento de pagos',
    icon: 'mdi-cash-fast',
    color: 'warning',
    itemIcon: 'mdi-cash-fast',
    items: latestCredits.value.map(credit => ({
      id: credit.id,
      title: credit.name,
      subtitle: `Mensualidad: ${formatCurrency(credit.monthlyAmount)}`
    })),
    basePath: '/credits',
    emptyMessage: 'Agrega un crédito para verlo aquí'
  },
  {
    title: 'Últimas personas',
    subtitle: 'Contactos',
    icon: 'mdi-account',
    color: 'success',
    itemIcon: 'mdi-account',
    items: latestPeople.value.map(person => ({
      id: person.id,
      title: person.name,
      subtitle: person.phone || 'Sin teléfono'
    })),
    basePath: '/people',
    emptyMessage: 'Agrega una persona para verla aquí'
  }
])

function goTo(path) {
  router.push(path)
}

async function loadDashboard() {
  loading.value = true
  loadError.value = false

  try {
    const [periodsRes, cardsRes, creditsRes, peopleRes] = await Promise.all([
      api.get('/v1/periods'),
      api.get('/v1/cards'),
      api.get('/v1/credits'),
      api.get('/v1/people')
    ])

    periods.value = periodsRes.data || []
    cards.value = cardsRes.data || []
    credits.value = creditsRes.data || []
    people.value = peopleRes.data || []

    if (periods.value.length > 0) {
      try {
        const summaryRes = await api.get(`/v1/periods/${periods.value[0].id}/summary`)
        currentPeriodSummary.value = summaryRes.data || null
      } catch (err) {
        console.error('Error loading current period summary', err)
        currentPeriodSummary.value = null
        loadError.value = true
      }
    } else {
      currentPeriodSummary.value = null
    }
  } catch (err) {
    console.error('Error loading dashboard data', err)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.period-summary-card {
  background: linear-gradient(135deg, var(--color-surface), color-mix(in srgb, var(--color-primary) 4%, var(--color-surface)));
  border: 1px solid var(--color-border);
}

.period-stat {
  padding: 8px;
  background: color-mix(in srgb, var(--color-surface) 60%, transparent);
  border-radius: 8px;
}

.quick-actions-card {
  background: linear-gradient(135deg, var(--color-surface), color-mix(in srgb, var(--color-warning) 4%, var(--color-surface)));
  border: 1px solid var(--color-border);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  padding: 16px 8px !important;
}

.modern-kpi-card {
  border: 1px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
}

.kpi-primary:hover { border-color: var(--color-primary); }
.kpi-info:hover { border-color: var(--color-info); }
.kpi-warning:hover { border-color: var(--color-warning); }
.kpi-success:hover { border-color: var(--color-success); }

.glass-effect {
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary) 8%, transparent), 
    color-mix(in srgb, var(--color-surface) 90%, var(--color-primary)));
  backdrop-filter: blur(10px);
}

.trend-chip {
  font-weight: 500;
}

/* Chart placeholders */
.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  height: 180px;
}

.chart-bar-container {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-bar {
  width: 100%;
  background: linear-gradient(to top, var(--color-primary), var(--color-secondary));
  border-radius: 20px 20px 0 0;
  transition: height 0.3s ease;
  min-height: 20px;
}

.donut-chart-placeholder {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: var(--color-border);
  overflow: hidden;
  margin: 20px 0;
}

.donut-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 50%, 100% 0, 100% 100%);
}

.donut-segment.income {
  background: var(--color-success);
  transform: rotate(45deg);
}

.donut-segment.expense {
  background: var(--color-error);
  transform: rotate(225deg);
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: var(--color-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  margin-right: 6px;
}

.legend-dot.income { background: var(--color-success); }
.legend-dot.expense { background: var(--color-error); }

.recent-section-card {
  transition: all 0.3s ease;
}

.recent-section-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

.recent-list-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.recent-list-item:hover {
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.empty-state {
  opacity: 0.7;
}
</style>
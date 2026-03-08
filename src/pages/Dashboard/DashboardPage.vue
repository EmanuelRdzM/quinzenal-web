<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card class="dashboard-hero" rounded="xl" elevation="0">
          <v-card-text class="d-flex flex-wrap align-center ga-4 py-6 px-6">
            <div>
              <div class="text-overline mb-1">Panel principal</div>
              <h1 class="text-h4 font-weight-bold mb-1">Dashboard</h1>
              <p class="text-body-1 text-medium-emphasis mb-0">
                Vista rapida de tu estado financiero y accesos directos a cada modulo.
              </p>
            </div>

            <v-spacer />

            <div class="d-flex ga-2 flex-wrap justify-end">
              <v-btn color="primary" prepend-icon="mdi-wallet" @click="goTo('/balance')">
                Registrar movimiento
              </v-btn>
              <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadDashboard">
                Actualizar
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-card variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Balance del periodo actual</div>
            <div class="text-h5 font-weight-bold mt-2" :class="periodBalanceClass">
              {{ $formatCurrency(currentPeriodSummary?.balanceTotal) }}
            </div>
            <div class="text-caption mt-2">{{ currentPeriodLabel }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Tarjetas activas</div>
            <div class="text-h5 font-weight-bold mt-2">{{ cards.length }}</div>
            <div class="text-caption mt-2">Total saldo inicial: {{ $formatCurrency(totalCardInitialBalance) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Creditos registrados</div>
            <div class="text-h5 font-weight-bold mt-2">{{ credits.length }}</div>
            <div class="text-caption mt-2">Pago mensual estimado: {{ $formatCurrency(totalMonthlyCredit) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card variant="outlined" class="kpi-card h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Contactos y periodos</div>
            <div class="text-h5 font-weight-bold mt-2">{{ people.length }} personas</div>
            <div class="text-caption mt-2">{{ periods.length }} periodos creados</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" lg="8">
        <v-card variant="outlined" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-rocket-launch-outline" class="mr-2" color="primary" />
            Accesos rapidos
          </v-card-title>
          <v-card-text class="pt-0">
            <div class="d-flex flex-wrap ga-2">
              <v-btn variant="tonal" prepend-icon="mdi-view-dashboard" @click="goTo('/balance')">
                Registro quincenal
              </v-btn>
              <v-btn variant="tonal" prepend-icon="mdi-credit-card-multiple" @click="goTo('/cards')">
                Tarjetas
              </v-btn>
              <v-btn variant="tonal" prepend-icon="mdi-account-group" @click="goTo('/debts')">
                Deudas y personas
              </v-btn>
              <v-btn variant="tonal" prepend-icon="mdi-cash-clock" @click="goTo('/credits')">
                Creditos
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card variant="outlined" rounded="lg" class="h-100">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-calendar-range" class="mr-2" color="info" />
            Periodo actual
          </v-card-title>
          <v-card-text>
            <div class="text-body-2 mb-2">{{ currentPeriodLabel }}</div>
            <div class="text-caption text-medium-emphasis mb-2">Ingresos: {{ $formatCurrency(currentPeriodSummary?.totalIncome) }}</div>
            <div class="text-caption text-medium-emphasis mb-2">Gastos: {{ $formatCurrency(currentPeriodSummary?.totalExpense) }}</div>
            <v-btn color="info" variant="text" prepend-icon="mdi-open-in-new" @click="goTo('/balance')">
              Ir al detalle
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" md="4">
        <v-card variant="outlined" rounded="lg" class="h-100">
          <v-card-title>Ultimas tarjetas</v-card-title>
          <v-divider />
          <v-list density="comfortable">
            <v-list-item
              v-for="card in latestCards"
              :key="card.id"
              :title="card.name"
              :subtitle="`Saldo inicial: ${$formatCurrency(card.initialBalance)}`"
              prepend-icon="mdi-credit-card-outline"
              @click="goTo(`/cards/${card.id}`)"
            />
            <v-list-item v-if="!latestCards.length" title="Sin tarjetas" subtitle="Agrega una tarjeta para verla aqui" />
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" rounded="lg" class="h-100">
          <v-card-title>Ultimos creditos</v-card-title>
          <v-divider />
          <v-list density="comfortable">
            <v-list-item
              v-for="credit in latestCredits"
              :key="credit.id"
              :title="credit.name"
              :subtitle="`Mensualidad: ${$formatCurrency(credit.monthlyAmount)}`"
              prepend-icon="mdi-cash-fast"
              @click="goTo(`/credits/${credit.id}`)"
            />
            <v-list-item v-if="!latestCredits.length" title="Sin creditos" subtitle="Agrega un credito para verlo aqui" />
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" rounded="lg" class="h-100">
          <v-card-title>Ultimas personas</v-card-title>
          <v-divider />
          <v-list density="comfortable">
            <v-list-item
              v-for="person in latestPeople"
              :key="person.id"
              :title="person.name"
              :subtitle="person.phone || 'Sin telefono'"
              prepend-icon="mdi-account"
              @click="goTo(`/people/${person.id}`)"
            />
            <v-list-item v-if="!latestPeople.length" title="Sin personas" subtitle="Agrega una persona para verla aqui" />
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="loadError"
      type="warning"
      variant="tonal"
      class="mt-4"
      density="comfortable"
      closable
    >
      No se pudieron cargar todos los datos del dashboard. Revisa la conexion con la API.
    </v-alert>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const loading = ref(false)
const loadError = ref(false)

const periods = ref([])
const cards = ref([])
const credits = ref([])
const people = ref([])
const currentPeriodSummary = ref(null)

const latestCards = computed(() => cards.value.slice(0, 5))
const latestCredits = computed(() => credits.value.slice(0, 5))
const latestPeople = computed(() => people.value.slice(0, 5))

const totalCardInitialBalance = computed(() =>
  cards.value.reduce((sum, item) => sum + Number(item.initialBalance || 0), 0)
)

const totalMonthlyCredit = computed(() =>
  credits.value.reduce((sum, item) => sum + Number(item.monthlyAmount || 0), 0)
)

const currentPeriod = computed(() => periods.value[0] || null)

const currentPeriodLabel = computed(() => {
  if (!currentPeriod.value) return 'No hay periodos registrados'

  const start = new Date(currentPeriod.value.startDate)
  const end = new Date(currentPeriod.value.endDate)

  return `${start.toLocaleDateString('es-MX')} - ${end.toLocaleDateString('es-MX')}`
})

const periodBalanceClass = computed(() =>
  Number(currentPeriodSummary.value?.balanceTotal || 0) >= 0 ? 'text-success' : 'text-error'
)

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
.dashboard-hero {
  background:
    radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--color-primary) 24%, transparent), transparent 45%),
    radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--color-secondary) 20%, transparent), transparent 35%),
    linear-gradient(135deg, color-mix(in srgb, var(--color-surface) 92%, var(--color-primary) 8%), var(--color-surface));
  border: 1px solid var(--color-border);
}

.kpi-card {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
}
</style>

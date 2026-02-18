<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Breadcrumb mejorado -->
        <div class="d-flex align-center mb-4">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
            class="mr-2"
          >
            Volver
          </v-btn>
          <v-divider vertical class="mx-4" />
          <div>
            <h2 class="text-h5 font-weight-bold text-primary">
              {{ card?.name || 'Cargando...' }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              Detalle de tarjeta
            </span>
          </div>
        </div>

        <!-- Header con saldo actual -->
        <v-card class="mb-4" variant="outlined" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar 
                  :color="(summary?.balance || 0) >= 0 ? 'success' : 'error'" 
                  variant="tonal" 
                  size="64" 
                  class="mr-4"
                >
                  <v-icon 
                    :color="(summary?.balance || 0) >= 0 ? 'success' : 'error'" 
                    size="36"
                  >
                    mdi-credit-card
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 text-medium-emphasis">Saldo actual</div>
                  <div class="text-h4 font-weight-bold mb-1" :class="balanceClass">
                    ${{ formatNumber(summary?.balance) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Última actualización: {{ formatDate(new Date()) }}
                  </div>
                </div>
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openMovementDialog"
                size="large"
                class="rounded-lg"
              >
                Nuevo movimiento
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Summary Cards mejorados -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="info" variant="tonal" size="48" class="mr-3">
                    <v-icon color="info" size="28">mdi-cash</v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Saldo inicial</span>
                    <h3 class="text-h5 font-weight-bold">
                      ${{ formatNumber(summary?.initialBalance) }}
                    </h3>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="success" variant="tonal" size="48" class="mr-3">
                    <v-icon color="success" size="28">mdi-trending-up</v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Ingresos</span>
                    <h3 class="text-h5 font-weight-bold text-success">
                      ${{ formatNumber(summary?.totalIncome) }}
                    </h3>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="stat-card" variant="outlined" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="error" variant="tonal" size="48" class="mr-3">
                    <v-icon color="error" size="28">mdi-trending-down</v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-subtitle-2 text-medium-emphasis">Egresos</span>
                    <h3 class="text-h5 font-weight-bold text-error">
                      ${{ formatNumber(summary?.totalExpense) }}
                    </h3>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Movements Section -->
        <v-card class="pa-6" variant="outlined" rounded="lg">
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-history" color="primary" class="mr-2" />
              <h3 class="text-h6 font-weight-medium">Historial de movimientos</h3>
            </div>
            <v-spacer />
            <CardFilters
              v-model:search="searchQuery"
              v-model:from-date="fromDate"
              v-model:to-date="toDate"
              @clear-dates="resetDates"
              class="mr-3"
            />
          </div>

          <v-divider class="mb-4"></v-divider>

          <CardMovementsTable
            :movements="filteredMovements"
            :loading="loadingMovements"
            @edit="editMovement"
            @delete="deleteMovementConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <CardMovementFormDialog
      v-model="dialogMovement"
      :movement="editingMovement"
      :loading="savingMovement"
      @save="submitMovement"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import CardFilters from '../../components/cards/CardFilters.vue'
import CardMovementsTable from '../../components/cards/CardMovementsTable.vue'
import CardMovementFormDialog from '../../components/cards/CardMovementFormDialog.vue'

const route = useRoute()
const router = useRouter()
const cardId = route.params.id

const card = ref(null)
const summary = ref(null)
const movements = ref([])
const loadingMovements = ref(false)
const dialogMovement = ref(false)
const editingMovement = ref(null)
const savingMovement = ref(false)

// Filters
const searchQuery = ref('')
const fromDate = ref('')
const toDate = ref('')

const balanceClass = computed(() => 
  (summary.value?.balance || 0) >= 0 ? 'text-success' : 'text-error'
)

// Computed
const filteredMovements = computed(() => {
  let filtered = movements.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => 
      (m.concept || '').toLowerCase().includes(q) || 
      (m.description || '').toLowerCase().includes(q)
    )
  }

  return filtered
})

async function loadCard() {
  try {
    const res = await api.get(`/v1/cards/${cardId}`)
    card.value = res.data
  } catch (err) {
    console.error(err)
    router.back()
  }
}

async function loadSummary() {
  try {
    const res = await api.get(`/v1/cards/${cardId}/summary`)
    summary.value = res.data
  } catch (err) {
    console.error(err)
  }
}

async function loadMovements() {
  loadingMovements.value = true
  try {
    const params = { limit: 200 }
    if (fromDate.value) params.fromDate = fromDate.value
    if (toDate.value) params.toDate = toDate.value
    
    const res = await api.get(`/v1/cards/${cardId}/movements`, { params })
    movements.value = res.data || []
  } catch (err) {
    console.error(err)
    movements.value = []
  } finally {
    loadingMovements.value = false
  }
}

function openMovementDialog() {
  editingMovement.value = null
  dialogMovement.value = true
}

function editMovement(movement) {
  editingMovement.value = movement
  dialogMovement.value = true
}

async function submitMovement(formData) {
  savingMovement.value = true
  try {
    if (editingMovement.value) {
      await api.put(`/v1/card-movements/${editingMovement.value.id}`, formData)
    } else {
      await api.post(`/v1/cards/${cardId}/movements`, {
        cardId: Number(cardId),
        ...formData
      })
    }

    await Promise.all([loadMovements(), loadSummary()])
    dialogMovement.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingMovement.value = false
  }
}

function deleteMovementConfirm(movement) {
  if (confirm(`¿Eliminar movimiento "${movement.concept}"?`)) {
    deleteMovement(movement.id)
  }
}

async function deleteMovement(id) {
  try {
    await api.delete(`/v1/card-movements/${id}`)
    await Promise.all([loadMovements(), loadSummary()])
  } catch (err) {
    console.error(err)
  }
}

function resetDates() {
  fromDate.value = ''
  toDate.value = ''
  loadMovements()
}

function goBack() {
  router.back()
}

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([loadCard(), loadSummary(), loadMovements()])
})
</script>

<style scoped>
.stat-card {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>
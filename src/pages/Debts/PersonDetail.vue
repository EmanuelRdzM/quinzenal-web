<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="goBackToCategory"
            class="mr-2"
          >
            Volver
          </v-btn>
          <v-divider vertical class="mx-4" />
          <div>
            <h2 class="text-h5 font-weight-bold text-primary">
              {{ personName || 'Cargando...' }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              {{ categoryLabel }}
            </span>
          </div>
        </div>

        <v-card class="pa-6 mb-4 stat-card" variant="outlined">
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon :icon="sectionIcon" :color="sectionColor" class="mr-2" />
              <h3 class="text-h6 font-weight-medium">Resumen</h3>
            </div>
          </div>
          <v-divider class="mb-4" />
          <div class="text-subtitle-2 text-medium-emphasis mb-1">
            {{ isRent ? 'Pendiente' : 'Saldo' }}
          </div>
          <div class="text-h5 font-weight-bold" :class="`text-${sectionColor}`">
            {{ $formatCurrency(categorySummary.balance) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-2">
            {{ isRent ? 'Cargos' : 'Prestado' }} {{ $formatCurrency(categorySummary.totalLend) }} | Pagos {{ $formatCurrency(categorySummary.totalPayment) }}
          </div>
        </v-card>

        <v-card class="pa-6" variant="outlined">
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon :icon="sectionIcon" :color="sectionColor" class="mr-2" />
              <h3 class="text-h6 font-weight-medium">Historial de {{ categoryLabel.toLowerCase() }}</h3>
            </div>
            <v-spacer />
            <v-btn
              :color="sectionColor"
              prepend-icon="mdi-plus"
              @click="openMovementDialog"
              variant="flat"
              class="rounded-lg"
            >
              {{ newMovementLabel }}
            </v-btn>
          </div>
          <v-divider class="mb-4" />
          <DebtMovementsTable
            :movements="movements"
            :loading="loadingMovements"
            @edit="editMovement"
            @delete="deleteMovementConfirm"
          />
        </v-card>
      </v-col>
    </v-row>

    <DebtMovementFormDialog
      v-model="dialogMovement"
      :movement="editingMovement"
      :debt-id="personId"
      :loading="savingMovement"
      :is-rent="isRent"
      :default-movement-type="isRent ? 'payment' : 'lend'"
      @save="submitMovement"
    />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import DebtMovementsTable from '../../components/debts/DebtMovementsTable.vue'
import DebtMovementFormDialog from '../../components/debts/DebtMovementFormDialog.vue'
import { formatCurrency } from '../../utils/formatters.js'

const props = defineProps({
  category: {
    type: String,
    default: 'loan'
  }
})

const route = useRoute()
const router = useRouter()
const personId = computed(() => route.params.id)

const personName = ref('')
const summary = ref({ byCategory: { loan: {}, rent: {} } })
const movements = ref([])

const loadingMovements = ref(false)
const dialogMovement = ref(false)
const savingMovement = ref(false)
const editingMovement = ref(null)
const isRent = computed(() => props.category === 'rent')
const categoryLabel = computed(() => isRent.value ? 'Rentas' : 'Prestamos')
const sectionColor = computed(() => isRent.value ? 'info' : 'warning')
const sectionIcon = computed(() => isRent.value ? 'mdi-home-city-outline' : 'mdi-hand-coin-outline')
const newMovementLabel = computed(() => isRent.value ? 'Registrar pago de renta' : 'Nuevo movimiento')

const categorySummary = computed(() => {
  const key = isRent.value ? 'rent' : 'loan'
  return {
    totalLend: Number(summary.value?.byCategory?.[key]?.totalLend || 0),
    totalPayment: Number(summary.value?.byCategory?.[key]?.totalPayment || 0),
    balance: Number(summary.value?.byCategory?.[key]?.balance || 0)
  }
})

async function loadPerson() {
  try {
    const res = await api.get(`/v1/people/${personId.value}`)
    personName.value = res.data?.name || ''
  } catch (err) {
    console.error(err)
    router.back()
  }
}

async function loadSummary() {
  try {
    const res = await api.get(`/v1/people/${personId.value}/summary`)
    summary.value = res.data || { byCategory: { loan: {}, rent: {} } }
  } catch (err) {
    console.error(err)
  }
}

async function loadMovements() {
  loadingMovements.value = true
  try {
    const key = isRent.value ? 'rent' : 'loan'
    const res = await api.get(`/v1/people/${personId.value}/movements`, { params: { category: key } })
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

  const payload = {
    category: isRent.value ? 'rent' : 'loan',
    type: formData.type,
    amount: formData.amount,
    date: formData.date,
    notes: formData.notes
  }

  if (isRent.value) {
    payload.type = 'payment'
  }

  try {
    if (editingMovement.value) {
      await api.put(`/v1/person-movements/${editingMovement.value.id}`, payload)
    } else {
      await api.post(`/v1/people/${personId.value}/movements`, payload)
    }

    await Promise.all([loadSummary(), loadMovements()])
    dialogMovement.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingMovement.value = false
  }
}

function deleteMovementConfirm(movement) {
  if (confirm(`¿Eliminar movimiento de ${formatCurrency(movement.amount)}?`)) {
    deleteMovement(movement.id)
  }
}

async function deleteMovement(id) {
  try {
    await api.delete(`/v1/person-movements/${id}`)
    await Promise.all([loadSummary(), loadMovements()])
  } catch (err) {
    console.error(err)
  }
}

function goBackToCategory() {
  router.push(isRent.value ? '/rents' : '/loans')
}

onMounted(async () => {
  await Promise.all([loadPerson(), loadSummary(), loadMovements()])
})

watch(
  [() => props.category, () => route.params.id],
  async () => {
    await Promise.all([loadPerson(), loadSummary(), loadMovements()])
  }
)
</script>

<style scoped>
.stat-card {
  background-color: var(--color-surface) !important;
  border-radius: 12px;
}
</style>

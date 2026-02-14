<!-- src/pages/BalanceQuick/BalanceQuickForm.vue -->
<template>
  <div>
    <!-- Sección de Periodo mejorada -->
    <section class="card mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h2 class="text-lg font-semibold">Periodo</h2>
        <div class="flex gap-2 items-center flex-wrap">
          <div class="relative">
            <select 
              v-model="selectedPeriodId" 
              class="input pr-8 min-w-[240px] appearance-none"
              :class="{ 'opacity-60': !periods.length }"
            >
              <option v-if="!periods.length" disabled>No hay periodos disponibles</option>
              <option v-for="p in periods" :key="p.id" :value="p.id">
                {{ formatPeriod(p.startDate, p.endDate) }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text)]/50">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button class="button-icon" @click="refreshAll" title="Refrescar datos">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button class="button-secondary" @click="openCreatePeriodModal">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo periodo
          </button>
        </div>
      </div>
      <p class="mt-3 text-sm text-[var(--color-text)]/60 flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Si no existe un periodo para hoy, puedes crearlo
      </p>
    </section>

    <!-- Modal: Crear periodo (mejorado) -->
    <div v-if="showCreatePeriodModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-lg font-semibold">Crear nuevo periodo</h3>
          <button class="modal-close" @click="closeCreatePeriodModal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="grid gap-4">
            <div class="form-group">
              <label class="form-label">Fecha inicio</label>
              <input type="date" v-model="newPeriod.startDate" class="input" />
            </div>

            <div class="form-group">
              <label class="form-label">Fecha final</label>
              <input type="date" v-model="newPeriod.endDate" class="input" />
            </div>

            <div class="form-group">
              <label class="form-label">Notas <span class="text-[var(--color-text)]/40">(opcional)</span></label>
              <input v-model="newPeriod.notes" class="input" placeholder="Ej: Periodo quincenal" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="button-secondary" @click="closeCreatePeriodModal">Cancelar</button>
          <button class="button" @click="createPeriod">Crear periodo</button>
        </div>
      </div>
    </div>

    <!-- Modal: Confirmación de movimiento (mejorado) -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-container max-w-sm">
        <div class="modal-header">
          <h3 class="text-lg font-semibold">Confirmar movimiento</h3>
          <button class="modal-close" @click="closeConfirmModal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="bg-[var(--color-background)]/50 rounded-lg p-4 space-y-2">
            <div class="flex justify-between items-center py-1 border-b border-[var(--color-border)]/50">
              <span class="text-[var(--color-text)]/60">Tipo</span>
              <span class="font-medium" :class="pendingMovement.type === 'income' ? 'text-green-500' : 'text-red-500'">
                {{ pendingMovement.type === 'income' ? 'Ingreso' : 'Gasto' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-[var(--color-text)]/60">Concepto</span>
              <span class="font-medium">{{ pendingMovement.concept || '-' }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-[var(--color-text)]/60">Monto</span>
              <span class="font-medium text-lg">${{ number(pendingMovement.amount) }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-[var(--color-text)]/60">Método</span>
              <span class="font-medium">{{ formatPaymentMethod(pendingMovement.paymentMethod) }}</span>
            </div>
            <div class="flex justify-between items-center py-1 border-t border-[var(--color-border)]/50">
              <span class="text-[var(--color-text)]/60">Periodo</span>
              <span class="font-medium text-right">{{ pendingMovement.periodLabel || 'Usar periodo seleccionado' }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="button-secondary" @click="closeConfirmModal">Cancelar</button>
          <button class="button" @click="confirmSubmitMovement">Confirmar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Editar movimiento (mejorado) -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-lg font-semibold">Editar movimiento</h3>
          <button class="modal-close" @click="showEditModal=false">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="grid gap-4">
            <div class="form-group">
              <label class="form-label">Concepto</label>
              <input v-model="editingMovement.concept" class="input">
            </div>

            <div class="form-group">
              <label class="form-label">Monto</label>
              <input type="number" v-model.number="editingMovement.amount" class="input" min="0" step="0.01">
            </div>

            <div class="form-group">
              <label class="form-label">Tipo</label>
              <div class="flex gap-4 mt-1">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="editingMovement.type" value="income" class="w-4 h-4 text-[var(--color-primary)]">
                  <span>Ingreso</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="editingMovement.type" value="expense" class="w-4 h-4 text-[var(--color-primary)]">
                  <span>Gasto</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Método</label>
              <select v-model="editingMovement.paymentMethod" class="input">
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Periodo</label>
              <select v-model="editingMovement.periodId" class="input">
                <option v-for="p in periods" :key="p.id" :value="p.id">
                  {{ formatPeriod(p.startDate, p.endDate) }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="button-secondary" @click="showEditModal=false">Cancelar</button>
          <button class="button" @click="updateMovement">Guardar cambios</button>
        </div>
      </div>
    </div>

    <!-- Sección de registro rápido mejorada -->
    <section class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Registrar movimiento rápido</h2>

      <form ref="movementForm" @submit.prevent="openConfirmModal" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="form-group md:col-span-2 lg:col-span-1">
          <label class="form-label">Tipo</label>
          <div class="flex gap-4 mt-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.type" value="income" class="w-4 h-4 text-[var(--color-primary)]">
              <span>Ingreso</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.type" value="expense" class="w-4 h-4 text-[var(--color-primary)]">
              <span>Gasto</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Concepto</label>
          <input v-model="form.concept" required class="input" placeholder="Ej: Venta del día">
        </div>

        <div class="form-group">
          <label class="form-label">Monto</label>
          <input v-model.number="form.amount" required type="number" min="0.01" step="0.01" class="input" placeholder="0.00">
        </div>

        <div class="form-group">
          <label class="form-label">Método de pago</label>
          <select v-model="form.paymentMethod" required class="input">
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Periodo</label>
          <select v-model="form.periodId" class="input">
            <option :value="selectedPeriodId">Periodo actual</option>
            <option v-for="p in periods" :key="p.id" :value="p.id">{{ formatPeriod(p.startDate, p.endDate) }}</option>
          </select>
        </div>

        <div class="md:col-span-2 lg:col-span-3 flex justify-end">
          <button class="button px-8" type="submit">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Guardar movimiento
          </button>
        </div>
      </form>
    </section>

    <!-- Resumen del periodo mejorado -->
    <section class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Resumen del periodo</h2>

      <div v-if="summary" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stat-card">
          <div class="stat-label">Ingresos totales</div>
          <div class="stat-value text-green-500">${{ number(summary.totalIncome) }}</div>
          <div class="stat-detail">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              Efectivo: ${{ number(summary.incomeCash) }}
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              Tarjeta: ${{ number(summary.incomeCard) }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Gastos totales</div>
          <div class="stat-value text-red-500">${{ number(summary.totalExpense) }}</div>
          <div class="stat-detail">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              Efectivo: ${{ number(summary.expenseCash) }}
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              Tarjeta: ${{ number(summary.expenseCard) }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Balance</div>
          <div class="stat-value" :class="summary.balanceTotal >= 0 ? 'text-green-500' : 'text-red-500'">
            ${{ number(summary.balanceTotal) }}
          </div>
          <div class="stat-detail">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" :class="summary.balanceCash >= 0 ? 'bg-green-500' : 'bg-red-500'"></span>
              Efectivo: ${{ number(summary.balanceCash) }}
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" :class="summary.balanceCard >= 0 ? 'bg-green-500' : 'bg-red-500'"></span>
              Tarjeta: ${{ number(summary.balanceCard) }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-[var(--color-text)]/40 text-center py-8">
        <svg class="w-12 h-12 mx-auto mb-3 text-[var(--color-text)]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Selecciona un periodo para ver el resumen
      </div>
    </section>

    <!-- Tabla de movimientos mejorada -->
    <section class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Movimientos</h2>
        <span class="text-sm text-[var(--color-text)]/40">{{ movements.length }} registros</span>
      </div>

      <div v-if="loadingMovements" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent"></div>
        <p class="mt-2 text-sm text-[var(--color-text)]/60">Cargando movimientos...</p>
      </div>

      <div v-else-if="movements.length" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs text-[var(--color-text)]/40 border-b border-[var(--color-border)]">
              <th class="pb-3 font-medium">Tipo</th>
              <th class="pb-3 font-medium">Concepto</th>
              <th class="pb-3 font-medium">Monto</th>
              <th class="pb-3 font-medium">Método</th>
              <th class="pb-3 font-medium">Fecha</th>
              <th class="pb-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="m in movements" :key="m.id" class="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-background)]/50 transition-colors">
              <td class="py-3">
                <span class="inline-flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full" :class="m.type === 'income' ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ m.type === 'income' ? 'Ingreso' : 'Gasto' }}
                </span>
              </td>
              <td class="py-3 font-medium">{{ m.concept }}</td>
              <td class="py-3" :class="m.type === 'income' ? 'text-green-500' : 'text-red-500'">
                ${{ number(m.amount) }}
              </td>
              <td class="py-3">
                <span class="px-2 py-1 rounded-full text-xs" :class="m.paymentMethod === 'cash' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'">
                  {{ m.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta' }}
                </span>
              </td>
              <td class="py-3 text-[var(--color-text)]/60">{{ formatDate(m.createdAt) }}</td>
              <td class="py-3 text-right">
                <div class="flex gap-2 justify-end">
                  <button class="action-button" @click="openEditModal(m)" title="Editar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button class="action-button text-red-500 hover:bg-red-500/10" @click="confirmDeleteMovement(m)" title="Eliminar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-12 text-[var(--color-text)]/40">
        <svg class="w-16 h-16 mx-auto mb-3 text-[var(--color-text)]/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-lg font-medium mb-1">No hay movimientos</p>
        <p class="text-sm">Comienza registrando tu primer movimiento</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../../services/api'

const periods = ref([])
const selectedPeriodId = ref(null)
const summary = ref(null)
const movements = ref([])
const loadingMovements = ref(false)

const showEditModal = ref(false)
const editingMovement = ref(null)

// formulario
const form = ref({
  type: 'expense',
  concept: '',
  amount: null,
  paymentMethod: 'cash',
  periodId: null
})

// modal nuevo periodo
const showCreatePeriodModal = ref(false)
const newPeriod = ref({
  startDate: '',
  endDate: '',
  notes: ''
})

// modal confirmación movimiento
const showConfirmModal = ref(false)
const pendingMovement = ref({
  type: '',
  concept: '',
  amount: 0,
  paymentMethod: '',
  periodId: null,
  periodLabel: ''
})

// referencia al formulario para validar
const movementForm = ref(null)

function number(v) {
  if (v === null || v === undefined) return '0.00'
  return Number(v).toFixed(2)
}

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0,5)
}

function formatPeriod(start, end) {
  const a = new Date(start)
  const b = new Date(end)
  return `${a.getDate()}/${a.getMonth()+1}/${a.getFullYear()} — ${b.getDate()}/${b.getMonth()+1}/${b.getFullYear()}`
}

function formatPaymentMethod(m) {
  if (m === 'cash') return 'Efectivo'
  if (m === 'card') return 'Tarjeta'
  return m || '-'
}

/**
 * Load periods
 * options: { keepSelected: boolean, preferredId: id }
 */
async function loadPeriods({ keepSelected = true, preferredId = null } = {}) {
  try {
    const res = await api.get('/v1/periods')
    periods.value = res.data || []
    if (periods.value.length > 0) {
      const ids = periods.value.map(p => p.id)
      if (preferredId && ids.includes(preferredId)) {
        selectedPeriodId.value = preferredId
      } else if (keepSelected && selectedPeriodId.value && ids.includes(selectedPeriodId.value)) {
        // mantener selección actual
      } else {
        selectedPeriodId.value = periods.value[0].id
      }
      form.value.periodId = selectedPeriodId.value
    } else {
      selectedPeriodId.value = null
      form.value.periodId = null
    }
  } catch (err) {
    console.error('error loading periods', err)
    alert('Error al cargar periodos (ver consola).')
  }
}

async function loadMovements(periodId) {
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
    alert('Error al cargar movimientos.')
  } finally {
    loadingMovements.value = false
  }
}

async function loadSummary(periodId) {
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

async function refreshAll() {
  if (!selectedPeriodId.value) return
  await Promise.all([loadMovements(selectedPeriodId.value), loadSummary(selectedPeriodId.value)])
  form.value.periodId = selectedPeriodId.value
}

/**
 * submitMovement: envía el movimiento al backend.
 * Si se pasa payload, lo usa; si no, construye desde form.
 */
async function submitMovement(payload = null) {
  try {
    const finalPayload = payload ?? {
      type: form.value.type,
      concept: form.value.concept,
      amount: Number(form.value.amount),
      paymentMethod: form.value.paymentMethod,
      periodId: form.value.periodId || selectedPeriodId.value
    }

    await api.post('/v1/period-movements', finalPayload)

    // limpiar formulario (excepto tipo y método)
    form.value.concept = ''
    form.value.amount = null

    // --- REFRESCAR TODA LA DATA: periods, movimientos y resumen ---
    await loadPeriods({ keepSelected: true, preferredId: finalPayload.periodId })
    await refreshAll()
  } catch (err) {
    console.error('error creating movement', err)
    alert(err?.response?.data?.message || 'Error al guardar movimiento.')
  }
}

function openEditModal(m) {
  editingMovement.value = {
    id: m.id,
    type: m.type,
    concept: m.concept,
    amount: m.amount,
    paymentMethod: m.paymentMethod,
    periodId: m.periodId
  }
  showEditModal.value = true
}

async function updateMovement() {
  try {
    const m = editingMovement.value

    await api.patch(`/v1/period-movement/${m.id}`, {
      type: m.type,
      concept: m.concept,
      amount: Number(m.amount),
      paymentMethod: m.paymentMethod,
      periodId: m.periodId
    })

    showEditModal.value = false

    // refrescar todo
    await loadPeriods({ keepSelected: true, preferredId: m.periodId })
    await refreshAll()

  } catch (err) {
    console.error(err)
    alert('Error al actualizar movimiento')
  }
}

function confirmDeleteMovement(m) {
  if (!confirm(`¿Eliminar movimiento "${m.concept}" por $${number(m.amount)}?`)) return
  deleteMovement(m.id)
}

async function deleteMovement(id) {
  try {
    await api.delete(`/v1/period-movements/${id}`)

    // refrescar TODO
    await loadPeriods({ keepSelected: true, preferredId: selectedPeriodId.value })
    await refreshAll()

  } catch (err) {
    console.error(err)
    alert('Error al eliminar movimiento')
  }
}

/* --- Confirm modal handlers --- */
function openConfirmModal() {
  // validar el form usando la referencia nativa si existe
  const el = movementForm.value
  if (el && typeof el.checkValidity === 'function') {
    if (!el.checkValidity()) {
      // si no es válido, invocar reportValidity para mostrar mensajes nativos
      if (typeof el.reportValidity === 'function') el.reportValidity()
      return
    }
  } else {
    // fallback: validaciones mínimas
    if (!form.value.concept || !form.value.amount) {
      alert('Completa concepto y monto.')
      return
    }
  }

  // preparar pendingMovement (copia para mostrar en modal)
  const chosenPeriodId = form.value.periodId || selectedPeriodId.value
  const periodObj = periods.value.find(p => p.id === chosenPeriodId)
  pendingMovement.value = {
    type: form.value.type,
    concept: form.value.concept,
    amount: Number(form.value.amount),
    paymentMethod: form.value.paymentMethod,
    periodId: chosenPeriodId,
    periodLabel: periodObj ? formatPeriod(periodObj.startDate, periodObj.endDate) : 'Usar periodo seleccionado'
  }

  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
}

async function confirmSubmitMovement() {
  // usar los datos de pendingMovement para el payload (evita race con form)
  const payload = {
    type: pendingMovement.value.type,
    concept: pendingMovement.value.concept,
    amount: Number(pendingMovement.value.amount),
    paymentMethod: pendingMovement.value.paymentMethod,
    periodId: pendingMovement.value.periodId
  }
  showConfirmModal.value = false
  await submitMovement(payload)
}

/* --- Crear periodo modal --- */
function openCreatePeriodModal() {
  const today = new Date().toISOString().slice(0,10)
  newPeriod.value.startDate = today
  newPeriod.value.endDate = today
  newPeriod.value.notes = ''
  showCreatePeriodModal.value = true
}

function closeCreatePeriodModal() {
  showCreatePeriodModal.value = false
}

async function createPeriod() {
  try {
    if (!newPeriod.value.startDate || !newPeriod.value.endDate) {
      alert('Selecciona fecha inicio y fecha final.')
      return
    }
    if (new Date(newPeriod.value.startDate) > new Date(newPeriod.value.endDate)) {
      alert('La fecha de inicio no puede ser posterior a la fecha final.')
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
  } catch (err) {
    console.error('create period error', err)
    alert('No se pudo crear periodo. Ver consola.')
  }
}

/* --- lifecycle --- */
onMounted(async () => {
  await loadPeriods()
  if (selectedPeriodId.value) {
    await refreshAll()
  }
})

watch(selectedPeriodId, async (nv) => {
  if (!nv) return
  form.value.periodId = nv
  await refreshAll()
})
</script>

<style scoped>
/* Estilos base mejorados */
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

/* Inputs y selects */
.input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.input:hover:not(:focus) {
  border-color: color-mix(in srgb, var(--color-border) 70%, var(--color-text));
}

/* Botones */
.button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.button:active {
  transform: translateY(0);
}

.button-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-secondary:hover {
  background-color: var(--color-background);
  border-color: var(--color-text);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.button-icon {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.625rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.button-icon:hover {
  background-color: var(--color-background);
  border-color: var(--color-text);
  transform: translateY(-1px);
}

.action-button {
  background-color: transparent;
  border: none;
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.6;
}

.action-button:hover {
  opacity: 1;
  background-color: var(--color-background);
  transform: translateY(-1px);
}

/* Formulario */
.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--color-text);
  opacity: 0.8;
}

/* Modales */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in srgb, var(--color-background) 60%, transparent);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 28rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: color-mix(in srgb, var(--color-background) 50%, transparent);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--color-text);
  opacity: 0.5;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  opacity: 1;
  background-color: var(--color-background);
}

/* Tarjetas de estadísticas */
.stat-card {
  background-color: var(--color-background);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

.stat-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.8;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--color-border) 70%, var(--color-text));
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
  
  .modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}

/* Utilidades adicionales */
.text-gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
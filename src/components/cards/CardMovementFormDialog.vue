<!-- src/components/cards/CardMovementFormDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ isEditing ? 'Editar movimiento' : 'Nuevo movimiento' }}
      </v-card-title>

      <v-form @submit.prevent="handleSubmit">
        <v-card-text>
          <template v-if="isCreditCard">
            <v-select
              v-model="form.operationType"
              :items="creditOperationTypes"
              label="Operación"
              :rules="[v => !!v || 'Operación es requerida']"
              required
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-if="showMsiSelect"
              v-model.number="form.installments"
              :items="availableMsiTerms"
              label="MSI"
              variant="outlined"
              density="comfortable"
              hint="Si eliges un plazo, se generan las mensualidades automáticamente"
              persistent-hint
              class="mb-3"
            />
          </template>

          <v-select
            v-else
            v-model="form.type"
            :items="movementTypes"
            label="Tipo"
            :rules="[v => !!v || 'Tipo es requerido']"
            required
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="form.concept"
            label="Concepto"
            :rules="[v => !!v || 'Concepto es requerido']"
            required
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-textarea
            v-model="form.description"
            label="Descripción (opcional)"
            rows="2"
            variant="outlined"
            density="comfortable"
            auto-grow
            class="mb-3"
          />

          <v-text-field
            v-model.number="form.amount"
            label="Monto"
            type="number"
            min="0.01"
            step="0.01"
            :rules="[
              v => !!v || 'Monto es requerido',
              v => v > 0 || 'Monto debe ser mayor a 0'
            ]"
            required
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="form.date"
            label="Fecha"
            type="date"
            :rules="[v => !!v || 'Fecha es requerida']"
            required
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            type="submit"
            :loading="loading"
          >
            {{ isEditing ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  movement: { type: Object, default: null },
  card: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const movementTypes = [
  { title: 'Ingreso', value: 'income' },
  { title: 'Egreso', value: 'expense' }
]

const creditOperationTypes = [
  { title: 'Compra', value: 'purchase' },
  { title: 'Pago', value: 'payment' },
  { title: 'Devolución', value: 'refund' },
  { title: 'Interés', value: 'interest' },
  { title: 'Comisión por atraso', value: 'late_fee' },
  { title: 'Disposición de efectivo', value: 'cash_advance' }
]

const flowTypeByOperation = {
  purchase: 'expense',
  interest: 'expense',
  late_fee: 'expense',
  cash_advance: 'expense',
  payment: 'income',
  refund: 'income'
}

const buildDefaultForm = () => ({
  type: 'expense',
  operationType: 'purchase',
  concept: '',
  description: '',
  amount: null,
  installments: null,
  date: new Date().toISOString().slice(0, 10)
})

const form = ref(buildDefaultForm())

const isEditing = computed(() => !!props.movement)
const isCreditCard = computed(() => props.card?.cardType === 'credit')
const showMsiSelect = computed(() => isCreditCard.value && form.value.operationType === 'purchase' && props.card?.msiEnabled)

const availableMsiTerms = computed(() => {
  const terms = Array.isArray(props.card?.availableMsiTerms)
    ? props.card.availableMsiTerms
    : [3, 6, 9, 12]

  return terms
    .map((term) => Number(term))
    .filter((term) => Number.isFinite(term) && term > 1)
    .sort((a, b) => a - b)
})

watch(() => props.modelValue, (newVal) => {
  if (!newVal) return

  if (props.movement) {
    form.value = {
      ...buildDefaultForm(),
      ...props.movement,
      operationType: props.movement.operationType
        || (props.movement.type === 'income' ? 'payment' : 'purchase'),
      installments: props.movement.installments || null,
      date: props.movement.date || new Date().toISOString().slice(0, 10)
    }
    return
  }

  const defaults = buildDefaultForm()
  if (isCreditCard.value && showMsiSelect.value && availableMsiTerms.value.length) {
    defaults.installments = availableMsiTerms.value[0]
  }
  form.value = defaults
})

watch(showMsiSelect, (enabled) => {
  if (!enabled) {
    form.value.installments = null
    return
  }

  if (!form.value.installments && availableMsiTerms.value.length) {
    form.value.installments = availableMsiTerms.value[0]
  }
})

const handleSubmit = () => {
  const payload = {
    concept: form.value.concept,
    description: form.value.description || null,
    amount: Number(form.value.amount || 0),
    date: form.value.date
  }

  if (isCreditCard.value) {
    payload.operationType = form.value.operationType
    payload.type = flowTypeByOperation[form.value.operationType] || 'expense'
    payload.installments = showMsiSelect.value ? Number(form.value.installments || 1) : 1
  } else {
    payload.type = form.value.type
  }

  emit('save', payload)
}
</script>

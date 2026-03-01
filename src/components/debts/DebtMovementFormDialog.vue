<!-- src/components/debts/DebtMovementFormDialog.vue -->
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
          <!-- Si es renta, forzamos que sea pago y mostramos un chip informativo -->
          <template v-if="isRent">
            <div class="mb-3 d-flex align-center">
              <v-chip size="small" color="success" variant="tonal" class="mr-3">
                Pago (renta)
              </v-chip>
              <span class="text-caption text-medium-emphasis">
                Las rentas solo permiten registrar pagos. El tipo se establecerá automáticamente.
              </span>
            </div>
          </template>

          <!-- Selector de tipo solo si NO es renta -->
          <v-select
            v-if="!isRent"
            v-model="form.type"
            :items="movementTypes"
            item-title="title"
            item-value="value"
            label="Tipo"
            :rules="[v => !!v || 'Tipo es requerido']"
            required
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model.number="form.amount"
            label="Monto"
            type="number"
            min="0.01"
            step="0.01"
            :rules="amountRules"
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
            class="mb-3"
          />

          <v-textarea
            v-model="form.notes"
            label="Notas (opcional)"
            rows="2"
            variant="outlined"
            density="comfortable"
            auto-grow
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
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  movement: { type: Object, default: null },
  debtId: { type: [String, Number], required: true },
  loading: { type: Boolean, default: false },
  // Nuevo: indica si este debt es una renta (solo pagos)
  isRent: { type: Boolean, default: false },
  // Nuevo: permite preseleccionar el tipo cuando se abre (opcional)
  defaultMovementType: { type: String, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'save'])

const movementTypes = [
  { title: 'Préstamo', value: 'lend' },
  { title: 'Pago', value: 'payment' }
]

const form = ref({
  type: 'lend',
  amount: null,
  date: new Date().toISOString().slice(0, 10),
  notes: ''
})

const isEditing = computed(() => !!props.movement)

const amountRules = [
  v => !!v || 'Monto es requerido',
  v => Number(v) > 0 || 'Monto debe ser mayor a 0'
]

// Inicializar formulario cuando se abre el diálogo o cambia el movimiento
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) return

    if (props.movement) {
      form.value = {
        type: props.movement.type || (props.defaultMovementType ?? 'lend'),
        amount: Number(props.movement.amount) || null,
        date: props.movement.date ? props.movement.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        notes: props.movement.notes || ''
      }
    } else {
      // Nuevo movimiento: preferir defaultMovementType, si no existe usar 'lend' o 'payment' si es renta
      form.value = {
        type: props.defaultMovementType ?? (props.isRent ? 'payment' : 'lend'),
        amount: null,
        date: new Date().toISOString().slice(0, 10),
        notes: ''
      }
    }

    // Si es renta, forzamos el tipo a 'payment'
    if (props.isRent) {
      form.value.type = 'payment'
    }
  },
  { immediate: true }
)

// Si en runtime cambia isRent mientras el diálogo está abierto, aseguramos el tipo
watch(
  () => props.isRent,
  (newVal) => {
    if (newVal) {
      form.value.type = 'payment'
    } else {
      // si dejó de ser renta y no estamos editando, restablecemos al default o 'lend'
      if (!props.movement) {
        form.value.type = props.defaultMovementType ?? 'lend'
      }
    }
  }
)

const handleSubmit = () => {
  // Validaciones rápidas antes de emitir
  const amount = Number(form.value.amount)
  if (!amount || amount <= 0) {
    // Emitimos un error superficial (puedes mostrar snackbar desde el padre)
    // Pero evitamos bloquear UX: simplemente no emitimos si invalid
    return
  }

  // Si es renta, nos aseguramos que sea 'payment' y monto positivo
  if (props.isRent) {
    form.value.type = 'payment'
    form.value.amount = Math.abs(amount)
  }

  emit('save', {
    debtId: props.debtId,
    ...form.value
  })
}
</script>
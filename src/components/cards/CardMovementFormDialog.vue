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
          <v-select
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
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  movement: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const movementTypes = [
  { title: 'Ingreso', value: 'income' },
  { title: 'Egreso', value: 'expense' }
]

const form = ref({
  type: 'expense',
  concept: '',
  description: '',
  amount: null,
  date: new Date().toISOString().slice(0, 10)
})

const isEditing = computed(() => !!props.movement)

// Reset form cuando se abre/cierra o cambia el movimiento
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.movement) {
    // Modo edición
    form.value = {
      type: props.movement.type || 'expense',
      concept: props.movement.concept || '',
      description: props.movement.description || '',
      amount: props.movement.amount || null,
      date: props.movement.date || new Date().toISOString().slice(0, 10)
    }
  } else if (newVal) {
    // Modo creación
    form.value = {
      type: 'expense',
      concept: '',
      description: '',
      amount: null,
      date: new Date().toISOString().slice(0, 10)
    }
  }
})

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>
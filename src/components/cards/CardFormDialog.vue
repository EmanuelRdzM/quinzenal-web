<!-- src/components/cards/CardFormDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ isEditing ? 'Editar tarjeta' : 'Nueva tarjeta' }}
      </v-card-title>

      <v-form @submit.prevent="handleSubmit">
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Nombre"
            :rules="[v => !!v || 'Nombre es requerido']"
            required
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model.number="form.initialBalance"
            label="Saldo inicial"
            type="number"
            min="0"
            step="0.01"
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
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  card: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  name: '',
  initialBalance: 0,
  notes: ''
})

const isEditing = computed(() => !!props.card)

// Reset form cuando se abre/cierra o cambia la tarjeta
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.card) {
    // Modo edición
    form.value = {
      name: props.card.name || '',
      initialBalance: props.card.initialBalance ?? 0,
      notes: props.card.notes || ''
    }
  } else if (newVal) {
    // Modo creación
    form.value = {
      name: '',
      initialBalance: 0,
      notes: ''
    }
  }
})

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>
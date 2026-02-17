<!-- src/components/debts/DebtFormDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ isEditing ? 'Editar deuda' : 'Nueva deuda' }}
      </v-card-title>

      <v-form @submit.prevent="handleSubmit">
        <v-card-text>
          <v-select
            v-model="form.type"
            :items="debtTypes"
            label="Tipo"
            :rules="[v => !!v || 'Tipo es requerido']"
            required
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="form.description"
            label="Descripción (opcional)"
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
  debt: { type: Object, default: null },
  personId: { type: [String, Number], required: true },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const debtTypes = [
  { title: 'Préstamo', value: 'loan' },
  { title: 'Renta', value: 'rent' }
]

const form = ref({
  type: 'loan',
  description: ''
})

const isEditing = computed(() => !!props.debt)

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.debt) {
    form.value = {
      type: props.debt.type || 'loan',
      description: props.debt.description || ''
    }
  } else if (newVal) {
    form.value = { type: 'loan', description: '' }
  }
})

const handleSubmit = () => {
  emit('save', {
    personId: props.personId,
    ...form.value
  })
}
</script>
<!-- src/components/debts/PersonFormDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ isEditing ? 'Editar persona' : 'Nueva persona' }}
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
  person: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  name: '',
  notes: ''
})

const isEditing = computed(() => !!props.person)

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.person) {
    form.value = {
      name: props.person.name || '',
      notes: props.person.notes || ''
    }
  } else if (newVal) {
    form.value = { name: '', notes: '' }
  }
})

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>
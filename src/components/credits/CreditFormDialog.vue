<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
    transition="dialog-bottom-transition"
  >
    <v-card class="pa-4 rounded-xl">
      <v-card-title class="d-flex align-center pa-4">
        <v-avatar :color="isEditing ? 'warning' : 'success'" variant="tonal" class="mr-3">
          <v-icon :color="isEditing ? 'warning' : 'success'">
            {{ isEditing ? 'mdi-credit-card-edit' : 'mdi-credit-card-plus' }}
          </v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-bold">
          {{ isEditing ? 'Editar crédito' : 'Nuevo crédito' }}
        </span>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider></v-divider>

      <v-form @submit.prevent="handleSubmit">
        <v-card-text class="pa-4">
          <v-text-field
            v-model="form.name"
            label="Nombre del crédito"
            :rules="[v => !!v || 'El nombre es requerido']"
            required
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-credit-card"
            class="mb-3"
            autofocus
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.totalAmount"
                label="Monto total"
                type="number"
                :rules="[v => !!v || 'El monto es requerido', v => v > 0 || 'Debe ser mayor a 0']"
                required
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash"
                prefix="$"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.months"
                label="Plazo (meses)"
                type="number"
                :rules="[v => !!v || 'El plazo es requerido', v => v > 0 || 'Debe ser mayor a 0']"
                required
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="form.notes"
            label="Notas adicionales"
            rows="2"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-note-text"
            auto-grow
            hint="Información adicional relevante (opcional)"
            persistent-hint
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="$emit('update:modelValue', false)"
            class="mr-2"
          >
            Cancelar
          </v-btn>
          <v-btn
            :color="isEditing ? 'warning' : 'success'"
            variant="flat"
            type="submit"
            :loading="loading"
            :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-check'"
            class="px-6"
          >
            {{ isEditing ? 'Guardar cambios' : 'Crear crédito' }}
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
  credit: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  name: '',
  totalAmount: null,
  months: null,
  notes: ''
})

const isEditing = computed(() => !!props.credit)

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.credit) {
    form.value = {
      name: props.credit.name || '',
      totalAmount: props.credit.totalAmount || null,
      months: props.credit.months || null,
      notes: props.credit.notes || ''
    }
  } else if (newVal) {
    form.value = { name: '', totalAmount: null, months: null, notes: '' }
  }
})

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>
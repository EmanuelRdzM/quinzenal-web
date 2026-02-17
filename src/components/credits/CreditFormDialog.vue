<!-- src/components/credits/CreditFormDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="700px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ isEditing ? 'Editar crédito' : 'Nuevo crédito' }}
      </v-card-title>

      <v-form @submit.prevent="handleSubmit">
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Producto / Concepto"
            :rules="[v => !!v || 'Concepto es requerido']"
            required
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.totalAmount"
                label="Precio total"
                type="number"
                min="0.01"
                step="0.01"
                :rules="[v => !!v || 'Total es requerido', v => v > 0 || 'Debe ser mayor a 0']"
                required
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.months"
                label="Meses"
                type="number"
                min="1"
                :rules="[v => !!v || 'Meses es requerido', v => v > 0 || 'Debe ser mayor a 0']"
                required
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4" v-if="isEditing">
              <v-text-field
                v-model.number="form.monthlyAmount"
                readonly
                disabled
                label="Pago mensual"
                type="number"
                min="0.01"
                step="0.01"
                variant="outlined"
                density="comfortable"
                hint="Se calculará automáticamente"
                persistent-hint
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.startDate"
                label="Fecha inicio"
                type="date"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.notes"
                label="Notas (opcional)"
                rows="2"
                variant="outlined"
                density="comfortable"
                auto-grow
              />
            </v-col>
          </v-row>

          <div class="mt-2 text-caption text-medium-emphasis">
            Si no indicas pago mensual, el backend calculará el pago base (ajuste en último mes si aplica).
          </div>
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
  credit: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  name: '',
  totalAmount: null,
  months: 1,
  monthlyAmount: null,
  startDate: '',
  notes: ''
})

const isEditing = computed(() => !!props.credit)

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.credit) {
    form.value = {
      name: props.credit.name || '',
      totalAmount: props.credit.totalAmount || null,
      months: props.credit.months || 1,
      monthlyAmount: props.credit.monthlyAmount || null,
      startDate: props.credit.startDate || '',
      notes: props.credit.notes || ''
    }
  } else if (newVal) {
    form.value = {
      name: '',
      totalAmount: null,
      months: 1,
      monthlyAmount: null,
      startDate: '',
      notes: ''
    }
  }
})

const handleSubmit = () => {
  const payload = {
    name: form.value.name,
    totalAmount: Number(form.value.totalAmount),
    months: Number(form.value.months),
    startDate: form.value.startDate || null,
    notes: form.value.notes || null
  }
  emit('save', payload)
}
</script>
<!-- src/components/credits/CreditPaymentFormDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ isEditing ? 'Editar pago' : 'Nuevo pago' }}
      </v-card-title>

      <v-form @submit.prevent="handleSubmit">
        <v-card-text>
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
            :hint="!isEditing ? `Pago sugerido: $${formatNumber(suggestedAmount)}` : ''"
            persistent-hint
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

          <v-checkbox
            v-model="form.allowOverpay"
            label="Permitir sobrepago"
            hint="El backend valida que los pagos no excedan el total salvo que marques esta opción"
            persistent-hint
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
            {{ isEditing ? 'Guardar' : 'Registrar' }}
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
  payment: { type: Object, default: null },
  creditId: { type: [String, Number], required: true },
  suggestedAmount: { type: Number, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  amount: null,
  date: new Date().toISOString().slice(0, 10),
  allowOverpay: false
})

const isEditing = computed(() => !!props.payment)

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.payment) {
    form.value = {
      amount: props.payment.amount || null,
      date: props.payment.date || new Date().toISOString().slice(0, 10),
      allowOverpay: false
    }
  } else if (newVal) {
    form.value = {
      amount: props.suggestedAmount,
      date: new Date().toISOString().slice(0, 10),
      allowOverpay: false
    }
  }
})

// Actualizar monto sugerido cuando cambia
watch(() => props.suggestedAmount, (newVal) => {
  if (!isEditing.value && props.modelValue) {
    form.value.amount = newVal
  }
})

const handleSubmit = () => {
  const payload = {
    creditId: Number(props.creditId),
    amount: Number(form.value.amount),
    date: form.value.date,
    allowOverpay: form.value.allowOverpay === true
  }
  
  emit('save', payload)
}

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}
</script>
<!-- src/components/cards/CardFormDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="680px"
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

          <v-select
            v-model="form.cardType"
            label="Tipo de tarjeta"
            :items="cardTypes"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model.number="form.initialBalance"
            :label="isCreditCard ? 'Saldo inicial usado (deuda)' : 'Saldo inicial'"
            type="number"
            min="0"
            step="0.01"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <template v-if="isCreditCard">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              Configura corte, pago, interés, anualidad y MSI según las reglas de tu tarjeta.
            </v-alert>

            <v-text-field
              v-model.number="form.creditLimit"
              label="Límite de crédito"
              type="number"
              min="1"
              step="0.01"
              :rules="[
                v => Number(v) > 0 || 'El límite debe ser mayor a 0'
              ]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.statementCutoffDay"
                  label="Día de corte"
                  type="number"
                  min="1"
                  max="28"
                  :rules="[
                    v => Number(v) >= 1 || 'Mínimo 1',
                    v => Number(v) <= 28 || 'Máximo 28'
                  ]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.paymentDueDay"
                  label="Día límite de pago"
                  type="number"
                  min="1"
                  max="28"
                  :rules="[
                    v => Number(v) >= 1 || 'Mínimo 1',
                    v => Number(v) <= 28 || 'Máximo 28'
                  ]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.annualInterestRate"
                  label="Interés anual (CAT aprox. %)"
                  type="number"
                  min="0"
                  max="120"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.minimumPaymentRate"
                  label="Pago obligatorio del corte (%)"
                  type="number"
                  min="1"
                  max="100"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                  hint="100% = pago total del estado de cuenta (estilo NU)"
                  persistent-hint
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model.number="form.latePaymentFee"
              label="Comisión por atraso"
              type="number"
              min="0"
              step="0.01"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.annualFee"
                  label="Anualidad"
                  type="number"
                  min="0"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                  hint="0 = no aplica"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model.number="form.annualFeeMonth"
                  :items="annualFeeMonths"
                  label="Mes de cobro de anualidad"
                  variant="outlined"
                  density="comfortable"
                  :disabled="Number(form.annualFee || 0) <= 0"
                  clearable
                />
              </v-col>
            </v-row>

            <v-switch
              v-model="form.msiEnabled"
              label="Habilitar MSI"
              color="primary"
              inset
              class="mb-2"
            />

            <v-select
              v-if="form.msiEnabled"
              v-model="form.availableMsiTerms"
              label="Plazos MSI disponibles (meses)"
              :items="msiTermOptions"
              multiple
              chips
              closable-chips
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />
          </template>

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

const cardTypes = [
  { title: 'Débito / Efectivo', value: 'debit' },
  { title: 'Crédito', value: 'credit' }
]

const msiTermOptions = [3, 6, 9, 12, 18, 24]
const annualFeeMonths = [
  { title: 'Enero', value: 1 },
  { title: 'Febrero', value: 2 },
  { title: 'Marzo', value: 3 },
  { title: 'Abril', value: 4 },
  { title: 'Mayo', value: 5 },
  { title: 'Junio', value: 6 },
  { title: 'Julio', value: 7 },
  { title: 'Agosto', value: 8 },
  { title: 'Septiembre', value: 9 },
  { title: 'Octubre', value: 10 },
  { title: 'Noviembre', value: 11 },
  { title: 'Diciembre', value: 12 }
]

const buildDefaultForm = () => ({
  name: '',
  cardType: 'debit',
  initialBalance: 0,
  creditLimit: 10000,
  statementCutoffDay: 20,
  paymentDueDay: 10,
  annualInterestRate: 55,
  minimumPaymentRate: 100,
  latePaymentFee: 0,
  annualFee: 0,
  annualFeeMonth: null,
  msiEnabled: false,
  availableMsiTerms: [3, 6, 9, 12],
  notes: ''
})

const form = ref(buildDefaultForm())

const isEditing = computed(() => !!props.card)
const isCreditCard = computed(() => form.value.cardType === 'credit')

watch(() => props.modelValue, (newVal) => {
  if (!newVal) return

  if (props.card) {
    form.value = {
      ...buildDefaultForm(),
      ...props.card,
      cardType: props.card.cardType || 'debit',
      availableMsiTerms: Array.isArray(props.card.availableMsiTerms)
        ? props.card.availableMsiTerms.map(v => Number(v)).filter(v => Number.isFinite(v))
        : [3, 6, 9, 12]
    }
    return
  }

  form.value = buildDefaultForm()
})

const handleSubmit = () => {
  const payload = {
    name: form.value.name,
    cardType: form.value.cardType,
    initialBalance: Number(form.value.initialBalance || 0),
    notes: form.value.notes || null
  }

  if (payload.cardType === 'credit') {
    payload.creditLimit = Number(form.value.creditLimit || 0)
    payload.statementCutoffDay = Number(form.value.statementCutoffDay || 0)
    payload.paymentDueDay = Number(form.value.paymentDueDay || 0)
    payload.annualInterestRate = Number(form.value.annualInterestRate || 0)
    payload.minimumPaymentRate = Number(form.value.minimumPaymentRate || 0)
    payload.latePaymentFee = Number(form.value.latePaymentFee || 0)
    payload.annualFee = Number(form.value.annualFee || 0)
    payload.annualFeeMonth = payload.annualFee > 0
      ? Number(form.value.annualFeeMonth || 1)
      : null
    payload.msiEnabled = Boolean(form.value.msiEnabled)
    payload.availableMsiTerms = payload.msiEnabled
      ? [...new Set((form.value.availableMsiTerms || []).map(v => Number(v)).filter(v => v > 1))].sort((a, b) => a - b)
      : []
  }

  emit('save', payload)
}
</script>

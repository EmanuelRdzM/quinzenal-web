<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">{{ title }}</span>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <slot name="form"></slot>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          @click="$emit('save')"
        >
          {{ saveText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Formulario' },
  saveText: { type: String, default: 'Guardar' },
  loading: { type: Boolean, default: false }
})

defineEmits(['update:modelValue', 'save'])
</script>
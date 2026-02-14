<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400"
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

      <v-card-text>
        <slot name="content">
          <div v-if="items.length" class="rounded pa-4">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="d-flex justify-space-between py-2"
              :class="{ 'border-b': index < items.length - 1 }"
            >
              <span class="text-medium-emphasis">{{ item.label }}</span>
              <span class="font-weight-medium" :class="item.class">{{ item.value }}</span>
            </div>
          </div>
        </slot>
      </v-card-text>

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
          @click="$emit('confirm')"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Confirmar' },
  items: { type: Array, default: () => [] }
})

defineEmits(['update:modelValue', 'confirm'])
</script>
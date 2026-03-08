<template>
  <section class="max-w-5xl mx-auto">
    <!-- Header con más padding -->
    <v-card
      class="pa-6 pa-lg-8 mb-8"
      variant="outlined"
      :style="{ borderColor: 'var(--color-border)', background: 'var(--gradient-surface)' }"
    >
      <h1 class="text-h5 text-lg-h4 font-weight-semibold tracking-tight">Configuración visual</h1>
      <p class="mt-3 text-caption text-lg-body-2 text-[var(--color-text)]/70 text--secondary leading-relaxed">
        Ajusta la paleta principal de la aplicación. Los cambios se guardan automáticamente.
      </p>
    </v-card>

    <v-row class="mb-8">
      <!-- Paletas predefinidas -->
      <v-col cols="12" lg="8">
        <v-card
          class="pa-6 pa-lg-8 h-100"
          variant="outlined"
          :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }"
        >
          <div class="space-y-2">
            <h2 class="text-h6 font-weight-semibold tracking-tight">Paletas predefinidas</h2>
            <p class="text-caption text-[var(--color-text-muted)] leading-relaxed">
              Elige una base rápida para el estilo general.
            </p>
          </div>

          <v-row class="mt-8">
            <v-col
              v-for="palette in palettes"
              :key="palette.id"
              cols="12"
              sm="6"
            >
              <v-card
                class="group relative rounded-xl cursor-pointer transition-all duration-200"
                :class="[
                  paletteId === palette.id && !useCustom
                    ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)]'
                    : 'hover:border-[var(--color-primary)]/30'
                ]"
                :style="{ borderColor: 'var(--color-border)' }"
                variant="outlined"
                @click="selectPalette(palette.id)"
              >
                <v-card-item class="pa-5">
                  <div class="d-flex align-center justify-space-between">
                    <span class="font-weight-medium text-[var(--color-text)]">{{ palette.name }}</span>
                    <v-chip
                      v-if="paletteId === palette.id && !useCustom"
                      size="x-small"
                      color="primary"
                      class="animate-pulse"
                      :style="{ width: '10px', height: '10px', padding: 0 }"
                    />
                  </div>

                  <div class="mt-5 d-flex flex-wrap align-center ga-4">
                    <div class="d-flex align-center ga-2">
                      <span class="h-8 w-12 rounded-lg shadow-sm" :style="{ backgroundColor: palette.primary }" />
                      <span class="h-8 w-12 rounded-lg shadow-sm" :style="{ backgroundColor: palette.secondary }" />
                    </div>
                    <v-chip
                      size="small"
                      variant="flat"
                      class="text-xs font-mono"
                      :style="{ 
                        backgroundColor: 'var(--color-surface-alt)',
                        color: 'var(--color-text-muted)'
                      }"
                    >
                      {{ palette.primary }} / {{ palette.secondary }}
                    </v-chip>
                  </div>

                  <!-- Efecto hover sutil -->
                  <div 
                    class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    :style="{ backgroundColor: 'var(--color-primary)', opacity: 0.05 }"
                  />
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Color personalizado -->
      <v-col cols="12" lg="4">
        <v-card
          class="pa-6 pa-lg-8"
          variant="outlined"
          :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }"
        >
          <div class="space-y-2">
            <h2 class="text-h6 font-weight-semibold tracking-tight">Color personalizado</h2>
            <p class="text-caption text-[var(--color-text-muted)] leading-relaxed">
              Define tu combinación principal.
            </p>
          </div>

          <!-- Toggle con más padding -->
          <v-card
            class="mt-8 d-flex align-center justify-space-between rounded-xl px-5 py-4 cursor-pointer"
            variant="outlined"
            :style="{ borderColor: 'var(--color-border)' }"
            @click="useCustom = !useCustom; if(useCustom) enableCustomColors()"
          >
            <span class="text-body-2 font-weight-medium text-[var(--color-text)]">Usar colores personalizados</span>
            <v-switch
              :model-value="useCustom"
              color="primary"
              hide-details
              density="compact"
              class="mt-0"
              @click.stop
              @update:model-value="(val) => { useCustom = val; if(val) enableCustomColors() }"
            />
          </v-card>

          <div class="mt-8">
            <v-row dense>
              <v-col cols="12" class="mb-6">
                <label class="d-block text-body-2 font-weight-medium text-[var(--color-text)] mb-3">
                  Color primario
                </label>
                <div class="d-flex align-center ga-3">
                  <input 
                    type="color" 
                    class="h-12 w-16 rounded-lg border p-1 cursor-pointer bg-transparent"
                    :style="{ borderColor: 'var(--color-border)' }"
                    v-model="customPrimary" 
                    @input="enableCustomColors" 
                  />
                  <v-text-field
                    v-model="customPrimary"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    placeholder="#7c3aed"
                    class="flex-grow-1"
                    :style="{
                      '--v-field-border-color': 'var(--color-border)',
                      '--v-field-focused-color': 'var(--color-primary)'
                    }"
                    @focus="enableCustomColors"
                  />
                </div>
              </v-col>

              <v-col cols="12">
                <label class="d-block text-body-2 font-weight-medium text-[var(--color-text)] mb-3">
                  Color secundario
                </label>
                <div class="d-flex align-center ga-3">
                  <input 
                    type="color" 
                    class="h-12 w-16 rounded-lg border p-1 cursor-pointer bg-transparent"
                    :style="{ borderColor: 'var(--color-border)' }"
                    v-model="customSecondary" 
                    @input="enableCustomColors" 
                  />
                  <v-text-field
                    v-model="customSecondary"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    placeholder="#0ea5e9"
                    class="flex-grow-1"
                    :style="{
                      '--v-field-border-color': 'var(--color-border)',
                      '--v-field-focused-color': 'var(--color-primary)'
                    }"
                    @focus="enableCustomColors"
                  />
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Vista previa mejorada -->
    <v-card
      class="pa-6 pa-lg-8"
      variant="outlined"
      :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }"
    >
      <div class="space-y-2">
        <h2 class="text-h6 font-weight-semibold tracking-tight">Vista previa en vivo</h2>
        <p class="text-caption text-[var(--color-text-muted)] leading-relaxed">
          Así se aplica la combinación seleccionada en la interfaz.
        </p>
      </div>

      <v-row class="mt-8">
        <!-- Muestra de color primario -->
        <v-col cols="12" md="4">
          <v-card
            class="pa-5"
            variant="outlined"
            :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }"
          >
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 font-weight-medium text-[var(--color-text-muted)]">Primario</span>
              <v-chip
                size="x-small"
                class="text-primary"
                :style="{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }"
              >
                activo
              </v-chip>
            </div>
            <div class="d-flex align-center ga-4">
              <span 
                class="h-10 w-10 rounded-lg shadow-md" 
                :style="{ backgroundColor: activeColors.primary }" 
              />
              <span class="font-mono text-body-2 font-weight-medium text-[var(--color-text)]">
                {{ activeColors.primary }}
              </span>
            </div>
          </v-card>
        </v-col>

        <!-- Muestra de color secundario -->
        <v-col cols="12" md="4">
          <v-card
            class="pa-5"
            variant="outlined"
            :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }"
          >
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 font-weight-medium text-[var(--color-text-muted)]">Secundario</span>
              <v-chip
                size="x-small"
                class="text-secondary"
                :style="{ backgroundColor: 'var(--color-secondary)', opacity: 0.1 }"
              >
                activo
              </v-chip>
            </div>
            <div class="d-flex align-center ga-4">
              <span 
                class="h-10 w-10 rounded-lg shadow-md" 
                :style="{ backgroundColor: activeColors.secondary }" 
              />
              <span class="font-mono text-body-2 font-weight-medium text-[var(--color-text)]">
                {{ activeColors.secondary }}
              </span>
            </div>
          </v-card>
        </v-col>

        <!-- Botón de ejemplo mejorado -->
        <v-col cols="12" md="4">
          <v-card
            class="pa-5"
            variant="outlined"
            :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }"
          >
            <span class="d-block text-body-2 font-weight-medium text-[var(--color-text-muted)] mb-3">
              Botón ejemplo
            </span>
            <v-btn
              block
              class="rounded-lg text-none font-weight-medium transition-all duration-300 shadow-md hover:shadow-lg"
              :style="{ 
                backgroundColor: activeColors.primary,
                color: '#ffffff',
                transform: 'translateY(0)'
              }"
              @mouseenter="$event.target.style.backgroundColor = activeColors.secondary"
              @mouseleave="$event.target.style.backgroundColor = activeColors.primary"
            >
              EXAMPLE-TEXT
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </section>
</template>

<script setup>
import { useAppearance } from '../../composables/useAppearance'

const {
  palettes,
  paletteId,
  useCustom,
  customPrimary,
  customSecondary,
  activeColors,
  selectPalette,
  enableCustomColors
} = useAppearance()
</script>

<style scoped>
/* Mantenemos las animaciones y estilos personalizados */
:deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-color: var(--color-border);
}

:deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: var(--color-primary);
}

/* Clases de utilidad personalizadas que mantienen las variables */
.h-8 { height: 2rem; }
.w-12 { width: 3rem; }
.h-10 { height: 2.5rem; }
.w-10 { width: 2.5rem; }
.w-16 { width: 4rem; }

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Mantener estilos de hover para el botón */
.v-btn:hover {
  transform: translateY(-2px) !important;
}
</style>
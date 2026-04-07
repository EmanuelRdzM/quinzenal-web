<template>
  <section class="max-w-6xl mx-auto">
    <v-card class="pa-6 pa-lg-8 mb-6" variant="outlined" :style="surfaceStyle">
      <h1 class="text-h5 text-lg-h4 font-weight-semibold">Configuración</h1>
      <p class="mt-2 text-body-2 text-[var(--color-text-muted)]">
        Esta sección crecerá con nuevas opciones. Por ahora incluye apariencia y gestión de categorías.
      </p>
    </v-card>

    <v-expansion-panels v-model="openPanels" multiple variant="accordion">
      <v-expansion-panel value="appearance" rounded="lg" elevation="0">
        <v-expansion-panel-title>
          <div>
            <div class="text-subtitle-1 font-weight-semibold">Apariencia</div>
            <div class="text-caption text-[var(--color-text-muted)]">Colores y tema visual</div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" lg="8">
              <v-card class="pa-5" variant="outlined" :style="surfaceStyle">
                <h2 class="text-h6 font-weight-semibold">Paletas predefinidas</h2>
                <p class="text-caption text-[var(--color-text-muted)] mb-4">Elige una base rápida.</p>

                <v-row>
                  <v-col v-for="palette in palettes" :key="palette.id" cols="12" sm="6">
                    <v-card
                      class="rounded-lg cursor-pointer"
                      :class="paletteId === palette.id && !useCustom ? 'ring-2 ring-[var(--color-primary)]' : ''"
                      variant="outlined"
                      :style="{ borderColor: 'var(--color-border)' }"
                      @click="selectPalette(palette.id)"
                    >
                      <v-card-text>
                        <div class="font-weight-medium mb-3">{{ palette.name }}</div>
                        <div class="d-flex ga-2 align-center">
                          <span class="color-chip" :style="{ backgroundColor: palette.primary }" />
                          <span class="color-chip" :style="{ backgroundColor: palette.secondary }" />
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card class="pa-5" variant="outlined" :style="surfaceStyle">
                <h2 class="text-h6 font-weight-semibold">Personalizado</h2>
                <p class="text-caption text-[var(--color-text-muted)] mb-4">Define tus propios colores.</p>

                <v-switch
                  v-model="useCustom"
                  color="primary"
                  label="Usar colores personalizados"
                  hide-details
                  class="mb-4"
                  @update:model-value="(val) => val && enableCustomColors()"
                />

                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium d-block mb-2">Primario</label>
                  <div class="d-flex ga-2 align-center">
                    <input type="color" class="color-input" v-model="customPrimary" @input="enableCustomColors" />
                    <v-text-field v-model="customPrimary" density="comfortable" hide-details variant="outlined" @focus="enableCustomColors" />
                  </div>
                </div>

                <div>
                  <label class="text-body-2 font-weight-medium d-block mb-2">Secundario</label>
                  <div class="d-flex ga-2 align-center">
                    <input type="color" class="color-input" v-model="customSecondary" @input="enableCustomColors" />
                    <v-text-field v-model="customSecondary" density="comfortable" hide-details variant="outlined" @focus="enableCustomColors" />
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="categories" rounded="lg" elevation="0">
        <v-expansion-panel-title>
          <div>
            <div class="text-subtitle-1 font-weight-semibold">Categorías de transacciones</div>
            <div class="text-caption text-[var(--color-text-muted)]">Crear, editar, activar, desactivar o eliminar</div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            Si desactivas una categoría, deja de aparecer para nuevos movimientos.
            Los movimientos existentes se mantienen como histórico con su categoría.
          </v-alert>

          <v-row class="mb-3">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newCategoryName"
                label="Nueva categoría"
                placeholder="Ej: Mascotas"
                variant="outlined"
                density="comfortable"
                hide-details
                @keyup.enter="createCategory"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-btn color="primary" block prepend-icon="mdi-plus" :loading="savingCategory" @click="createCategory">
                Agregar
              </v-btn>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn variant="outlined" block prepend-icon="mdi-refresh" :loading="loadingCategories" @click="loadCategories">
                Recargar
              </v-btn>
            </v-col>
          </v-row>

          <v-alert v-if="categoryMessage" :type="categoryMessageType" variant="tonal" class="mb-3" closable @click:close="categoryMessage = ''">
            {{ categoryMessage }}
          </v-alert>

          <v-data-table
            :headers="categoryHeaders"
            :items="categories"
            :loading="loadingCategories"
            :items-per-page="10"
            density="comfortable"
          >
            <template #item.name="{ item }">
              <v-text-field
                v-if="editingCategoryId === item.id"
                v-model="editingCategoryName"
                density="compact"
                hide-details
                variant="outlined"
              />
              <span v-else>{{ item.name }}</span>
            </template>

            <template #item.slug="{ item }">
              <span class="text-caption text-[var(--color-text-muted)]">{{ item.slug }}</span>
            </template>

            <template #item.isActive="{ item }">
              <v-chip :color="item.isActive ? 'success' : 'warning'" size="small" variant="tonal">
                {{ item.isActive ? 'Activa' : 'Inactiva' }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex ga-1 justify-end">
                <template v-if="editingCategoryId === item.id">
                  <v-btn size="small" color="primary" variant="text" @click="saveEditCategory(item)">
                    Guardar
                  </v-btn>
                  <v-btn size="small" variant="text" @click="cancelEditCategory">
                    Cancelar
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn size="small" variant="text" @click="startEditCategory(item)">
                    Editar
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    :color="item.isActive ? 'warning' : 'success'"
                    @click="toggleCategory(item)"
                  >
                    {{ item.isActive ? 'Desactivar' : 'Activar' }}
                  </v-btn>
                  <v-btn size="small" variant="text" color="error" @click="deleteCategory(item)">
                    Eliminar
                  </v-btn>
                </template>
              </div>
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import { useAppearance } from '../../composables/useAppearance'

const {
  palettes,
  paletteId,
  useCustom,
  customPrimary,
  customSecondary,
  selectPalette,
  enableCustomColors
} = useAppearance()

const openPanels = ref(['categories'])

const categories = ref([])
const loadingCategories = ref(false)
const savingCategory = ref(false)
const newCategoryName = ref('')

const editingCategoryId = ref(null)
const editingCategoryName = ref('')

const categoryMessage = ref('')
const categoryMessageType = ref('success')

const surfaceStyle = {
  borderColor: 'var(--color-border)',
  backgroundColor: 'var(--color-surface)'
}

const categoryHeaders = [
  { title: 'Nombre', key: 'name' },
  { title: 'Slug', key: 'slug' },
  { title: 'Estado', key: 'isActive' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
]

function setMessage(message, type = 'success') {
  categoryMessage.value = message
  categoryMessageType.value = type
}

async function loadCategories() {
  loadingCategories.value = true
  try {
    const res = await api.get('/v1/transaction-categories', { params: { activeOnly: false } })
    categories.value = res.data || []
  } catch (error) {
    setMessage(error?.response?.data?.error || 'No se pudieron cargar categorías.', 'error')
  } finally {
    loadingCategories.value = false
  }
}

async function createCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return

  savingCategory.value = true
  try {
    await api.post('/v1/transaction-categories', { name })
    newCategoryName.value = ''
    setMessage('Categoría creada correctamente.')
    await loadCategories()
  } catch (error) {
    setMessage(error?.response?.data?.error || 'No se pudo crear la categoría.', 'error')
  } finally {
    savingCategory.value = false
  }
}

function startEditCategory(item) {
  editingCategoryId.value = item.id
  editingCategoryName.value = item.name
}

function cancelEditCategory() {
  editingCategoryId.value = null
  editingCategoryName.value = ''
}

async function saveEditCategory(item) {
  const name = editingCategoryName.value.trim()
  if (!name) return

  try {
    await api.patch(`/v1/transaction-categories/${item.id}`, { name })
    setMessage('Categoría actualizada correctamente.')
    cancelEditCategory()
    await loadCategories()
  } catch (error) {
    setMessage(error?.response?.data?.error || 'No se pudo actualizar la categoría.', 'error')
  }
}

async function toggleCategory(item) {
  try {
    await api.patch(`/v1/transaction-categories/${item.id}`, {
      isActive: !item.isActive
    })
    setMessage(item.isActive ? 'Categoría desactivada.' : 'Categoría activada.')
    await loadCategories()
  } catch (error) {
    setMessage(error?.response?.data?.error || 'No se pudo actualizar el estado de la categoría.', 'error')
  }
}

async function deleteCategory(item) {
  const ok = window.confirm(`¿Eliminar la categoría "${item.name}"?`)
  if (!ok) return

  try {
    await api.delete(`/v1/transaction-categories/${item.id}`)
    setMessage('Categoría eliminada correctamente.')
    await loadCategories()
  } catch (error) {
    setMessage(error?.response?.data?.error || 'No se pudo eliminar la categoría.', 'error')
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.color-chip {
  display: inline-block;
  width: 42px;
  height: 28px;
  border-radius: 8px;
}

.color-input {
  width: 56px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: transparent;
  padding: 2px;
  cursor: pointer;
}
</style>

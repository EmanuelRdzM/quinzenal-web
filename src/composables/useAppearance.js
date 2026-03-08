import { computed, ref, watch } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

const STORAGE_KEYS = {
  paletteId: 'appearance.paletteId',
  useCustom: 'appearance.useCustom',
  customPrimary: 'appearance.customPrimary',
  customSecondary: 'appearance.customSecondary'
}

const PALETTES = [
  { id: 'indigo-cyan', name: 'Indigo Ocean', primary: '#6366f1', secondary: '#06b6d4' },
  { id: 'emerald-lime', name: 'Emerald Lime', primary: '#10b981', secondary: '#84cc16' },
  { id: 'rose-amber', name: 'Rose Amber', primary: '#e11d48', secondary: '#f59e0b' },
  { id: 'blue-steel', name: 'Blue Steel', primary: '#2563eb', secondary: '#14b8a6' }
]

const paletteId = ref(localStorage.getItem(STORAGE_KEYS.paletteId) || PALETTES[0].id)
const useCustom = ref(localStorage.getItem(STORAGE_KEYS.useCustom) === 'true')
const customPrimary = ref(localStorage.getItem(STORAGE_KEYS.customPrimary) || '#7c3aed')
const customSecondary = ref(localStorage.getItem(STORAGE_KEYS.customSecondary) || '#0ea5e9')
let initialized = false

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHex(hex) {
  if (!hex) return '#000000'
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex
  return '#000000'
}

function shiftHexColor(hex, amount) {
  const safeHex = normalizeHex(hex).slice(1)
  const num = parseInt(safeHex, 16)

  const r = clamp((num >> 16) + amount, 0, 255)
  const g = clamp(((num >> 8) & 0x00ff) + amount, 0, 255)
  const b = clamp((num & 0x0000ff) + amount, 0, 255)

  const shifted = (r << 16) | (g << 8) | b
  return `#${shifted.toString(16).padStart(6, '0')}`
}

function hexToRgb(hex) {
  const safeHex = normalizeHex(hex).slice(1)
  const num = parseInt(safeHex, 16)

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

function applyPaletteVariables(primary, secondary) {
  const rootStyle = document.documentElement.style
  const safePrimary = normalizeHex(primary)
  const safeSecondary = normalizeHex(secondary)
  const primaryRgb = hexToRgb(safePrimary)

  rootStyle.setProperty('--color-primary', safePrimary)
  rootStyle.setProperty('--color-primary-hover', shiftHexColor(safePrimary, -20))
  rootStyle.setProperty('--color-primary-active', shiftHexColor(safePrimary, -36))

  rootStyle.setProperty('--color-secondary', safeSecondary)
  rootStyle.setProperty('--color-secondary-hover', shiftHexColor(safeSecondary, -16))

  rootStyle.setProperty('--gradient-primary', `linear-gradient(135deg, ${safePrimary}, ${safeSecondary})`)
  rootStyle.setProperty('--shadow-glow', `0 0 18px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.35)`)
}

function applyVuetifyPalette(vuetifyTheme, primary, secondary) {
  const safePrimary = normalizeHex(primary)
  const safeSecondary = normalizeHex(secondary)
  const themeRegistry = vuetifyTheme.themes.value

  ;['light', 'dark'].forEach((themeName) => {
    if (!themeRegistry[themeName] || !themeRegistry[themeName].colors) return

    themeRegistry[themeName].colors.primary = safePrimary
    themeRegistry[themeName].colors.secondary = safeSecondary
    themeRegistry[themeName].colors.accent = safeSecondary
  })
}

function applyAppearance(vuetifyTheme) {
  const selected = PALETTES.find((palette) => palette.id === paletteId.value) || PALETTES[0]
  const activePrimary = useCustom.value ? customPrimary.value : selected.primary
  const activeSecondary = useCustom.value ? customSecondary.value : selected.secondary

  applyPaletteVariables(activePrimary, activeSecondary)
  applyVuetifyPalette(vuetifyTheme, activePrimary, activeSecondary)

  localStorage.setItem(STORAGE_KEYS.paletteId, paletteId.value)
  localStorage.setItem(STORAGE_KEYS.useCustom, String(useCustom.value))
  localStorage.setItem(STORAGE_KEYS.customPrimary, customPrimary.value)
  localStorage.setItem(STORAGE_KEYS.customSecondary, customSecondary.value)
}

const activeColors = computed(() => {
  const selected = PALETTES.find((palette) => palette.id === paletteId.value) || PALETTES[0]

  return {
    primary: useCustom.value ? customPrimary.value : selected.primary,
    secondary: useCustom.value ? customSecondary.value : selected.secondary
  }
})

function selectPalette(id) {
  paletteId.value = id
  useCustom.value = false
}

function enableCustomColors() {
  useCustom.value = true
}

export function useAppearance() {
  const vuetifyTheme = useVuetifyTheme()

  if (!initialized) {
    watch([paletteId, useCustom, customPrimary, customSecondary], () => applyAppearance(vuetifyTheme), { immediate: true })
    initialized = true
  }

  return {
    palettes: PALETTES,
    paletteId,
    useCustom,
    customPrimary,
    customSecondary,
    activeColors,
    selectPalette,
    enableCustomColors
  }
}

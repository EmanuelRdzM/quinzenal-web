<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Header mejorado -->
        <div class="d-flex align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">
              <v-icon icon="mdi-credit-card" class="mr-2" size="40" />
              Créditos
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis mt-1">
              Administra tus créditos y pagos mensuales
            </p>
          </div>
          <v-spacer />
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="openDialog"
            elevation="2"
            class="rounded-lg"
          >
            Nuevo crédito
          </v-btn>
        </div>

        <CreditsTable
          :credits="credits"
          @refresh="loadCredits"
          @open="goToCredit"
          @edit="editCredit"
          @delete="deleteCreditConfirm"
        />
      </v-col>
    </v-row>

    <CreditFormDialog
      v-model="dialog"
      :credit="editingCredit"
      :loading="savingCredit"
      @save="submitCredit"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import CreditsTable from '../../components/credits/CreditsTable.vue'
import CreditFormDialog from '../../components/credits/CreditFormDialog.vue'

const router = useRouter()
const credits = ref([])
const dialog = ref(false)
const editingCredit = ref(null)
const savingCredit = ref(false)

async function loadCredits() {
  try {
    const res = await api.get('/v1/credits')
    credits.value = res.data || []
  } catch (err) {
    console.error(err)
  }
}

function openDialog() {
  editingCredit.value = null
  dialog.value = true
}

function editCredit(credit) {
  editingCredit.value = credit
  dialog.value = true
}

async function submitCredit(formData) {
  savingCredit.value = true
  try {
    if (editingCredit.value) {
      await api.put(`/v1/credits/${editingCredit.value.id}`, formData)
    } else {
      await api.post('/v1/credits', formData)
    }
    await loadCredits()
    dialog.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingCredit.value = false
  }
}

function deleteCreditConfirm(credit) {
  if (confirm(`¿Eliminar crédito "${credit.name}"?`)) {
    deleteCredit(credit.id)
  }
}

async function deleteCredit(id) {
  try {
    await api.delete(`/v1/credits/${id}`)
    await loadCredits()
  } catch (err) {
    console.error(err)
  }
}

function goToCredit(id) {
  router.push(`/credits/${id}`)
}

onMounted(loadCredits)
</script>
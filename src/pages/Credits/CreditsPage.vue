<!-- src/pages/credits/CreditPage.vue -->
<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <CreditsTable
          :credits="credits"
          @create="openDialog"
          @refresh="loadCredits"
          @open="goToCredit"
          @edit="editCredit"
          @delete="deleteCreditConfirm"
        />
      </v-col>
    </v-row>

    <!-- Dialog crear/editar crédito -->
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
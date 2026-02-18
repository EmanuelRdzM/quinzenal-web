<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Header mejorado -->
        <div class="d-flex align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">
              <v-icon icon="mdi-credit-card-multiple" class="mr-2" size="40" />
              Tarjetas
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis mt-1">
              Administra tus tarjetas y su historial de movimientos
            </p>
          </div>
          <v-spacer />
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
            elevation="2"
            class="rounded-lg"
          >
            Nueva tarjeta
          </v-btn>
        </div>

        <CardsTable
          :cards="cards"
          @refresh="loadCards"
          @open="goToCard"
          @edit="editCard"
          @delete="deleteCardConfirm"
        />
      </v-col>
    </v-row>

    <CardFormDialog
      v-model="dialogCreate"
      :card="editingCard"
      :loading="savingCard"
      @save="submitCard"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import CardsTable from '../../components/cards/CardsTable.vue'
import CardFormDialog from '../../components/cards/CardFormDialog.vue'

const router = useRouter()
const cards = ref([])
const dialogCreate = ref(false)
const editingCard = ref(null)
const savingCard = ref(false)

async function loadCards() {
  try {
    const res = await api.get('/v1/cards')
    cards.value = res.data || []
  } catch (err) {
    console.error(err)
  }
}

function openCreateDialog() {
  editingCard.value = null
  dialogCreate.value = true
}

function editCard(card) {
  editingCard.value = card
  dialogCreate.value = true
}

async function submitCard(formData) {
  savingCard.value = true
  try {
    if (editingCard.value) {
      await api.put(`/v1/cards/${editingCard.value.id}`, formData)
    } else {
      await api.post('/v1/cards', formData)
    }
    await loadCards()
    dialogCreate.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingCard.value = false
  }
}

function deleteCardConfirm(card) {
  if (confirm(`¿Eliminar tarjeta "${card.name}"?`)) {
    deleteCard(card.id)
  }
}

async function deleteCard(id) {
  try {
    await api.delete(`/v1/cards/${id}`)
    await loadCards()
  } catch (err) {
    console.error(err)
  }
}

function goToCard(id) {
  router.push(`/cards/${id}`)
}

onMounted(loadCards)
</script>
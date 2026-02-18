<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">
              <v-icon icon="mdi-account-group" class="mr-2" size="40" />
              Contactos
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis mt-1">
              Gestiona personas y sus préstamos o rentas
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
            Nueva persona
          </v-btn>
        </div>

        <PeopleTable
          :people="people"
          @refresh="loadPeople"
          @open="goToPerson"
          @edit="editPerson"
          @delete="deletePersonConfirm"
        />
      </v-col>
    </v-row>

    <PersonFormDialog
      v-model="dialog"
      :person="editingPerson"
      :loading="savingPerson"
      @save="submitPerson"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import PeopleTable from '../../components/debts/PeopleTable.vue'
import PersonFormDialog from '../../components/debts/PersonFormDialog.vue'

const router = useRouter()
const people = ref([])
const dialog = ref(false)
const editingPerson = ref(null)
const savingPerson = ref(false)

async function loadPeople() {
  try {
    const res = await api.get('/v1/people')
    people.value = res.data || []
  } catch (err) {
    console.error(err)
  }
}

function openDialog() {
  editingPerson.value = null
  dialog.value = true
}

function editPerson(person) {
  editingPerson.value = person
  dialog.value = true
}

async function submitPerson(formData) {
  savingPerson.value = true
  try {
    if (editingPerson.value) {
      await api.put(`/v1/people/${editingPerson.value.id}`, formData)
    } else {
      await api.post('/v1/people', formData)
    }
    await loadPeople()
    dialog.value = false
  } catch (err) {
    console.error(err)
  } finally {
    savingPerson.value = false
  }
}

function deletePersonConfirm(person) {
  if (confirm(`¿Eliminar persona "${person.name}"?`)) {
    deletePerson(person.id)
  }
}

async function deletePerson(id) {
  try {
    await api.delete(`/v1/people/${id}`)
    await loadPeople()
  } catch (err) {
    console.error(err)
  }
}

function goToPerson(id) {
  router.push(`/people/${id}`)
}

onMounted(loadPeople)
</script>
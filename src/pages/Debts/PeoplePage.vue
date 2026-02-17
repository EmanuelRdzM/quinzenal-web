<!-- src/pages/debts/PeoplePage.vue -->
<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <PeopleTable
          :people="people"
          @create="openDialog"
          @refresh="loadPeople"
          @open="goToPerson"
          @edit="editPerson"
          @delete="deletePersonConfirm"
        />
      </v-col>
    </v-row>

    <!-- Dialog crear/editar persona -->
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
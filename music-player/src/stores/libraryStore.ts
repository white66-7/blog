import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLibraryStore = defineStore('library', () => {
    const library = ref([])
    const dirs = ref([])
    const curDir = ref('all')
    const kw = ref('')
    const filteredList = computed(() => {

  })


   return { library, dirs, curDir, kw, filteredList}
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { loadSongs, saveSong, updateSongDir, loadDirs, saveDirs, delSong } from '@/utils/db'
import { parseName } from '@/utils/format'

export interface Song {
  id: string
  signature: string
  name: string
  artist: string
  originalFileName: string
  directoryId: string
  file: File
}
export interface Dir {
  id: string
  name: string
}
interface FilteredSong extends Song {
  _globalIdx: number
  _dirName?: string
}
export const useLibraryStore = defineStore('library', () => {
  const library = ref<Song[]>([])
  const dirs = ref<Dir[]>([{ id: 'default', name: '未分类' }])
  const curDir = ref<string>('all')
  const kw = ref<string>('')
  const filteredList = computed<FilteredSong[]>(() => {
    var list: FilteredSong[] = library.value.map((song, idx) => ({
      ...song,
      _globalIdx: idx,
      _dirName: ''
    }))

    if (curDir.value !== 'all') {
      list = list.filter(s => s.directoryId === curDir.value)
    }

    if (kw.value.trim()) {
      const w = kw.value.trim().toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(w) ||
        s.artist.toLowerCase().includes(w)
      )
    }

    if (curDir.value === 'all') {
      list.forEach(s => {
        const d = dirs.value.find(dir => dir.id === s.directoryId)
        s._dirName = d ? d.name : '未分类'
      })
    }

    return list
  })


  return { library, dirs, curDir, kw, filteredList }
})

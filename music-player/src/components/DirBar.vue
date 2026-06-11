<script setup lang="ts">
import { useLibraryStore } from '@/stores/libraryStore';
const libraryStore = useLibraryStore()

function switchDir(dirId: string) {
  libraryStore.curDir = dirId
  libraryStore.kw = ''
}

async function onDeleteDir(dirId: string) {
  if(dirId === 'default') return
  await libraryStore.removeDir(dirId)
}

function onAddDir()
{
  const name = prompt('新神经连接名称')
  if(!name || !name.trim()) return
  if(!libraryStore.dirs.some(d => d.name === name.trim()))
{
  alert('该神经连接已存在')
  return
}
libraryStore.addDir(name.trim())
}
</script>

<template>
  <div class="dir-bar">
    <div class="dir-chip" :class="{ on: libraryStore.curDir === 'all' }" @click="switchDir('all')">
      <img src="@/assets/file.png" alt="" class="file-logo" />全部
      <span style="opacity: 0.7;">{{ libraryStore.library.length }}</span>
    </div>
    <div v-for="d in libraryStore.dirs" :key="d.id" class="dir-chip" :class="{ on: libraryStore.curDir === d.id }"
      @click="switchDir(d.id)">
    <img src="@/assets/file.png" alt="" class="file-logo" />
  {{ d.name }} <span style="opacity: 0.7">{{ libraryStore.countDir(d.id) }}</span>
  <span v-if = "d.id != 'default'"
  class="del"
  @click.stop="onDeleteDir(d.id)">
  >✖</span>
  </div>
  <button class="add-dir" @click = "onAddDir"></button>
  </div>
</template>

<style>
.dir-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dir-chip {
  padding: 4px 10px;
  border: 1px solid rgba(0, 243, 255, .12);
  border-radius: 12px;
  font-size: .72rem;
  color: var(--text-dim);
  cursor: pointer;
  transition: .2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dir-chip:hover,
.dir-chip.on {
  background: rgba(0, 243, 255, .08);
  color: var(--neon-cyan);
  border-color: rgba(0, 243, 255, .35);
  box-shadow: 0 0 8px rgba(0, 243, 255, .1);
}

.dir-chip .del {
  opacity: 0;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-dim);
}

.dir-chip:hover .del {
  opacity: 1;
}

.file-logo {
  height: 25px;
  width: auto;
  display: block;
}

.dir-chip .del:hover {
  background: rgba(255, 0, 255, .15);
  color: var(--neon-pink);
}
</style>
<script setup lang="ts">
import { useLibraryStore } from '@/modules/player/stores/libraryStore'
import { useAudioStore } from '@/modules/player/stores/audioStore'
import { useRouter } from 'vue-router'
import { fmt } from '@/modules/player/utils/format'

const libraryStore = useLibraryStore()
const audioStore = useAudioStore()
const router = useRouter()

function goBack() {
  router.push('/player/playlists')
}

function playSong(globalIdx: number) {
  audioStore.playByIndex(globalIdx)
}

async function removeSong(id: string) {
  if (!confirm('确定要删除这条神经信号吗？')) return
  const removedIdx = await libraryStore.removeSong(id)
  if (removedIdx !== -1 && removedIdx === audioStore.curIdx) {
    audioStore.stopAndReset()
  } else if (removedIdx !== -1 && removedIdx < audioStore.curIdx) {
    audioStore.curIdx--
  }
}
</script>

<template>
  <div class="songs-view">
    <div class="sv-header">
      <button class="sv-back" @click="goBack">← 歌单</button>
      <span class="sv-title">{{ libraryStore.curDir === 'all' ? '全部歌曲' : libraryStore.dirs.find(d => d.id === libraryStore.curDir)?.name ?? '歌曲' }}</span>
      <span class="sv-count">{{ libraryStore.filteredList.length }} 首曲目</span>
    </div>

    <div class="sv-list">
      <div v-if="!libraryStore.filteredList.length" class="sv-empty">该歌单下无神经信号</div>
      <div
        v-for="(s, idx) in libraryStore.filteredList"
        :key="s.id"
        class="sv-row"
        :class="{ on: s._globalIdx === audioStore.curIdx }"
        @click="playSong(s._globalIdx)"
      >
        <div class="sv-num">{{ idx + 1 }}</div>
        <div class="sv-info">
          <div class="sv-name">{{ s.name }}</div>
          <div class="sv-artist">{{ s.artist }}</div>
        </div>
        <div class="sv-acts">
          <button class="sv-rm" @click.stop="removeSong(s.id)">🗑</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.songs-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sv-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px 10px;
  border-bottom: 1px solid rgba(0, 243, 255, .1);
  margin-bottom: 6px;
}

.sv-back {
  background: none;
  border: none;
  color: var(--neon-cyan);
  font-family: inherit;
  font-size: .78rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: .15s;
}

.sv-back:hover {
  background: rgba(0, 243, 255, .08);
}

.sv-title {
  flex: 1;
  font-size: .82rem;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sv-count {
  font-size: .68rem;
  color: var(--text-dim);
  white-space: nowrap;
}

.sv-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-right: 2px;
}

.sv-empty {
  text-align: center;
  padding: 30px;
  color: var(--text-dim);
  font-size: .85rem;
}

.sv-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: .15s;
}

.sv-row:hover {
  background: rgba(0, 243, 255, .04);
  border-color: rgba(0, 243, 255, .08);
}

.sv-row.on {
  background: rgba(0, 243, 255, .06);
  border-left: 2px solid var(--neon-cyan);
}

.sv-row.on .sv-num { color: var(--neon-cyan); text-shadow: 0 0 6px rgba(0, 243, 255, .4); }
.sv-row.on .sv-name { color: var(--neon-cyan); }

.sv-num {
  width: 22px;
  font-size: .72rem;
  color: var(--text-dim);
  text-align: right;
}

.sv-info {
  flex: 1;
  min-width: 0;
}

.sv-name {
  font-size: .82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-main);
}

.sv-artist {
  font-size: .68rem;
  color: var(--text-dim);
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sv-acts {
  display: none;
  gap: 6px;
  margin-left: 6px;
}

.sv-row:hover .sv-acts { display: flex; }

.sv-rm {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: .85rem;
  padding: 2px;
  transition: .15s;
}

.sv-rm:hover { color: var(--neon-pink); }
</style>
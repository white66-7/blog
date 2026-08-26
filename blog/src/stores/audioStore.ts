import {ref,computed,watch} from 'vue'
import {defineStore} from 'pinia'
import type {Song} from './libraryStore'
import { extractCover} from '@/modules/player/utils/cover'
import { decodeLrc } from '@/modules/player/utils/lrc'
import { useLibraryStore } from './libraryStore'


export interface AudioState{
    curIdx: number
    mode: 'list'|'random'|'loop'
    volume:number
    currentTime: number
    duration: number
    paused: boolean
    currentCoverUrl: string|null
    currentAudioUrl: string|null
}


export const useAudioStore = defineStore('audio',() =>
{
    const libraryStore = useLibraryStore()

const audioElement = ref<HTMLAudioElement | null>(null)

//变量
const curIdx = ref(-1)
const mode = ref<'list' |'random' | 'loop'>('list')
const volume = ref(0.7)
const currentTime = ref(0)
const duration = ref(0)
const paused = ref(true)
const currentCoverUrl = ref<string | null>(null)
const currentAudioUrl = ref<string|null>(null)

const isShuffle = computed(() =>
{
    return mode.value === 'random'
})
const isLoop = computed(() => 
{
    return mode.value === 'loop'
})
const progressPercent = computed<number>(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
})
const currentSong = computed<Song | null>(() => {
    const song = libraryStore.library[curIdx.value]
    if (curIdx.value >= 0 && curIdx.value < libraryStore.library.length && song) {
        return song
    }
    return null
})


function bindAudioEvent(): void {
  const el = audioElement.value
  if (!el) return

  // ✅ 新增：元数据加载完成时立即更新 duration
  el.addEventListener('loadedmetadata', () => {
    if (audioElement.value) {
      duration.value = audioElement.value.duration || 0
      // 同步当前时间（尽管刚开始为0，但保持一致性）
      currentTime.value = audioElement.value.currentTime
    }
  })

  el.addEventListener('play', () => { paused.value = false })
  el.addEventListener('pause', () => { paused.value = true })
  el.addEventListener('timeupdate', () => {
    if (audioElement.value) {
      currentTime.value = audioElement.value.currentTime
      duration.value = audioElement.value.duration || 0
    }
  })
  el.addEventListener('ended', () => {
    if (currentSong.value) {
      libraryStore.incrementPlayCount(currentSong.value.id)
    }
    next()
  })
  el.addEventListener('volumechange', () => {
    if (audioElement.value) {
      volume.value = audioElement.value.volume
    }
  })
}


function revokeCurrentUrls():void{
if (currentAudioUrl.value && currentAudioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentAudioUrl.value)
  }
  currentAudioUrl.value = null

  if (currentCoverUrl.value && currentCoverUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentCoverUrl.value)
  }
  currentCoverUrl.value = null
}

// ── 预设歌曲歌词：从 public/audio 加载同名 .lrc，带缓存避免重复请求 ──
const presetLrcCache = new Map<string, string>()

async function loadPresetLrc(song: Song): Promise<void> {
  if (song.lrc || !song.src) return
  const base = song.src.replace(/\.(mp3|flac|wav|aac|ogg)$/i, '')
  if (presetLrcCache.has(base)) {
    song.lrc = presetLrcCache.get(base) || undefined
    return
  }
  try {
    const res = await fetch(base + '.lrc')
    if (res.ok) {
      const text = decodeLrc(await res.arrayBuffer())
      presetLrcCache.set(base, text)
      song.lrc = text
    } else {
      presetLrcCache.set(base, '')
    }
  } catch {
    presetLrcCache.set(base, '')
  }
}
//核心函数
async function loadSongByIndex(index: number): Promise<void> {
  if (index < 0 || index >= libraryStore.library.length) return
  const song = libraryStore.library[index]
  if (!song) return

  revokeCurrentUrls()

  if (song.isPreset && song.src) {
    currentAudioUrl.value = song.src
    if (audioElement.value) {
      audioElement.value.src = song.src
    }

    currentCoverUrl.value = song.cover || null

    // 预设歌词异步加载
    loadPresetLrc(song)

  } else if (song.file) {
    const audioUrl = URL.createObjectURL(song.file)
    currentAudioUrl.value = audioUrl

    if (audioElement.value) {
      audioElement.value.src = audioUrl
    }

    // 本地上传的文件，从本地 File 提取封面（本地 Blob 读取非常快）
    if (song.cover) {
      currentCoverUrl.value = song.cover
    } else {
      extractCover(song.file).then(u => {
        currentCoverUrl.value = u
        song.cover = u || undefined
      }).catch(() => {})
    }
  }

  curIdx.value = index
}

async function play(): Promise<void> {
  const el = audioElement.value
  console.log('1. 准备播放，元素存在吗？', !!el)
  if (!el) return
  
  console.log('2. 当前播放的 URL 是:', currentAudioUrl.value)
  
  try {
    await el.play()
    console.log('3. 播放成功！')
    paused.value = false
  } catch (e) {
    console.error('3. 播放抛出异常！', e)
  }
}

function pause(): void{
    audioElement.value?.pause()
    paused.value = true;
}

function togglePlay(): void{
    if(!audioElement.value) return
    if(audioElement.value.paused){
        play()
    }else{
        pause()
    }
}

async function prev(): Promise<void>{
    const filtered = libraryStore.filteredList
    if(!filtered.length) return

    var curInFilter = filtered.findIndex(s => s._globalIdx === curIdx.value)
    if(curInFilter === -1) curInFilter = 0

    var prevIndex: number
    if(isShuffle.value){
              prevIndex = Math.floor(Math.random() * filtered.length)
}else{
    prevIndex = (curInFilter - 1 + filtered.length) % filtered.length
}
    const target = filtered[prevIndex]
    if(target){
        await loadSongByIndex(target._globalIdx)
        await play()
    }
}

 async function next(): Promise<void> {
    const filtered = libraryStore.filteredList
    if (!filtered.length) return

    let curInFilter = filtered.findIndex(s => s._globalIdx === curIdx.value)
    if (curInFilter === -1) curInFilter = 0

    let nextIndex: number
    if (isShuffle.value) {
      nextIndex = Math.floor(Math.random() * filtered.length)
    } else if (isLoop.value) {
      nextIndex = curInFilter
    } else {
      nextIndex = (curInFilter + 1) % filtered.length
    }

    const target = filtered[nextIndex]
    if (target) {
      await loadSongByIndex(target._globalIdx)
      await play()
    }
  }

  async function playByIndex(index: number): Promise<void> {
    if (index < 0 || index >= libraryStore.library.length) return
    await loadSongByIndex(index)
    await play()
  }

  async function replayCurrent(): Promise<void> {
    if (curIdx.value >= 0) await playByIndex(curIdx.value)
  }

  function setVolume(vol: number): void {
    const v = Math.min(1, Math.max(0, vol))
    volume.value = v
    if (audioElement.value) audioElement.value.volume = v
  }

  function seek(percent: number): void {
    if (!audioElement.value || !duration.value) return
    const t = percent * duration.value
    audioElement.value.currentTime = t
    currentTime.value = t
  }

  function stopAndReset(): void {
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.src = ''
    }
    revokeCurrentUrls()
    curIdx.value = -1
    currentTime.value = 0
    duration.value = 0
    paused.value = true
  }

  function toggleMode(type: 'shuffle' | 'loop'): void {
    if (type === 'shuffle') {
      mode.value = mode.value === 'random' ? 'list' : 'random'
    } else if (type === 'loop') {
      mode.value = mode.value === 'loop' ? 'list' : 'loop'
    }
  }

  function setAudioElement(el: HTMLAudioElement | null): void {
    if (el && el !== audioElement.value) {
      audioElement.value = el
      bindAudioEvent()
      audioElement.value.volume = volume.value
      syncToElement()
    }
  }

  // ── 播放状态持久化：整合为单个 JSON key，含续播进度与暂停状态 ──
  const PLAYER_STATE_KEY = 'cyber_player_state'
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function parsePlayerState(): Record<string, any> {
    try {
      const raw = localStorage.getItem(PLAYER_STATE_KEY)
      if (raw) return JSON.parse(raw)
    } catch { /* 忽略损坏数据 */ }
    // 兼容旧版三个散 key：首次升级时迁移一次并清理
    const oldMode = localStorage.getItem('cyber_mode')
    const oldIdx = localStorage.getItem('cyber_idx')
    const oldVol = localStorage.getItem('cyber_vol')
    if (oldMode !== null || oldIdx !== null || oldVol !== null) {
      const migrated = {
        mode: oldMode || 'list',
        idx: oldIdx ? parseInt(oldIdx) : -1,
        volume: oldVol ? parseFloat(oldVol) : 0.7,
        currentTime: 0,
        paused: true,
      }
      try { localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(migrated)) } catch {}
      localStorage.removeItem('cyber_mode')
      localStorage.removeItem('cyber_idx')
      localStorage.removeItem('cyber_vol')
      return migrated
    }
    return { mode: 'list', idx: -1, volume: 0.7, currentTime: 0, paused: true }
  }

  function restoreFromLocalStorage(): void {
    const state = parsePlayerState()
    if (state.mode === 'random' || state.mode === 'loop') {
      mode.value = state.mode
    } else {
      mode.value = 'list'
    }

    const savedVol = parseFloat(state.volume)
    if (!isNaN(savedVol)) {
      volume.value = Math.min(1, Math.max(0, savedVol))
      if (audioElement.value) audioElement.value.volume = volume.value
    }

    const savedIdx = parseInt(state.idx)
    if (!isNaN(savedIdx) && savedIdx >= 0 && savedIdx < libraryStore.library.length) {
      curIdx.value = savedIdx
      currentTime.value = typeof state.currentTime === 'number' ? state.currentTime : 0
      paused.value = state.paused !== false
      // 预加载当前歌曲，让续播进度在音频元素就绪后自动恢复（不自动播放）
      loadSongByIndex(savedIdx).then(() => syncToElement()).catch(() => {})
    }
  }

  function saveState(): void {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify({
          mode: mode.value,
          idx: curIdx.value,
          volume: volume.value,
          currentTime: currentTime.value,
          paused: paused.value,
        }))
      } catch { /* localStorage 满等异常忽略 */ }
    }, 300)
  }

function syncToElement(): void {
  const el = audioElement.value;
  if (!el) return;

  const targetUrl = currentAudioUrl.value || '';
  // 利用原生 URL 解析对比
  const targetNorm = targetUrl ? new URL(targetUrl, window.location.href).href : '';

  // 1. 同步播放源
  if (targetUrl && el.src !== targetNorm) {
    el.src = targetUrl;
    
    // 使用 once: true 避免多次绑定内存泄漏
    el.addEventListener('loadedmetadata', () => {
      el.currentTime = currentTime.value;
      
      // 在确保 metadata 加载且时间设置完毕后，再检查是否需要播放
      if (!paused.value) {
        el.play().catch(e => {
          console.warn('自动播放失败', e);
          // 自动播放被浏览器策略拦截时，把界面状态同步为暂停，避免假播放
          paused.value = true;
        });
      }
    }, { once: true });
    
    // 换源期间直接 return，等待 loadedmetadata 处理进度和播放
    return; 
  } 

  // 2. 仅在播放源相同时，处理进度变化 (建议只在用户拖动进度条时触发此逻辑)
  if (targetUrl) {
    const diff = Math.abs(el.currentTime - currentTime.value);
    // 放宽阈值，且不要反向修改 Store，只作为“跳转”使用
    if (diff > 1.0) { 
      el.currentTime = currentTime.value;
    }
  }

  // 3. 同步音量
  if (el.volume !== volume.value) el.volume = volume.value;

  // 4. 同步播放状态 (仅处理源未改变的情况)
  if (!paused.value && el.paused && el.readyState >= 1) {
    el.play().catch(e => {
      console.warn('自动播放失败', e);
      paused.value = true;
    });
  } else if (paused.value && !el.paused) {
    el.pause();
  }
}

  watch([mode, curIdx, volume, paused, currentTime], () => { saveState() })

  return {
    curIdx, mode, volume, currentTime, duration, paused,
    currentCoverUrl, currentAudioUrl,
    isShuffle, isLoop, progressPercent, currentSong,
    setAudioElement, loadSongByIndex, play, pause, togglePlay,
    prev, next, playByIndex, replayCurrent, setVolume, seek,
    stopAndReset, toggleMode, restoreFromLocalStorage, saveState, syncToElement
  }
})
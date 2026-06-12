<template>
<div class="main-music-card" @click= "goToPlayer()">
  <input type="checkbox" id="play-toggle" hidden="" />
  <div class="track-info">
    <div class="album-art"></div>
    <div class="track-details">
      <div class="track-title">Glow</div>
      <div class="artist-name">Echo</div>
    </div>
    <div class="volume-bars">
      <div class="bar" style="--delay:0s"></div>
      <div class="bar" style="--delay:0.1s"></div>
      <div class="bar" style="--delay:0.2s"></div>
      <div class="bar" style="--delay:0.3s"></div>
      <div class="bar" style="--delay:0.4s"></div>
      <div class="bar" style="--delay:0.5s"></div>
      <div class="bar" style="--delay:0.6s"></div>
      <div class="bar" style="--delay:0.7s"></div>
    </div>
  </div>

  <div class="playback-controls">
    <div class="time-info">
      <span class="current-time"></span>
      <span class="remaining-time"></span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill"></div>
      <div class="progress-handle"></div>
    </div>
    <div class="button-row">
      <div class="main-control-btns">
        <button class="control-button back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            class="bi bi-skip-backward-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5"
            ></path>
          </svg>
        </button>
        <div class="play-pause-btns">
          <label for="play-toggle" class="control-button play-pause-button">
            <svg
              class="icon-play"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.596 8.697l-6.363 3.692c-.54.314-1.233-.065-1.233-.696V4.308c0-.63.693-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
              ></path>
            </svg>
            <svg
              class="icon-pause"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"
              ></path>
            </svg>
          </label>
        </div>
        <button class="control-button next">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            class="bi bi-skip-forward-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5"
            ></path>
          </svg>
        </button>
      </div>
      <button class="control-button d">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          class="bi bi-radar"
          viewBox="0 0 16 16"
        >
          <path
            d="M6.634 1.135A7 7 0 0 1 15 8a.5.5 0 0 1-1 0 6 6 0 1 0-6.5 5.98v-1.005A5 5 0 1 1 13 8a.5.5 0 0 1-1 0 4 4 0 1 0-4.5 3.969v-1.011A2.999 2.999 0 1 1 11 8a.5.5 0 0 1-1 0 2 2 0 1 0-2.5 1.936v-1.07a1 1 0 1 1 1 0V15.5a.5.5 0 0 1-1 0v-.518a7 7 0 0 1-.866-13.847"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</div>
</template>

<style>
.main-music-card {
  max-width: 420px;
  width: 90%;
  padding: 18px;
  border-radius: 35px;
 background: #1a1a1a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: -apple-system, system-ui, sans-serif;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.album-art {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.album-art:hover {
  transform: scale(1.05);
}

.track-details {
  flex-grow: 1;
  overflow: hidden;
}

.track-title {
  font-size: 1.3em;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.artist-name {
  font-size: 0.9em;
  color: #d1d1d6;
  margin-top: 2px;
}

.volume-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  width: 38px;
  height: 32px;
}

.volume-bars .bar {
  width: 3px;
  background: linear-gradient(180deg, #00c6ff, #0072ff);
  border-radius: 2px;
  animation: bounce 0.8s infinite ease-in-out;
  animation-delay: var(--delay);
  animation-play-state: running;
}

@keyframes bounce {
  0%,
  100% {
    height: 6px;
  }
  50% {
    height: 26px;
  }
}

.playback-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #8e8e93;
}

.current-time::before {
  content: "0:00";
  animation: timer 45s steps(45) infinite;
  display: inline-block;
  animation-play-state: running;
}
@keyframes timer {
  0% {
    content: "0:00";
  }
  2.22% {
    content: "0:01";
  }
  4.44% {
    content: "0:02";
  }
  6.67% {
    content: "0:03";
  }
  8.89% {
    content: "0:04";
  }
  11.11% {
    content: "0:05";
  }
  13.33% {
    content: "0:06";
  }
  15.56% {
    content: "0:07";
  }
  17.78% {
    content: "0:08";
  }
  20.00% {
    content: "0:09";
  }
  22.22% {
    content: "0:10";
  }
  24.44% {
    content: "0:11";
  }
  26.67% {
    content: "0:12";
  }
  28.89% {
    content: "0:13";
  }
  31.11% {
    content: "0:14";
  }
  33.33% {
    content: "0:15";
  }
  35.56% {
    content: "0:16";
  }
  37.78% {
    content: "0:17";
  }
  40.00% {
    content: "0:18";
  }
  42.22% {
    content: "0:19";
  }
  44.44% {
    content: "0:20";
  }
  46.67% {
    content: "0:21";
  }
  48.89% {
    content: "0:22";
  }
  51.11% {
    content: "0:23";
  }
  53.33% {
    content: "0:24";
  }
  55.56% {
    content: "0:25";
  }
  57.78% {
    content: "0:26";
  }
  60.00% {
    content: "0:27";
  }
  62.22% {
    content: "0:28";
  }
  64.44% {
    content: "0:29";
  }
  66.67% {
    content: "0:30";
  }
  68.89% {
    content: "0:31";
  }
  71.11% {
    content: "0:32";
  }
  73.33% {
    content: "0:33";
  }
  75.56% {
    content: "0:34";
  }
  77.78% {
    content: "0:35";
  }
  80.00% {
    content: "0:36";
  }
  82.22% {
    content: "0:37";
  }
  84.44% {
    content: "0:38";
  }
  86.67% {
    content: "0:39";
  }
  88.89% {
    content: "0:40";
  }
  91.11% {
    content: "0:41";
  }
  93.33% {
    content: "0:42";
  }
  95.56% {
    content: "0:43";
  }
  97.78% {
    content: "0:44";
  }
  100% {
    content: "0:45";
  }
}

.remaining-time::before {
  content: "0:45";
  animation: timerDown 45s steps(45) infinite;
  display: inline-block;
  animation-play-state: running;
}
@keyframes timerDown {
  0% {
    content: "0:45";
  }
  2.22% {
    content: "0:44";
  }
  4.44% {
    content: "0:43";
  }
  6.67% {
    content: "0:42";
  }
  8.89% {
    content: "0:41";
  }
  11.11% {
    content: "0:40";
  }
  13.33% {
    content: "0:39";
  }
  15.56% {
    content: "0:38";
  }
  17.78% {
    content: "0:37";
  }
  20.00% {
    content: "0:36";
  }
  22.22% {
    content: "0:35";
  }
  24.44% {
    content: "0:34";
  }
  26.67% {
    content: "0:33";
  }
  28.89% {
    content: "0:32";
  }
  31.11% {
    content: "0:31";
  }
  33.33% {
    content: "0:30";
  }
  35.56% {
    content: "0:29";
  }
  37.78% {
    content: "0:28";
  }
  40.00% {
    content: "0:27";
  }
  42.22% {
    content: "0:26";
  }
  44.44% {
    content: "0:25";
  }
  46.67% {
    content: "0:24";
  }
  48.89% {
    content: "0:23";
  }
  51.11% {
    content: "0:22";
  }
  53.33% {
    content: "0:21";
  }
  55.56% {
    content: "0:20";
  }
  57.78% {
    content: "0:19";
  }
  60.00% {
    content: "0:18";
  }
  62.22% {
    content: "0:17";
  }
  64.44% {
    content: "0:16";
  }
  66.67% {
    content: "0:15";
  }
  68.89% {
    content: "0:14";
  }
  71.11% {
    content: "0:13";
  }
  73.33% {
    content: "0:12";
  }
  75.56% {
    content: "0:11";
  }
  77.78% {
    content: "0:10";
  }
  80.00% {
    content: "0:09";
  }
  82.22% {
    content: "0:08";
  }
  84.44% {
    content: "0:07";
  }
  86.67% {
    content: "0:06";
  }
  88.89% {
    content: "0:05";
  }
  91.11% {
    content: "0:04";
  }
  93.33% {
    content: "0:03";
  }
  95.56% {
    content: "0:02";
  }
  97.78% {
    content: "0:01";
  }
  100% {
    content: "0:00";
  }
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  border-radius: 2px;
  animation: progressAnim 45s linear infinite;
  animation-play-state: running;
}

.progress-handle {
  position: absolute;
  top: 50%;
  left: 0%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  animation: handleAnim 45s linear infinite;
  animation-play-state: running;
}

.button-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.control-button {
  margin-top: 2%;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;
  color: #fff;
}

.control-button.play-pause-button:hover,
.control-button.d:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.main-control-btns {
  justify-content: center;
  align-items: center;
  display: flex;
  margin-left: 10%;
  gap: 20%;
}

.play-pause-button .icon-pause {
  display: none;
}

#play-toggle:checked ~ .track-info .volume-bars .bar {
  animation-play-state: paused;
}
#play-toggle:checked ~ .playback-controls .progress-fill,
#play-toggle:checked ~ .playback-controls .progress-handle {
  animation-play-state: paused;
}
.main-music-card:has(#play-toggle:checked) .time-info .current-time::before,
.main-music-card:has(#play-toggle:checked) .time-info .remaining-time::before {
  animation-play-state: paused;
}
#play-toggle:checked ~ .playback-controls .play-pause-button .icon-play {
  display: block;
}
#play-toggle:checked ~ .playback-controls .play-pause-button .icon-pause {
  display: none;
}

#play-toggle:not(:checked) ~ .playback-controls .play-pause-button .icon-play {
  display: none;
}
#play-toggle:not(:checked) ~ .playback-controls .play-pause-button .icon-pause {
  display: block;
}

@keyframes progressAnim {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes handleAnim {
  from {
    left: 0%;
  }
  to {
    left: 100%;
  }
}
</style>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToPlayer() {
  router.push('/player')
}
onMounted(() => {
  console.log('BlogHome component mounted')
})
</script>
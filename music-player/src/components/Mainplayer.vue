<template>
  <div></div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useAudioStore } from '@/stores/audioStore'



</script>

<style>
.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 30px;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: var(--bg-dark);
  background-image:
    linear-gradient(to bottom, rgba(7, 7, 10, 0.45), rgba(7, 7, 10, 0.75)),
    url('@/assets/2.gif');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: inset 0 0 150px rgba(7, 7, 10, 0.9);
}

.sys-line {
  position: absolute;
  top: 15px;
  right: 10px;
  color: var(--text-dim);
  letter-spacing: 1.5px;
  opacity: .8;
}

.disc-box {
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 36px;
}

.disc {
  height: 100%;
  width: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 243, 255, .35);
  box-shadow: 0 0 40px rgba(0, 243, 255, .15), inset 0 0 40px rgba(0, 0, 0, .6);
  animation: spin 24s linear infinite;
}

.disc.spin {
  animation-play-state: running;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.disc-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 1px solid rgba(0, 243, 255, .08);
  box-shadow: 0 0 60px rgba(0, 243, 255, .06);
  pointer-events: none;
}

.info {
  text-align: center;
  margin-bottom: 28px;
}

.info .h {
  font-size: 1.35rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-main);
}

.info .sub {
  font-size: .8rem;
  color: var(--text-dim);
  margin-top: 6px;
  letter-spacing: 1.5px;
}

.info .sub i {
  color: var(--neon-pink);
  font-style: normal;
  margin: 0 8px;
}

.prog {
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.prog .tm {
  font-size: .7rem;
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.bar-wrap {
  flex: 1;
  background: rgba(255, 255, 255, .06);
  height: 4px;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.bar-fill {
  height: 100%;
  width: 0%;
  border-radius: 2px;
  position: relative;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-pink));
  box-shadow: 0 0 8px rgba(0, 243, 255, .35);
}

.bar-fill::after {
  content: '';
  position: absolute;
  right: -5px;
  top: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--neon-cyan);
  box-shadow: 0 0 10px var(--neon-cyan);
  opacity: 0;
  transition: .2s;
}

.bar-wrap:hover .bar-fill::after {
  opacity: 1;
}

.ctrls {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 18px;
}

.cbtn {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1.3rem;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: .2s;
  font-family: inherit;
}

.vol {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 260px;
}

.vol span {
  font-size: .75rem;
  color: var(--text-dim);
}

.vbar {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, .06);
  cursor: pointer;
  border-radius: 2px;
}

.vfill {
  height: 100%;
  width: 70%;
  background-color: var(--neon-cyan);
  border-radius: 2px;
}
</style>
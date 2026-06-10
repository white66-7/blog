<template>
    <div class="Sidebar">
        <div class="top-bar">
            <div class="brand">
                <img src="@/assets/图标3.png" alt="logo" class="brand-logo">
                <span class="glitch-text" data-text="音乐都市">音乐都市</span>
            </div>
            <div class="badge">在线</div>
        </div>
        <NowPlayingCard />
        <SearchBar />
        <DirBar />
        <ImportArea />
        <div class="list-head">
            <span>◉ 播放列表</span>
            <span>{{ libraryStore.filteredList.length }} 首歌曲</span>
        </div>
    </div>
</template>

<style>
.Sidebar {
    width: 420px;
    min-width: 340px;
    background-color: var(--bg-panel);
    border-right: 1px solid var(--panel-border);
    display: flex;
    flex-direction: column;
    padding: 22px;
    gap: 14px;
}
.top-bar{
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 243, 255, 0.15);
    padding: 8px;
    margin-bottom: 2px;
}
.brand{
    font-size: 1.1rem;
    color: var(--neon-cyan);
    text-shadow: 0 0 8px rgba(0, 243, 255, 0.45);
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
    letter-spacing: 2px;
}
.brand-logo{
    width: auto;
    height: 2.1em;
    margin-right: 8px;
}
.glitch-text {
    position: relative;
    display: inline-block;
}
.glitch-text::before,
.glitch-text::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    color: transparent;
}
.brand:hover .glitch-text::before{
    animation: glitch-1 .3s infinite linear alternate-reverse;
    color: var(--neon-cyan);
    clip-path: polygon(0 0,100% 0,100% 35%,0 35%);
}
@keyframes glitch-1 {
    0% { transform: translateX(0); }
    100% { transform: translateX(-2px); }
}
.brand:hover .glitch-text::after{
    animation: glitch-2 .3s infinite linear alternate-reverse;
    color: var(--neon-pink);
    clip-path: polygon(0 0,100% 65%,100% 100%,0 100%);
}
@keyframes glitch-2 {
    0% { transform: translateX(0); }
    100% { transform: translateX(2px); }
}
.badge{
    font-size: .65rem;
    color: var(--neon-pink);
    text-shadow: 0 0 4px rgba(255, 0, 255,0.4);
    letter-spacing: 1px;
    animation:blink 2s ease-in-out infinite;
}
@keyframes blink{

    0%,100%{
        opacity: 1;
    }
    50%{
        opacity: 0.5;
    }
}
</style>

<script setup lang="ts">
import NowPlayingCard from "@/components/NowPlayingCard.vue";
import SearchBar from "@/components/SearchBar.vue";
import DirBar from "@/components/DirBar.vue";
import ImportArea from "@/components/ImportArea.vue";
import {useLibraryStore} from "@/stores/libraryStore";
const libraryStore = useLibraryStore();
</script>
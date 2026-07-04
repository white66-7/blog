// 预设歌曲的数据类型接口
export interface PresetSong {
  id: string;
  name: string;
  artist: string;
  src: string;
  isPreset: boolean;
}

// 预设歌曲列表
export const songs: PresetSong[] = [
    {
    id: 'preset_1',
    name: 'Stay Alive',
    artist: '纯音乐', 
    src: '/audio/Stay Alive.mp3', 
    isPreset: true
  },
    {
    id: 'preset_2',
    name: 'Ahead of Us',
    artist: '小瀬村晶', 
    src: '/audio/Ahead of Us.mp3', 
    isPreset: true
  },
];
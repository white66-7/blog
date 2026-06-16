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
    name: '天龙八部之宿敌',
    artist: '九三', // 或者 九三
    src: '/audio/天龙八部之宿敌.mp3', // 请确保你的 public/audio 目录下有这个文件
    isPreset: true
  },
  // 如果你还有其他预设歌曲，可以继续在这里添加
  // {
  //   id: 'preset_2',
  //   name: '素颜',
  //   artist: '许嵩 / 何曼婷',
  //   src: '/audio/素颜.mp3',
  //   isPreset: true
  // }
];
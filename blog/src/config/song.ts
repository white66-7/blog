// 预设歌曲的数据类型接口
export interface PresetSong {
  id: string;
  name: string;
  artist: string;
  src: string;
  isPreset: boolean;
}

// 预设歌曲列表Young Roddo -
export const songs: PresetSong[] = [
    {
    id: 'preset_1',
    name: 'No Bad Grades',
    artist: 'Young Roddo', 
    src: '/audio/No Bad Grades.mp3', 
    isPreset: true
  },
        {
    id: 'preset_2',
    name: 'coffee',
    artist: 'Corn Wave', 
    src: '/audio/Corn Wave - coffee.mp3', 
    isPreset: true
  },
  {
    id: 'preset_3',
    name: 'Stay Alive',
    artist: '纯音乐', 
    src: '/audio/Stay Alive.mp3', 
    isPreset: true
  },
    {
    id: 'preset_4',
    name: 'Ahead of Us',
    artist: '小瀬村晶', 
    src: '/audio/Ahead of Us.mp3', 
    isPreset: true
  },
      {
    id: 'preset_5',
    name: '深海',
    artist: '刘森', 
    src: '/audio/刘森 - 深海.mp3', 
    isPreset: true
  },

];
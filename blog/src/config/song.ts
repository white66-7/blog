// 1. 预设歌曲的数据类型接口
export interface PresetSong {
  id: string;
  name: string;
  artist: string;
  src: string;
  cover?: string; // 👈 新增：独立封面图片路径
  isPreset: boolean;
  describe?: string; 
}

// 2. 预设歌曲列表
export const songs: PresetSong[] = [
    {
    id: 'preset_1',
    name: '好きだから',
    artist: '『ユイカ』', 
    src: '/audio/『ユイカ』.mp3', 
    cover: '/song_covers/yuika.webp',
    isPreset: true,
    describe: '为了这首歌专门加了歌词功能'
  },
  {
    id: 'preset_2',
    name: 'No Bad Grades',
    artist: 'Young Roddo', 
    src: '/audio/No Bad Grades.mp3', 
    cover: '/song_covers/no_bad_grades.webp', 
    isPreset: true,
    describe: '无忧无虑,不用证明自己'
  },
  {
    id: 'preset_3',
    name: 'そばにいるね',
    artist: '青山テルマ', 
    src: '/audio/そばにいるね.mp3', 
    cover: '/song_covers/そばにいるね.webp', 
    isPreset: true,
    describe: '编曲真好听'
  },
  {
    id: 'preset_4',
    name: '我走以后',
    artist: '水仙LONE', 
    src: '/audio/我走以后.mp3', 
    cover: '/song_covers/我走以后.webp',
    isPreset: true,
    describe: '何谓"宿命"'
  },
    {
    id: 'preset_5',
    name: 'Love Me',
    artist: 'JMSN', 
    src: '/audio/Love Me.mp3', 
    cover: '/song_covers/Love Me.webp',
    isPreset: true,
    describe: '审判之爱'
  },
  {
    id: 'preset_6',
    name: 'Ahead of Us',
    artist: '小瀬村晶', 
    src: '/audio/Ahead of Us.mp3', 
    cover: '/song_covers/ahead_of_us.webp',
    isPreset: true,
    describe: '听起来像是朋友在分别前的最后一次话别,盛大又无奈'
  },
  {
    id: 'preset_7',
    name: 'regret',
    artist: 'chypy', 
    src: '/audio/chypy - regret (我在未来等你).mp3', 
    cover: '/song_covers/regret.webp',
    isPreset: true,
    describe: '未来,尽在掌握'
  },
  {
    id: 'preset_8',
    name: '自言自语',
    artist: '一路向北', 
    src: '/audio/自言自语.mp3', 
    cover: '/song_covers/ziyanziyu.webp',
    isPreset: true,
    describe: '这个不必理会'
  }
];

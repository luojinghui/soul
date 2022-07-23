import { atom } from 'recoil';

export const ChineseMusicPlayList = atom({
  key: 'ChineseMusicPlayList',
  default: [],
});

export const EnglistMusicPlayList = atom({
  key: 'EnglistMusicPlayList',
  default: [],
});

export const KoreanMusicPlayList = atom({
  key: 'KoreanMusicPlayList',
  default: [],
});

export const MusicInfo = atom({
  key: 'musicInfo',
  default: {
    album: '',
    content: '',
    cover: '',
    createTime: '',
    id: '',
    name: '',
    sing: '',
    song: '',
    url: '',
  },
});

export const MusicBarVisible = atom({
  key: 'MusicBarVisible',
  default: false,
});

export const MusicBarMiniMode = atom({
  key: 'MusicBarMiniMode',
  default: true,
});

export const MusicBarPosition = atom({
  key: 'MusicBarPosition',
  default: { x: document.body.clientWidth, y: 160 },
});

export const MusicBarMagneticLeft = atom({
  key: 'MusicBarMagneticLeft',
  default: false,
});

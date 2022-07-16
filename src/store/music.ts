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
    url: '',
  },
});

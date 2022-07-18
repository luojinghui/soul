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

export const MusicBarVisible = atom({
  key: 'MusicBarVisible',
  default: false,
});

export const MusicBarPosition = atom({
  key: 'MusicBarPosition',
  default: { x: 0, y: 160, left: true },
});

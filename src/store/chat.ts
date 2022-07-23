import { atom } from 'recoil';

export const emojiSelectedIndex = atom({
  key: 'emojiSelectedIndex',
  default: 0,
});

export const RoomMusicList = atom({
  key: 'RoomMusicList',
  default: [],
});

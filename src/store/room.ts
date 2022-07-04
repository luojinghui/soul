import { atom } from 'recoil';

export const roomListState = atom({
  key: 'roomList',
  default: [],
});

export const messageListState = atom({
  key: 'messageList',
  default: [],
});

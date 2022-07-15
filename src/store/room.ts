import { atom } from 'recoil';
import { IActiveKey } from '@/type';

export const allRoomListState = atom({
  key: 'allRoomList',
  default: [],
});

export const joinedRoomListState = atom({
  key: 'joinedRoomList',
  default: [],
});

export const mineRoomListState = atom({
  key: 'mineRoomList',
  default: [],
});

export const activeKeyState = atom<IActiveKey>({
  key: 'activeKey',
  default: 'all',
});

export const messageListState = atom({
  key: 'messageList',
  default: [],
});

const messageStoreMap: any = {};

export const messageListStoreFunc = (key: string) => {
  if (messageStoreMap[key]) {
    return messageStoreMap[key];
  }

  console.log('messageStoreMap: ', messageStoreMap);

  const messageState = atom({ key, default: [] });
  // @ts-ignore
  messageStoreMap[key] = messageState;

  return messageState;
};

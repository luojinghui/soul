import { atom } from 'recoil';

export const roomListState = atom({
  key: 'roomList',
  default: [],
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

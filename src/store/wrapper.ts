import { atom } from 'recoil';

export const wrapperListState = atom({
  key: 'wrapperListState',
  default: [],
});

export const wrapperSizeState = atom({
  key: 'wrapperSizeState',
  default: {
    width: 200,
    height: 308,
    realW: 0,
    realH: 0,
  },
});

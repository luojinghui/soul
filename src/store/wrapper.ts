import { atom } from 'recoil';

export const wrapperListState = atom({
  key: 'wrapperListState',
  default: [],
});

export const wrapperSizeState = atom({
  key: '',
  default: {
    width: 200,
    height: 308,
  },
});

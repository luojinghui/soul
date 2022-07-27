import { atom, RecoilState } from 'recoil';
import { IImgSize, IWrapperSelectKey } from '@/type';

const wrapperStoreMap: any = {};

export const wrapperHotListState = atom({
  key: 'wrapperHotListState',
  default: [],
});

export const wrapperHotPageSize = atom({
  key: 'wrapperHotPageSize',
  default: 1,
});

export const wrapperStoreFunc = (key: string): any => {
  if (wrapperStoreMap[key]) {
    return wrapperStoreMap[key];
  }

  const listKey: string = `${key}ListState`;
  const pageKey: string = `${key}PageState`;
  const loadingKey: string = `${key}LoadingState`;

  const listState = atom({ key: listKey, default: [] });
  const pageState = atom({ key: pageKey, default: 1 });
  const loadingState = atom({ key: loadingKey, default: true });
  const merges = { listState, pageState, loadingState };

  wrapperStoreMap[key] = merges;

  return merges;
};

// export const wrapperNewListState = atom({
//   key: 'wrapperNewListState',
//   default: [],
// });

// export const wrapperNewPageSize = atom({
//   key: 'wrapperNewPageSize',
//   default: 1,
// });

// export const wrapperLandscapeListState = atom({
//   key: 'wrapperLandscapeListState',
//   default: [],
// });

// export const wrapperLandscapePageSize = atom({
//   key: 'wrapperNewPageSize',
//   default: 1,
// });

export const wrapperSelectKey = atom<IWrapperSelectKey>({
  key: 'wrapperSelectKey',
  default: 'hot',
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

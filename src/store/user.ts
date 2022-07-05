import { atom, selector, selectorFamily } from 'recoil';
import action from '@/action';
import { AvatarMap } from '@/components';
import { httpServer } from '@/enum';
import { storage } from '@/utils/storage';

/** 用户信息key */
export const UserInfoKey = 'SOUL_USER_INFO_v1';

const userStoreMap: any = {};
let isFirstIn = true;

const getUserInfo = async () => {
  let userInfo = storage.get(UserInfoKey) || {
    name: '',
  };
  console.log('get cache userinfo: ', userInfo);

  if (!userInfo.id) {
    const res = await action.registerUser();

    if (res && res.code === 200) {
      storage.set(UserInfoKey, res.data);

      return res.data;
    }
  }

  if (isFirstIn) {
    const res = await action.getUserInfo(userInfo.id);

    if (res && res.code === 200) {
      userInfo = res.data;

      storage.set(UserInfoKey, userInfo);
    }

    isFirstIn = false;
  }

  return userInfo;
};

export const userInfoState = atom({
  key: 'userInfo',
  default: (async () => {
    return await getUserInfo();
  })(),
});

export const userAvatarState = selector({
  key: 'userAvatarUrl',
  get: ({ get }) => {
    const user = get(userInfoState);
    const { avatar, avatarType } = user;

    if (!avatar) {
      return AvatarMap['1'];
    }

    if (avatarType === 'Local') {
      return AvatarMap[avatar];
    } else {
      const src = `${httpServer}/upload/${user.id}/${avatar}`;

      return src;
    }
  },
});

export const remoteUserStoreFunc = (key: string) => {
  if (userStoreMap[key]) {
    return userStoreMap[key];
  }

  console.log('userStoreMap: ', userStoreMap);

  const remoteUserInfoState = atom({ key, default: {} });
  // @ts-ignore
  userStoreMap[key] = remoteUserInfoState;

  return remoteUserInfoState;
};

export const getAvatarUrl = (data: any, userId: string) => {
  const { avatar, avatarType } = data;

  let avatarUrl = '';

  if (!avatar) {
    avatarUrl = AvatarMap['1'];
  }

  if (avatarType === 'Local') {
    avatarUrl = AvatarMap[avatar];
  } else {
    avatarUrl = `${httpServer}/upload/${userId}/${avatar}`;
  }

  return avatarUrl;
};

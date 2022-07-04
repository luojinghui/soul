import { atom, selector, selectorFamily } from 'recoil';
import action from '@/action';
import { httpServer } from '@/enum';
import { AvatarMap } from '@/components';
import { storage } from '@/utils/storage';

/** 用户信息key */
export const UserInfoKey = 'SOUL_USER_INFO_v1';

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

export const remoteUserInfoState = selectorFamily({
  key: 'remoteUser',
  get:
    ({ userId }: any) =>
    async () => {
      try {
        const result = await action.getUserInfo(userId);
        const { avatar, avatarType } = result.data;

        let avatarUrl = '';

        if (!avatar) {
          avatarUrl = AvatarMap['1'];
        }

        if (avatarType === 'Local') {
          avatarUrl = AvatarMap[avatar];
        } else {
          avatarUrl = `${httpServer}/upload/${userId}/${avatar}`;
        }

        return {
          state: 'success',
          ...result?.data,
          avatarUrl,
        };
      } catch (err) {
        return {
          state: 'fail',
          error: err,
          avatar: '',
          avatarType: '',
          id: '',
          name: '',
          avatarUrl: '',
        };
      }
    },
  // 可选 set
  set:
    ({ userId }) =>
    ({ set }, newValue) => {},
});

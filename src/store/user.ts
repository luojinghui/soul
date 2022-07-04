import { atom, selector, selectorFamily } from 'recoil';
import action from '@/action';
import { httpServer } from '@/enum';
import { AvatarMap } from '@/components';

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

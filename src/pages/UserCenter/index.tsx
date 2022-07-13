import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { remoteUserStoreFunc, getAvatarUrl } from '@/store';
import { useNavigate, useParams } from 'react-router-dom';
import action from '@/action';
import { Header } from '@/components';

import './index.less';

export default function UserCenter() {
  const params: any = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useRecoilState<any>(
    remoteUserStoreFunc(`remote_user_${params.userId}`)
  );

  console.log('params: ', params);
  console.log('userInfo: ', userInfo);

  const getUserInfo = async () => {
    let info;
    const result = await action.getUserInfo(params.userId);

    if (result?.code === 200) {
      const avatarUrl = getAvatarUrl(result.data, params.userId);

      console.log('avatarUrl: ', avatarUrl);

      info = {
        state: 'success',
        avatarUrl,
        ...result?.data,
      };
    } else {
      info = {
        state: 'fail',
        error: null,
        avatar: '1',
        avatarType: 'Local',
        id: '',
        name: '',
        avatarUrl: '',
      };
    }

    setUserInfo(info);
  };

  useEffect(() => {
    (async () => {
      await getUserInfo();
    })();
  }, []);

  return (
    <div className="app user-page">
      <Header title="用户中心"></Header>

      <div className="content">
        <div className="person-avatar">
          <img src={userInfo.avatarUrl} alt="avatar" className="img" />
        </div>
        <div className="name">
          <div className="span">{userInfo.name}</div>
        </div>
      </div>
    </div>
  );
}

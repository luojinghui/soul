import { useEffect, useRef } from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { userAvatarState } from '@/store';
import { remoteUserInfoState } from '@/store/user';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import './index.less';

export default function UserCenter() {
  const params = useParams();

  const userInfo = useRecoilValue(remoteUserInfoState(params));
  const resetUserInfo = useResetRecoilState(remoteUserInfoState(params));

  const userAvatar = useRecoilValue(userAvatarState);
  const navigate = useNavigate();

  console.log('userInfo: ', userInfo);
  console.log('params: ', params);

  useEffect(() => {
    return () => {
      resetUserInfo();
    };
  });

  const onHome = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <div className="app user-page">
        {/* 头部内容 */}
        <header className="im-header">
          <div className="left">
            <LeftOutlined className="icon back" onClick={onHome} />
          </div>

          <div className="title">用户中心</div>

          <div className="right"></div>
        </header>

        <div className="content">
          <div className="person-avatar">
            <img src={userInfo.avatarUrl} alt="avatar" className="img" />
          </div>
          <div className="name">
            <div className="span">{userInfo.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getTimeText } from './utils';
import { NavLink, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState } from '@/store';

import './index.less';

function App() {
  const [time] = useState(() => getTimeText());

  const userInfo = useRecoilValue(userInfoState);
  const userAvatar = useRecoilValue(userAvatarState);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      document.title = '流浪星球-JingHui';
    }
  }, [location]);

  const onJump = () => {
    window.open('http://luojh.me');
  };

  return (
    <div className="container">
      <div className={`bg12 bgAnimate`}>
        <div className="user center">
          <NavLink to="/user" className="user-wrap center">
            <div className="avatar">
              <img src={userAvatar} alt="avatar" className="img" />
            </div>
            <div className="name">
              <span className="time">{time}，</span>
              <span className="time">{userInfo.name}</span>
            </div>
          </NavLink>
        </div>

        <div className="nav">
          <NavLink to="/wrapper" className="circle center swim">
            <span className="link">壁纸</span>
          </NavLink>

          <div className="circle center barrage" onClick={onJump}>
            <span className="link">博客</span>
          </div>

          <NavLink to="/chat" className="circle center swim">
            <span className="link">聊天</span>
          </NavLink>
        </div>

        {/* <div className="footer">
          <div className="setting">
            <SettingOutlined className="setting-icon" />
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default App;

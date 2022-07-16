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

  return (
    <div className="container app-page">
      <div className={`bg12 bgAnimate`}>
        <div className="user center">
          <NavLink to="/user" className="wrap center">
            <div className="avatar">
              <img src={userAvatar} alt="avatar" className="img" />
            </div>
            <div className="info">
              <div className="time">{time}</div>
              <div className="name">{userInfo.name}</div>
            </div>
          </NavLink>
        </div>

        <div className="nav">
          <NavLink to="/wrapper" className="circle center swim">
            <span className="link">壁纸</span>
          </NavLink>

          <NavLink to="/music" className="circle center swim">
            <span className="link">音乐</span>
          </NavLink>

          <NavLink to="/chat" className="circle center swim">
            <span className="link">星球</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { getTimeText } from './utils';
import { NavLink } from 'react-router-dom';
import './index.less';
import { message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import action from '@/action';
import { AvatarMap } from '@/components';

import { UserInfo } from '@/enum';

function App() {
  const [time, setTime] = useState('');
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    setTime(getTimeText());
  });

  useEffect(() => {
    (async () => {
      const userInfo = localStorage.getItem(UserInfo);
      console.log('userInfo: ', userInfo);

      if (!userInfo) {
        const res = await action.registerUser();

        console.log('res: ', res);

        if (res?.code === 200) {
          localStorage.setItem(UserInfo, JSON.stringify(res.data));
          setUser(res.data);
        } else {
          setUser({});
        }
      } else {
        setUser(JSON.parse(userInfo));
      }
    })();
  }, []);

  const onPush = () => {
    message.info('装修中，敬请期待');
  };

  const onJump = () => {
    window.open('http://luojh.me');
  };

  return (
    <div className="container">
      <div className={`bg12 bgAnimate`}>
        <div className="user center">
          <div className="avatar">
            {/* <img
              src="https://api.dujin.org/bing/1920.php"
              alt="avatar"
              className="img"
            /> */}
            <img
              src={
                user.avatarType === 'Local'
                  ? AvatarMap[user.avatar]
                  : user.avatar
              }
              alt="girl"
              className="img"
            />
          </div>

          <div className="name">
            <span className="time">{time}，</span>
            <span className="time">{user.name || '...'}</span>
          </div>
        </div>

        <div className="nav">
          <div className="circle center pic" onClick={onPush}>
            <span className="link">壁纸</span>
          </div>

          <div className="circle center barrage" onClick={onJump}>
            <span className="link">博客</span>
          </div>

          <div className="circle center swim">
            <NavLink to="/im" className="link">
              聊天室
            </NavLink>
          </div>
        </div>

        <div className="footer">
          <div className="setting">
            <SettingOutlined className="setting-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

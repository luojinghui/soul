import React, { useEffect, useMemo, useState } from 'react';
import { getTimeText } from './utils';
import { NavLink } from 'react-router-dom';
import './index.less';
import { message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import action from '@/action';
import { AvatarMap } from '@/components';
import { UserInfo, storage } from '@/utils/storage';

function App() {
  const [time, setTime] = useState('');
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    setTime(getTimeText());
  });

  useEffect(() => {
    (async () => {
      const userInfo = storage.get(UserInfo);
      console.log('userInfo: ', userInfo);

      if (!userInfo) {
        const res = await action.registerUser();

        console.log('res: ', res);

        if (res?.code === 200) {
          storage.set(UserInfo, res.data);
          setUser(res.data);
        } else {
          setUser({});
        }
      } else {
        setUser(userInfo);
      }
    })();
  }, []);

  const onPush = () => {
    message.info('装修中，敬请期待');
  };

  const onJump = () => {
    window.open('http://luojh.me');
  };

  const userAvatar = useMemo(() => {
    const { avatar, avatarType } = user;

    if (!avatar) {
      return AvatarMap['1'];
    }

    if (avatarType === 'Local') {
      return AvatarMap[avatar];
    } else {
      return avatar;
    }
  }, [user]);

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
            <img src={userAvatar} alt="userAvatar" className="img" />
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

          <NavLink to="/im" className="circle center swim">
            <span className="link">聊天室</span>
          </NavLink>
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

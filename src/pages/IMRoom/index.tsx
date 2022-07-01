import React, { useEffect, useState, useMemo } from 'react';
import { UserInfo, storage } from '@/utils/storage';
import { message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { LeftOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { AvatarMap } from '@/components';

import ice from '@/assets/images/ice.png';

import './index.less';

export const IMRoom = () => {
  const [roomList, setRoomList] = useState([]);
  const navigate = useNavigate();

  const [user, setUser] = useState<any>({});

  useEffect(() => {
    (async () => {
      const userInfo = storage.get(UserInfo);
      console.log('userInfo: ', userInfo);

      setUser(userInfo);

      if (userInfo) {
        const result = await action.getRoomList(userInfo.id);

        console.log('result: ', result);
        if (result && result.code === 200) {
          setRoomList(result.data);
        }
      } else {
        message.info('无用户信息，请先创建');
      }
    })();
  }, []);

  const onJoinRoom = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  const onHome = () => {
    navigate('/', { replace: true });
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
    <div>
      <div className="app">
        {/* 头部内容 */}
        <header className="im-header">
          <div className="left">
            <LeftOutlined className="icon back" onClick={onHome} />
          </div>

          <div className="title">星球大厅</div>

          <div className="right">
            <div className="btn">
              <PlusOutlined className="icon setting" />
            </div>
            <div className="btn">
              <SettingOutlined className="icon setting" />
            </div>
            <div className="person-avatar">
              <img src={userAvatar} alt="avatar" className="img" />
            </div>
          </div>
        </header>

        {/* 聊天内容 */}
        <div className="im-content">
          <div className="room-list">
            {roomList.map(
              ({ _id, roomId, roomName, roomTag, roomDesc }: any) => {
                return (
                  <div key={_id} className="room-info">
                    <div className="avatar">
                      <img src={ice} alt="avatar" />
                    </div>
                    <div>
                      <div>
                        房间号：<span>{roomId}</span>
                      </div>
                      <div>
                        房间名：<span>{roomName}</span>
                      </div>
                      <div>
                        Tag：
                        <span>{roomTag.map((val: string) => `${val} `)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        onJoinRoom(roomId);
                      }}
                      type="text"
                      className="join-btn"
                    >
                      加入房间
                    </Button>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

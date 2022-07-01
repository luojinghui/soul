import React, { useEffect, useState } from 'react';
import { UserInfo, storage } from '@/utils/storage';
import { message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import action from '@/action';

export const IMRoom = () => {
  const [roomList, setRoomList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const userInfo = storage.get(UserInfo);
      console.log('userInfo: ', userInfo);

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

  return (
    <div>
      <Button onClick={onHome}>Home</Button>
      <div>Room List:</div>
      {roomList.map(({ _id, roomId, roomName, roomDesc }: any) => {
        return (
          <div key={_id}>
            <div>
              房间号：<span>{roomId}</span>
            </div>
            <div>
              房间名称：<span>{roomName}</span>
            </div>
            <div>
              房间Tag：<span>{roomDesc}</span>
            </div>
            <Button
              onClick={() => {
                onJoinRoom(roomId);
              }}
              type="primary"
            >
              加入房间
            </Button>
          </div>
        );
      })}
    </div>
  );
};

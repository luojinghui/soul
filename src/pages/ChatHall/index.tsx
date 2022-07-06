import { useEffect, useState } from 'react';
import { message, Button, Modal } from 'antd';
import { useNavigate, NavLink } from 'react-router-dom';
import action from '@/action';
import { LeftOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState, roomListState } from '@/store';

import ice from '@/assets/images/ice.png';
import './index.less';

export const ChatHall = () => {
  const navigate = useNavigate();

  const [roomList, setRoomList] = useRecoilState(roomListState);
  const userInfo = useRecoilValue(userInfoState);
  const userAvatar = useRecoilValue(userAvatarState);

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      if (userInfo) {
        const result = await action.getRoomList(userInfo.id);

        if (result && result.code === 200) {
          setRoomList(result.data);
        }
      } else {
        message.info('无用户信息，请先创建');
      }
    })();
  }, [userInfo]);

  const onJoinRoom = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  const onHome = () => {
    navigate('/', { replace: true });
  };

  const handleOk = () => {};

  const handleCancel = () => {};

  return (
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
          {/* <div className="btn">
              <SettingOutlined className="icon setting" />
            </div> */}
          <NavLink to="/user" className="person-avatar">
            <img src={userAvatar} alt="avatar" className="img" />
          </NavLink>
        </div>
      </header>

      {/* 聊天内容 */}
      <div className="im-content">
        <div className="room-list">
          {roomList.map(
            (
              { _id, roomId, roomName, roomTag, roomDesc }: any,
              index: number
            ) => {
              return (
                <div key={_id} className={`room-info bg${index + 1}`}>
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
                    type="primary"
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

      <Modal
        title="创建房间"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </div>
  );
};

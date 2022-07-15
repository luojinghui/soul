import { useEffect, useState } from 'react';
import { message, Dropdown, Menu } from 'antd';
import { PlusOutlined, DownOutlined, SmileOutlined } from '@ant-design/icons';
import { Header, AddRoomMoel } from '@/components';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, roomListState } from '@/store';
import { httpServer } from '@/enum';

import logo from '@/assets/images/logo.svg';
import './index.less';

export const ChatHall = () => {
  const navigate = useNavigate();
  const [roomList, setRoomList] = useRecoilState(roomListState);
  const userInfo = useRecoilValue(userInfoState);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      if (userInfo) {
        await getRoomList();
      } else {
        message.info('无用户信息，请先创建');
      }
    })();
  }, [userInfo]);

  const getRoomList = async () => {
    const result = await action.getRoomList(userInfo.id);

    if (result && result.code === 200) {
      setRoomList(result.data);
    }
  };

  const onJoinRoom = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  const onCreateOK = async () => {
    await getRoomList();
  };

  const onShowAddRoom = () => {
    setIsModalVisible(!isModalVisible);
  };

  const menu = (
    <Menu
      items={[
        {
          key: '1',
          label: '星球大厅',
          icon: <SmileOutlined />,
        },
        {
          key: '2',
          label: '我参与的',
          icon: <SmileOutlined />,
        },
        {
          key: '3',
          label: '我创建的',
          icon: <SmileOutlined />,
        },
      ]}
    />
  );

  return (
    <div className="app">
      <Header
        title={
          <div>
            <Dropdown overlay={menu} placement="bottom" trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}>
                星球大厅
                <DownOutlined />
              </a>
            </Dropdown>
          </div>
        }
        rightContent={
          <div className="btn" onClick={onShowAddRoom}>
            <PlusOutlined className="icon setting" />
          </div>
        }
      ></Header>

      {/* 聊天内容 */}
      <div className="im-content">
        <div className="room-list">
          {roomList.map(
            (
              {
                _id,
                roomId,
                roomName,
                roomTag,
                roomDesc,
                roomAvatarUrl,
                ownerId,
              }: any,
              index: number
            ) => {
              let imgUrl = logo;
              if (roomAvatarUrl) {
                imgUrl = `${httpServer}/upload/${ownerId}/${roomAvatarUrl}`;
              }

              return (
                <div
                  key={_id}
                  className={`room-info bg${index + 1}`}
                  onClick={() => {
                    onJoinRoom(roomId);
                  }}
                >
                  <div className="avatar">
                    <img src={imgUrl} alt="" />
                  </div>
                  <div className="info">
                    <div>
                      <span className="title">{roomName}</span>
                    </div>
                    <div>
                      <span>{roomDesc}</span>
                    </div>
                    <div>
                      <span>标签：</span>
                      <span>{roomTag.map((val: string) => `${val} `)}</span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      <AddRoomMoel
        onCancel={onShowAddRoom}
        onCreateOK={onCreateOK}
        visible={isModalVisible}
        userId={userInfo.id}
      />
    </div>
  );
};

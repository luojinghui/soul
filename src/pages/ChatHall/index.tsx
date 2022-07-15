import { useCallback, useEffect, useState } from 'react';
import { message, Popover, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Header, AddRoomMoel } from '@/components';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  userInfoState,
  allRoomListState,
  joinedRoomListState,
  mineRoomListState,
  activeKeyState,
} from '@/store';
import { httpServer } from '@/enum';
import { IActiveKey } from '@/type';

import logo from '@/assets/images/logo.svg';
import './index.less';

const { TabPane } = Tabs;

export const ChatHall = () => {
  const navigate = useNavigate();
  const [allRoomList, setAllRoomList] = useRecoilState(allRoomListState);
  const [joinedRoomList, setJoinedRoomList] =
    useRecoilState(joinedRoomListState);
  const [mineRoomList, setMineRoomList] = useRecoilState(mineRoomListState);
  const [activeKey, setActiveKey] = useRecoilState<IActiveKey>(activeKeyState);
  const userInfo = useRecoilValue(userInfoState);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      if (userInfo) {
        await getRoomList(activeKey);
      } else {
        message.info('无用户信息，请先创建');
      }
    })();
  }, [userInfo, activeKey]);

  const getRoomList = async (filter: IActiveKey) => {
    const result = await action.getRoomList(userInfo.id, filter);

    if (result && result.code === 200) {
      const list = result.data;

      if (filter === 'all') {
        setAllRoomList(list);
      } else if (filter === 'join') {
        setJoinedRoomList(list);
      } else if (filter === 'mine') {
        setMineRoomList(list);
      }
    }
  };

  const onJoinRoom = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  const onCreateOK = async () => {
    setActiveKey('mine');

    if (activeKey === 'mine') {
      await getRoomList('mine');
    }
  };

  const onShowAddRoom = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onChange = (key: string) => {
    setActiveKey(key as IActiveKey);
  };

  const renderRoomList = useCallback(
    (filter: IActiveKey) => {
      let list = allRoomList;

      if (filter === 'join') {
        list = joinedRoomList;
      } else if (filter === 'mine') {
        list = mineRoomList;
      }

      return list.map(
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
      );
    },
    [activeKey, allRoomList, joinedRoomList, mineRoomList]
  );

  return (
    <div className="app chat-hall">
      <Header
        title={
          <Tabs
            className="sour_header_tabs"
            activeKey={activeKey}
            onChange={onChange}
          >
            <TabPane tab="大厅" key="all"></TabPane>
            <TabPane tab="参与" key="join"></TabPane>
            <TabPane tab="我的" key="mine"></TabPane>
          </Tabs>
        }
        rightContent=""
      ></Header>

      {/* 聊天内容 */}
      <div className="im-content">
        <div
          className={`room-list ${activeKey === 'all' ? 'active' : 'hidden'}`}
        >
          {renderRoomList('all')}
        </div>
        <div
          className={`room-list ${activeKey === 'join' ? 'active' : 'hidden'}`}
        >
          {renderRoomList('join')}
        </div>
        <div
          className={`room-list ${activeKey === 'mine' ? 'active' : 'hidden'}`}
        >
          {renderRoomList('mine')}
        </div>
      </div>

      <AddRoomMoel
        onCancel={onShowAddRoom}
        onCreateOK={onCreateOK}
        visible={isModalVisible}
        userId={userInfo.id}
      />

      <Popover placement="left" title={false} content="创建星球">
        <div className="fixed-btn" onClick={onShowAddRoom}>
          <PlusOutlined className="icon setting" />
        </div>
      </Popover>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { message, Button, Modal, Form, Input, Checkbox } from 'antd';
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
  const [form] = Form.useForm();

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

  const handleCancel = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onShowAddRoom = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onFinish = (e: any) => {
    console.log('e: ', e);

    form.resetFields();
    setIsModalVisible(!isModalVisible);
  };

  return (
    <div className="app">
      {/* 头部内容 */}
      <header className="im-header">
        <div className="left">
          <LeftOutlined className="icon back" onClick={onHome} />
        </div>

        <div className="title">星球大厅</div>

        <div className="right">
          <div className="btn" onClick={onShowAddRoom}>
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
        title="创建兴趣房间"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="创建"
        cancelText="取消"
        footer={false}
      >
        <Form
          form={form}
          name="roomInfo"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 18 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="房间号"
            name="roomId"
            rules={[{ required: true, message: 'Please input your 房间号!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="房间名称"
            name="roomName"
            rules={[{ required: true, message: 'Please input your 房间名称!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="房间标签" name="roomTag">
            <Input />
          </Form.Item>

          <Form.Item label="房间简介" name="roomDesc">
            <Input />
          </Form.Item>

          <Form.Item label="房间密码" name="pwd">
            <Input />
          </Form.Item>

          <Form.Item label="私有房间" name="private" valuePropName="checked">
            <Checkbox></Checkbox>
          </Form.Item>

          <Form.Item
            label="允许设置"
            name="allowSetting"
            valuePropName="checked"
          >
            <Checkbox></Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

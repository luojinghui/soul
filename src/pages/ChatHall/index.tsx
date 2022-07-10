import { useEffect, useRef, useState } from 'react';
import {
  message,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Upload,
} from 'antd';
import { UploadImg } from '@/components';
import { useNavigate, NavLink } from 'react-router-dom';
import action from '@/action';
import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState, roomListState } from '@/store';
import { httpServer } from '@/enum';

import logo from '@/assets/images/logo.svg';
import './index.less';

const { Option } = Select;
const tags = [
  {
    key: 'wangzhe',
    name: '王者荣耀',
  },
  {
    key: 'guangyu',
    name: '光遇',
  },
  {
    key: 'juezhan',
    name: '决战平安京',
  },
  {
    key: 'danzai',
    name: '蛋仔派对',
  },
  {
    key: 'xuexi',
    name: '学习监督',
  },
  {
    key: 'lanqiu',
    name: '篮球🏀',
  },
  {
    key: 'changge',
    name: '唱歌',
  },
  {
    key: 'tiaowu',
    name: '跳舞💃',
  },
  {
    key: 'duanshipin',
    name: '短视频',
  },
];

export const ChatHall = () => {
  const navigate = useNavigate();

  const [roomList, setRoomList] = useRecoilState(roomListState);
  const userInfo = useRecoilValue(userInfoState);
  const userAvatar = useRecoilValue(userAvatarState);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const imgRef = useRef<any>('');

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

  const onFinish = async (e: any) => {
    const data = {
      ...e,
      roomName: e.roomName.trim() + '星球',
      roomImg: imgRef.current?.response?.data?.fileUrl || '',
    };

    console.log('data:', data);

    if (!data.roomName.length) {
      message.info('填写星球名称');

      return;
    }

    if (!data.roomImg) {
      message.info('上传一张星球头像');

      return;
    }

    try {
      const result = await action.createRoom(data, userInfo.id);

      if (result.code === 200) {
        message.info('创建星球成功');

        await getRoomList();
      }
    } catch (err: any) {}
    form.resetFields();
    setIsModalVisible(!isModalVisible);
  };

  const children: React.ReactNode[] = [];

  tags.forEach(({ key, name }) => {
    children.push(
      <Option key={key} value={name}>
        {name}
      </Option>
    );
  });

  const onUploadChange = (fileList: any) => {
    console.log('fileList: ', fileList);

    imgRef.current = fileList[0] || '';
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
                <div key={_id} className={`room-info bg${index + 1}`}>
                  <div className="avatar">
                    <img src={imgUrl} alt="" />
                  </div>
                  <div>
                    <div>
                      星球名：<span>{roomName}</span>
                    </div>
                    <div>
                      描述：
                      <span>{roomDesc}</span>
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
                    进入
                  </Button>
                </div>
              );
            }
          )}
        </div>
      </div>

      <Modal
        title="创建兴趣星球"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="创建"
        cancelText="取消"
        footer={false}
        wrapClassName="room-model"
        width={350}
      >
        <Form
          form={form}
          name="roomInfo"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            className="item room-name-item"
            label="名称"
            name="roomName"
            initialValue={''}
          >
            <div>
              <Input />
              <span>星球</span>
            </div>
          </Form.Item>

          <Form.Item
            initialValue={''}
            className="item"
            label="头像"
            name="roomImg"
          >
            <UploadImg onChange={onUploadChange} userId={userInfo.id} />
          </Form.Item>

          <Form.Item
            className="item"
            initialValue={[]}
            label="标签"
            name="roomTag"
          >
            <Select
              dropdownClassName="ins-item"
              mode="tags"
              size="middle"
              placeholder=""
              showArrow={true}
            >
              {children}
            </Select>
          </Form.Item>

          <Form.Item
            className="item"
            label="介绍"
            name="roomDesc"
            initialValue={''}
          >
            <Input />
          </Form.Item>

          <Form.Item className="item" initialValue={''} label="密码" name="pwd">
            <Input />
          </Form.Item>

          <Form.Item
            initialValue={false}
            className="item item-bottom"
            label="私有"
            name="private"
            valuePropName="checked"
          >
            <Switch></Switch>
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

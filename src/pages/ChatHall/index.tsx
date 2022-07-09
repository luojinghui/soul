import { useEffect, useState } from 'react';
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
import ImgCrop from 'antd-img-crop';
import { useNavigate, NavLink } from 'react-router-dom';
import action from '@/action';
import { LeftOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState, roomListState } from '@/store';

import ice from '@/assets/images/ice.png';
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

  const children: React.ReactNode[] = [];

  tags.forEach(({ key, name }) => {
    children.push(
      <Option key={key} value={name}>
        {name}
      </Option>
    );
  });

  const [fileList, setFileList] = useState([]);
  const handleOnImgChange = ({ fileList: newFileList }: any) => {
    console.log('newFileList: ', newFileList);

    setFileList(newFileList);
  };

  const customRequest = (file: any) => {
    console.log('file: ', file);

    file.onSuccess("123");
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
            className="item"
            label="房间名称"
            name="roomName"
            initialValue={''}
          >
            <Input />
          </Form.Item>

          <Form.Item className="item" label="房间头像" name="roomImg">
            <ImgCrop
              modalCancel={'取消'}
              modalOk={'确定'}
              modalTitle="编辑图片"
            >
              <Upload
                customRequest={customRequest}
                showUploadList={{
                  showRemoveIcon: true,
                  showPreviewIcon: false,
                }}
                onChange={handleOnImgChange}
                maxCount={1}
                accept="image/*"
                fileList={fileList}
                listType="picture-card"
              >
                {!fileList.length && '上传'}
              </Upload>
            </ImgCrop>
          </Form.Item>

          <Form.Item
            className="item"
            initialValue={[]}
            label="房间标签"
            name="roomTag"
          >
            <Select
              dropdownClassName="ins-item"
              mode="tags"
              size="middle"
              placeholder=""
            >
              {children}
            </Select>
          </Form.Item>

          <Form.Item
            className="item"
            initialValue={''}
            label="房间密码"
            name="pwd"
          >
            <Input />
          </Form.Item>

          <Form.Item
            initialValue={false}
            className="item item-bottom"
            label="私有房间"
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

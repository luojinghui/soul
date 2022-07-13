import { useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState } from '@/store';
import { message, Input, Form, Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { Header, UploadImg } from '@/components';
import { EditFilled } from '@ant-design/icons';

import './index.less';

export default function PersonCenter() {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const userAvatar = useRecoilValue(userAvatarState);
  const navigate = useNavigate();
  const inputFileRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const imgRef = useRef<any>('');

  console.log('userInfo: ', userInfo);
  const handleOk = () => {};

  const handleCancel = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onShowAddRoom = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onFinish = async (e: any) => {
    const data = {
      name: e.name.trim() + '星球',
    };

    console.log('data:', data);

    if (!data.name.length) {
      message.info('填写你的名称');

      return;
    }

    try {
      console.log('data: ', data);

      const formData: any = {};
      const url = imgRef.current?.response?.data?.fileUrl || userInfo.avatar;

      formData['userId'] = userInfo.id;
      formData['name'] = data.name;
      formData['avatar'] = url;

      const result = await action.updateUserInfoV2(formData, userInfo.id);

      if (result?.code === 200) {
        message.info('更新成功');

        setUserInfo(result?.data);
      }
    } catch (err: any) {}
    form.resetFields();
    setIsModalVisible(!isModalVisible);
  };

  const onUploadChange = (fileList: any) => {
    console.log('fileList: ', fileList);

    imgRef.current = fileList[0] || '';
  };

  return (
    <div className="app user-page">
      <Header title="个人中心"></Header>

      {/* 聊天内容 */}
      <div className="content">
        <div className="user-page">
          <div className="user-bg">
            <div className="avatar">
              <img src={userAvatar} alt="avatar" className="img" />
            </div>
            <div className="name">{userInfo.name}</div>
            <EditFilled className="edit-icon" onClick={onShowAddRoom} />
          </div>
        </div>
      </div>

      <Modal
        title="修改个人信息"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="保存"
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
            label="名称"
            name="name"
            initialValue={userInfo.name}
          >
            <Input />
          </Form.Item>

          <Form.Item
            initialValue={''}
            className="item"
            label="头像"
            name="avatar"
          >
            <UploadImg onChange={onUploadChange} userId={userInfo.id} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

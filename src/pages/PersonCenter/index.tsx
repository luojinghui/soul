import { useEffect, useRef, useState, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState } from '@/store';
import { message, Input, Form, Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { Header, UploadImg } from '@/components';
import { EditFilled } from '@ant-design/icons';
import { IFile } from '@/type';
import { httpServer } from '@/enum';

import './index.less';

export default function PersonCenter() {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const userAvatar = useRecoilValue(userAvatarState);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fileRef = useRef<any>('');
  const userInfoCache = useRef<any>({});

  useEffect(() => {
    userInfoCache.current = userInfo;

    console.log('upate user: ', userInfoCache.current);
  }, [userInfo]);

  const handleOk = () => {};

  const handleCancel = () => {
    setIsModalVisible(!isModalVisible);

    form?.setFieldsValue(userInfoCache.current);
  };

  const onShowAddRoom = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onFinish = async (e: any) => {
    const data = {
      name: e.name.trim(),
    };

    if (!data.name.length) {
      message.info('填写你的名称');

      return;
    }

    try {
      const formData: any = {};
      const { avatar, id } = userInfoCache.current;
      const url = fileRef.current?.response?.data?.fileUrl || avatar;

      formData['userId'] = id;
      formData['name'] = data.name;
      formData['avatar'] = url;

      const result = await action.updateUserInfoV2(formData, id);

      console.log('result: ', result);

      if (result?.code === 200) {
        const newData = result?.data;

        message.info('更新成功');
        setUserInfo(newData);
      }
    } catch (err: any) {}
    setIsModalVisible(!isModalVisible);
  };

  const onUploadChange = (fileList: any) => {
    console.log('on change fileList: ', fileList);

    if (fileList.length) {
      fileRef.current = fileList[0] || '';
    }
  };

  const fileList = () => {
    const { avatar, id } = userInfoCache.current;

    const fileList: IFile[] = [
      {
        uid: '1',
        name: avatar,
        status: 'done',
        url: `${httpServer}/upload/${id}/${avatar}`,
        oriUrl: avatar,
      },
    ];

    console.log('get fileList: ', fileList);

    return fileList;
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

      {isModalVisible && (
        <Modal
          title="修改个人信息"
          open={isModalVisible}
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
            initialValues={userInfo}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item className="item" label="名称" name="name">
              <Input />
            </Form.Item>

            <Form.Item className="item" label="头像" name="avatar">
              <UploadImg
                onChange={onUploadChange}
                userId={userInfo.id}
                fileList={fileList()}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}

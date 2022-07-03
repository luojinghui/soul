import React, { useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState } from '@/store';
import { Button, Checkbox, Form, Input } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import action from '@/action';

import './index.less';

export default function User() {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const userAvatar = useRecoilValue(userAvatarState);
  const navigate = useNavigate();
  const inputFileRef = useRef(null);

  console.log('userInfo: ', userInfo);

  const onFinish = async (values: any) => {
    console.log('Success:', values);
    const user = {
      ...values,
      file: inputFileRef.current,
    };

    console.log('user:', user);

    try {
      const formData = new FormData();

      if (user.file) {
        formData.append('file', user.file);
      }

      formData.append('userId', userInfo.id);
      formData.append('name', user.name);

      const result = await action.updateUserInfo(formData, userInfo.id);
      console.log('update result: ', result);

      // @ts-ignore
      setUserInfo(result?.data);
    } catch (err) {}
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const onInputImgs = (e: any) => {
    console.log('onInputImgs:', e);

    inputFileRef.current = e.target.files[0];
  };

  const onHome = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="app">
        {/* 头部内容 */}
        <header className="im-header">
          <div className="left">
            <LeftOutlined className="icon back" onClick={onHome} />
          </div>

          <div className="title">星球大厅</div>

          <div className="right"></div>
        </header>

        {/* 聊天内容 */}
        <div className="im-content">
          <div className="user-page">
            <div className="person-avatar">
              <img src={userAvatar} alt="avatar" className="img" />
            </div>
            <div className="name">{userInfo.name}</div>

            <br />
            <div>
              <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="name"
                  name="name"
                  initialValue={userInfo.name}
                  rules={[
                    { required: true, message: 'Please input your name!' },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item>
                  <img src={userAvatar} alt="avatar" className="img" />
                  <label className="upload-file" htmlFor="upload"></label>
                  <input
                    id="upload"
                    type="file"
                    accept="image/*,.pdf,video/*,audio/*"
                    multiple={true}
                    className="upload-input"
                    onChange={onInputImgs}
                  ></input>
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button type="primary" htmlType="submit">
                    保存
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

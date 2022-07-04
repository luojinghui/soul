import React, { useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, userAvatarState } from '@/store';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { LeftOutlined, EditFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import action from '@/action';

import './index.less';

export default function PersonCenter() {
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

      message.info('修改成功');

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

    onFinish({ name: userInfo.name });
  };

  const onHome = () => {
    navigate(-1);
  };

  const onPressEnter = (e: any) => {
    const name = e.target.value;

    if (!name) {
      return;
    }

    onFinish({ name });
  };

  return (
    <div>
      <div className="app user-page">
        {/* 头部内容 */}
        <header className="im-header">
          <div className="left">
            <LeftOutlined className="icon back" onClick={onHome} />
          </div>

          <div className="title">个人中心</div>

          <div className="right"></div>
        </header>

        {/* 聊天内容 */}
        <div className="content">
          <div className="user-page">
            <div className="person-avatar">
              <img src={userAvatar} alt="avatar" className="img" />
              <label className="upload-file" htmlFor="upload">
                <EditFilled className="edit-icon" />
              </label>
              <input
                id="upload"
                type="file"
                accept="image/*,.pdf,video/*,audio/*"
                multiple={true}
                className="upload-input"
                onChange={onInputImgs}
              ></input>
            </div>
            <div className="name">
              <div>
                <Input
                  defaultValue={userInfo.name}
                  onPressEnter={onPressEnter}
                  className="name-input"
                ></Input>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

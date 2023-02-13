import { useEffect, useState } from 'react';
import { storage } from '@/utils/storage';
import { UserInfoKey } from '@/store/user';
import { AlertOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useSetRecoilState } from 'recoil';
import action from '@/action';
import './index.less';

import { userInfoState } from '@/store';

function Login() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState('');

  const setUserInfo = useSetRecoilState(userInfoState);

  useEffect(() => {
    (async () => {
      let userInfo = storage.get(UserInfoKey) || {};

      // 没有用户信息
      if (!userInfo || !userInfo.name) {
        setIsNewUser(true);
      } else {
        const { id, name } = userInfo;
        const res = await action.checkUserInfo(id, name);

        if (res.code === 200) {
          setIsNewUser(false);
        } else {
          storage.set(UserInfoKey, {});
          setIsNewUser(true);
        }
      }
    })();
  }, []);

  const onSubmit = async () => {
    const trimName = name.trim();

    if (trimName.length) {
      const res = await action.registerUser(trimName);

      if (res && res.code === 200) {
        const userInfo = res.data;

        message.info('恭喜你成为星球用户');
        storage.set(UserInfoKey, userInfo);
        setUserInfo(userInfo);
        setIsNewUser(false);
      } else {
        message.warning('创建失败，请稍后重试');
      }
    } else {
      message.warning('需要输入昵称');
    }
  };

  return (
    <div className={`login ${isNewUser ? 'show' : 'hidden'}`}>
      <div className="content">
        <div className="center">
          <AlertOutlined className="name" />
        </div>
        <div>流浪星球中，请先创建一个身份</div>
        <div className="account">
          <Input
            placeholder="输入昵称"
            value={name}
            onChange={(val) => {
              setName(val.target.value);
            }}
          />
        </div>
        <div className="center">
          <Button className="create" type="primary" onClick={onSubmit}>
            创建随机账号
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;

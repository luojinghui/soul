import React, { ReactNode, useEffect, useRef } from 'react';
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
import { useRecoilValue } from 'recoil';
import { userAvatarState } from '@/store';

import './index.less';

interface IProps {
  title: string | ReactNode;
  rightContent?: ReactNode;
  showAvatar?: boolean;
  onBack?: () => void;
}

function Header(props: IProps) {
  const { title, onBack, showAvatar = true, rightContent } = props;
  const navigate = useNavigate();

  const cachePageTitle = useRef('');

  const userAvatar = useRecoilValue(userAvatarState);

  useEffect(() => {
    cachePageTitle.current = document.title;

    if (title && typeof title === 'string') {
      document.title = title;
    }

    return () => {
      if (title && typeof title === 'string') {
        document.title = cachePageTitle.current;
      }
    };
  }, []);

  const onHome = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <header className="soul_header">
      <div className="left">
        <LeftOutlined className="icon back" onClick={onHome} />
      </div>

      <div className="title">{title}</div>

      <div className="right">
        {rightContent}

        {showAvatar && (
          <NavLink to="/user" className="person-avatar">
            <img src={userAvatar} alt="avatar" className="img" />
          </NavLink>
        )}
      </div>
    </header>
  );
}

export default Header;

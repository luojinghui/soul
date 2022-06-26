import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Input, Button, Form, message } from 'antd';
import {
  SwapOutlined,
  LeftOutlined,
  SettingOutlined,
  PlusOutlined,
  PictureFilled,
  FolderOpenFilled,
  SmileFilled,
} from '@ant-design/icons';
import { imServer } from '../../enum';
import { useNavigate, useParams } from 'react-router-dom';
import { parseMD } from '@/utils/markdown';
import { AvatarMap } from '@/components';
import { UserInfo, storage } from '@/utils/storage';
import action from '@/action';

import './index.less';
import 'highlight.js/styles/github.css';

const { TextArea } = Input;

function IM() {
  const socketRef = useRef<Socket | null>();
  const nameRef = useRef('');
  const messageListRef = useRef([]);
  const msgRef = useRef('');
  const chatRef = useRef(null);
  const contentRef = useRef(null);
  const formRef = useRef(null);
  const userRef = useRef<any>({});
  const cacheUserMap = useRef<any>({});

  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState<any>({});
  const [roomInfo, setRoomInfo] = useState<any>({});

  const navigate = useNavigate();
  const params: any = useParams();

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    (async () => {
      let userInfo = storage.get(UserInfo);

      if (!userInfo) {
        const res = await action.registerUser();

        console.log('register res: ', res);

        if (res?.code === 200) {
          userInfo = res.data;
        }
      }

      storage.set(UserInfo, userInfo);
      userRef.current = userInfo;
      setUser(userInfo);

      const { roomId } = params;
      const { id: userId } = userInfo;
      const result = await action.getRoomInfo(roomId, userId);

      // 房间号不存在
      if (result?.code === 204 && roomId !== '888') {
        message.info('房间不存在，请先创建房间！');
        return;
      }

      if (result?.code === 204 && roomId === '888') {
        const createResult = await action.createRootRoom({ roomId, userId });

        console.log('createResult: ', createResult);
        if (createResult?.code === 200) {
          setRoomInfo(createResult.data);
          connectWss();
          return;
        } else {
          message.info('创建房间失败，请稍后重试');
          return;
        }
      }

      if (result?.code === 200) {
        setRoomInfo(result.data);
        connectWss();
      }
    })();
  }, []);

  const connectWss = useCallback(() => {
    // 连接信令服务器
    socketRef.current = io(imServer, {
      path: '/im',
    });

    socketRef.current.on('message', (msg: any) => {
      console.log('msg: ', msg);
      const { type, data } = msg;

      switch (type) {
        case 'message_list':
          console.log('message list: ', data);
          setMessageList(data);
          break;
        case 'message':
          console.log('new message: ', data);

          const newList: any = [...messageListRef.current];
          const nextData = {
            ...data,
            ...cacheUserMap.current[data.userId],
          };
          newList.push(nextData);

          messageListRef.current = newList;
          setMessageList(newList);

          console.log('newList:', newList);
          break;

        case 'users':
          console.log('user list: ', data);

          cacheUserMap.current = data;
          break;
      }
    });

    socketRef.current.on('connect', () => {
      console.log('wss connected: ', params.roomId);

      sendMessage({ type: 'join', data: null });
    });
  }, [params]);

  /**
   * 发送wss消息
   */
  const sendMessage = useCallback(
    (data: Object) => {
      const mergedData = {
        ...data,
        roomId: params.roomId,
        userId: userRef.current.id,
      };

      console.log('success send msg: ', mergedData);
      socketRef.current?.send(mergedData);
      // 重置输入框
      // @ts-ignore
      formRef.current.resetFields();
    },
    [params]
  );

  const onBack = () => {
    navigate('../', { replace: true });
  };

  const onInputMsg = (e: any) => {
    msgRef.current = parseMD.render(e.msg);

    const data = {
      type: 'chat',
      data: {
        content: msgRef.current,
        msgType: 'text',
        imageUrl: '',
        fileUrl: '',
        fileJson: '',
        roomId: params.roomId,
        userId: userRef.current.id,
      },
    };

    console.log('input msg: ', e.msg);
    console.log('result: ', msgRef.current);

    sendMessage(data);
  };

  const scrollDown = () => {
    console.log('chatRef.current: ', chatRef.current);
    // @ts-ignore
    console.log('chatRef.current: ', chatRef.current?.scrollHeight);

    // @ts-ignore
    contentRef.current.scrollTop = chatRef.current?.scrollHeight;
  };

  const renderContent = () => {
    return (
      <>
        <div className="chats" ref={chatRef}>
          {messageList.map((item: any) => {
            const { avatarType, userId, name, _id, content, avatar } = item;

            return (
              <div
                key={_id}
                className={`chat ${
                  userId === userRef.current.id ? 'flex-right' : ''
                }`}
              >
                <div className="avatar">
                  <img
                    // src="https://api.dujin.org/bing/1920.php"
                    src={avatarType === 'Local' ? AvatarMap[avatar] : avatar}
                    alt="avatar"
                    className="img"
                  />
                </div>
                <div className="chat-content">
                  {userId !== userRef.current.id && (
                    <div className="name">{name}</div>
                  )}
                  <div
                    className="html"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const userAvatar = useMemo(() => {
    const { avatar, avatarType } = user;

    if (!avatar) {
      return AvatarMap['1'];
    }

    if (avatarType === 'Local') {
      return AvatarMap[avatar];
    } else {
      return avatar;
    }
  }, [user]);

  return (
    <div className="app">
      <header className="header">
        <div className="left">
          <LeftOutlined className="operate back" onClick={onBack} />
        </div>
        <div>{roomInfo.roomName || ''}</div>
        <div className="right">
          <div>
            <PlusOutlined className="operate setting" />
          </div>
          <div>
            <SwapOutlined className="operate setting" />
          </div>
          <div>
            <SettingOutlined className="operate setting" />
          </div>
          <div className="avatar">
            <img src={userAvatar} alt="avatar" className="img" />
          </div>
        </div>
      </header>
      <div className="content" ref={contentRef}>
        {renderContent()}
      </div>

      <div className="im-footer">
        <Form
          ref={formRef}
          className="msg"
          name="msg"
          onFinish={onInputMsg}
          autoComplete="off"
        >
          <Form.Item name="msg" className="input">
            <TextArea
              className="msg-input"
              autoSize={{ minRows: 1, maxRows: 4 }}
            />
          </Form.Item>
          <Form.Item className="send">
            <Button className="send-btn" type="primary" htmlType="submit">
              发送
            </Button>
          </Form.Item>
        </Form>
        <div className="funcs">
          <div className="func">
            <SmileFilled className="icon" />
          </div>
          <div className="func">
            <PictureFilled className="icon" />
          </div>
          <div className="func">
            <FolderOpenFilled className="icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IM;

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Input, Button, Form } from 'antd';
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
  const listRef = useRef([]);
  const msgRef = useRef('');
  const chatRef = useRef(null);
  const contentRef = useRef(null);
  const formRef = useRef(null);
  const userRef = useRef<any>({});

  const [meetingId, setMeetingId] = useState('');
  const [list, setList] = useState([]);
  const [user, setUser] = useState<any>({});

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const userInfo = storage.get(UserInfo);

      if (!userInfo) {
        const res = await action.registerUser();

        if (res?.code === 200) {
          storage.set(UserInfo, res.data);
          setUser(res.data);
        } else {
          setUser({});
        }
      } else {
        setUser(userInfo);
      }

      setTimeout(() => {
        onConnectWss();
      }, 0);
    })();
  }, []);

  useEffect(() => {
    userRef.current = user;
    console.log('userRef.current: ', userRef.current);
  }, [user]);

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  const onConnectWss = useCallback(() => {
    // 连接信令服务器
    socketRef.current = io(imServer, {
      path: '/im',
    });

    socketRef.current.on('message', (msg: any) => {
      console.log('msg: ', msg);
      const { type, data } = msg;

      switch (type) {
        case 'history-msg':
          console.log('history-data: ', data);
          setList(data);

          setTimeout(() => {
            scrollDown();
          }, 1);
          break;
        case 'remote-chat':
          console.log('history-data: ', data);
          const newList: any = [...listRef.current];
          newList.push(data);

          setList(newList);

          setTimeout(() => {
            scrollDown();
          }, 1);
          break;
        case 'rooms':
          console.log('rooms: ', data);

          break;
      }
    });

    socketRef.current.on('connect', () => {
      console.log('wss connected: ', params.meetingId);

      onJoinMeeting();
    });
  }, [meetingId]);

  const onJoinMeeting = () => {
    sendMessage({
      type: 'join',
      data: null,
    });
  };

  const sendMessage = useCallback(
    (data: Object) => {
      const nextData = {
        ...data,
        meetingId: params.meetingId,
        userId: userRef.current.id,
      };
      console.log('success send msg: ', nextData);

      socketRef.current?.send(nextData);
      // @ts-ignore
      formRef.current.resetFields();
    },
    [meetingId]
  );

  const onSend = () => {
    const data = {
      type: 'chat',
      data: {
        text: msgRef.current,
        msgType: 'text',
        id: new Date().valueOf(),
        sender: userRef.current.id,
      },
    };

    sendMessage(data);
  };

  const onBack = () => {
    navigate('../', { replace: true });
  };

  const onIinputMsg = (e: any) => {
    console.log('input msg: ', e.msg);

    const result = parseMD.render(e.msg);
    console.log('result: ', result);

    msgRef.current = result;

    onSend();
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
          {list.map((item: any) => {
            return (
              <div
                key={item.id}
                className={`chat ${
                  item.sender === userRef.current.id ? 'flex-right' : ''
                }`}
              >
                <div className="avatar">
                  <img
                    // src="https://api.dujin.org/bing/1920.php"
                    src={userAvatar}
                    alt="avatar"
                    className="img"
                  />
                </div>
                <div className="chat-content">
                  {item.sender !== userRef.current.id && (
                    <div className="name">{item.sender}</div>
                  )}
                  <div
                    className="html"
                    dangerouslySetInnerHTML={{ __html: item.text }}
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
        <div>流浪星球</div>
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
          onFinish={onIinputMsg}
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

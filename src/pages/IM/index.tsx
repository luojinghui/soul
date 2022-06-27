import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from 'react';
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
import { MessageTime } from '@/utils/messageTime';
import action from '@/action';
import urlRegex from 'url-regex';
import { ChatInput } from '@/components';

import './index.less';
import 'highlight.js/styles/github.css';

const { TextArea } = Input;

function IM() {
  const socketRef = useRef<Socket | null>();
  const messageListRef = useRef([]);
  const msgRef = useRef('');
  const chatRef = useRef(null);
  const contentRef = useRef(null);
  const formRef = useRef(null);
  const userRef = useRef<any>({});
  const cacheUserMap = useRef<any>({});
  const MessageTimeRef = useRef<any>(MessageTime);
  const inputRef = useRef(null);

  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState<any>({});
  const [roomInfo, setRoomInfo] = useState<any>({});
  const [pageInfo, setPageInfo] = useState({
    currentPage: 0,
    totalPage: 0,
  });

  const navigate = useNavigate();
  const params: any = useParams();

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const { roomName = '流浪星球' } = roomInfo;

    document.title = roomName;
  }, [roomInfo]);

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
          const { currentPage, list, totalPage } = data;

          setPageInfo({
            totalPage,
            currentPage,
          });

          const nextList = list.map((item: any) => {
            return {
              ...item,
              ...cacheUserMap.current[item.userId],
              time: MessageTimeRef.current.get(item.createTime),
            };
          });

          messageListRef.current = nextList;
          setMessageList(nextList);
          break;
        case 'message':
          const newList: any = [...messageListRef.current];
          const nextData = {
            ...data,
            ...cacheUserMap.current[data.userId],
            time: MessageTimeRef.current.get(data.createTime),
          };
          newList.push(nextData);

          messageListRef.current = newList;
          setMessageList(newList);
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
    },
    [params]
  );

  const onBack = () => {
    navigate('../', { replace: true });
  };

  const dealInnerHtml = (content: string) => {
    const urlReg = urlRegex({ strict: false, exact: true });
    const styleReg = /style="(.+?)\"/g;
    const classReg = /class="(.+?)\"/g;

    content = content
      .replace(urlReg, (url) => `<a href="${url}" target="_blank">${url}</a>`)
      .replace(styleReg, () => '')
      .replace(classReg, () => '');
    return content;
  };

  const onSendMessage = (value: string) => {
    const data = {
      type: 'chat',
      data: {
        content: value,
        msgType: 'text',
        imageUrl: '',
        fileUrl: '',
        fileJson: '',
        roomId: params.roomId,
        userId: userRef.current.id,
      },
    };
    
    sendMessage(data);
  };

  useLayoutEffect(() => {
    scrollDown();
  }, [messageList]);

  const scrollDown = () => {
    // @ts-ignore
    contentRef.current.scrollTop = chatRef.current?.scrollHeight;
  };

  const renderContent = () => {
    return (
      <>
        <div className="chats" ref={chatRef}>
          {messageList.map((item: any, index: number) => {
            const { avatarType, userId, name, _id, content, avatar } = item;

            return (
              <div key={_id}>
                {item.time && <div className="time">{item.time}</div>}
                <div
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
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const onInputContent = () => {
    removeDomClass(inputRef.current);
  };

  const removeDomClass = (domNoe: any) => {
    const domLen = domNoe.children.length;

    for (let i = 0; i < domLen; i++) {
      // 遍历第一级子元素
      const childNode = domNoe.children[i];

      childNode.removeAttribute('class');
      childNode.removeAttribute('style');
      removeDomClass(childNode);
    }
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
        <ChatInput onSendMessage={onSendMessage}></ChatInput>
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

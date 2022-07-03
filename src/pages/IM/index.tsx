import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { message, Image } from 'antd';
import { LeftOutlined, SettingOutlined } from '@ant-design/icons';
import { imServer } from '../../enum';
import { useNavigate, useParams } from 'react-router-dom';
import { AvatarMap } from '@/components';
import { UserInfo, storage } from '@/utils/storage';
import { MessageTime } from '@/utils/messageTime';
import action from '@/action';
import { ChatInput } from '@/components';
import { emojiMaxList } from '@/components/ChatInput/emoji';
import { IUserInfo } from '@/type';
import { httpServer } from '@/enum';

import './index.less';
import 'highlight.js/styles/github.css';

function IM() {
  const socketRef = useRef<Socket | null>();
  const messageListRef = useRef([]);
  const chatRef = useRef(null);
  const contentRef = useRef<any>(null);
  const userRef = useRef<any>({});
  const cacheUserMap = useRef<any>({});
  const MessageTimeRef = useRef<any>(MessageTime);
  const chatInputRef = useRef(null);
  const footerRef = useRef<any>(null);

  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState<IUserInfo | null>(null);
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
      // 重置timer计算器
      MessageTimeRef.current.clear();
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

  const onSendMessage = (value: any) => {
    const data = {
      type: 'chat',
      data: {
        roomId: params.roomId,
        userId: userRef.current.id,
        fileUrl: '',
        fileName: '',
        mimeType: '',
        originalName: '',
        size: 0,
        content: '',
        msgType: '',
        status: '',
        ...value,
      },
    };

    sendMessage(data);
  };

  useLayoutEffect(() => {
    scrollDown();
  }, [messageList]);

  const scrollDown = () => {
    if (footerRef.current) {
      const footerHeight = footerRef.current.clientHeight;

      contentRef.current.style.height = `calc(100% - var(--im-header-height) - ${footerHeight}px)`;
    }

    // @ts-ignore
    contentRef.current.scrollTop = chatRef.current?.scrollHeight;
  };

  const onChatInputStateChange = () => {
    scrollDown();
  };

  const onClickChatContent = () => {
    if (chatInputRef.current) {
      // @ts-ignore
      chatInputRef.current.clickChatContent();
    }
  };

  const onContextmenu = (e: any) => {
    e.preventDefault();

    console.log('12312');
  };

  const renderContent = () => {
    return (
      <div className="chat-list" ref={chatRef}>
        {messageList.map((item: any) => {
          const {
            avatarType,
            userId,
            name,
            _id,
            content,
            avatar,
            msgType,
            fileUrl,
            fileName,
            originalName,
            mimeType,
          } = item;
          const isSelf = userId === userRef.current.id;
          const isSuperEmoji = msgType === 'super_emoji';
          const isImgFile = msgType === 'file' && mimeType.includes('image');
          const isOtherFile = msgType === 'file' && !mimeType.includes('image');
          let html = '';
          let htmlContent = content;

          if (isSuperEmoji) {
            // @ts-ignore
            const { src, alt } = emojiMaxList[content];
            html = `<img src=${src} alt=${alt} data-emoji-type="max">`;
            htmlContent = html;
          }

          if (isImgFile) {
            const src = `${httpServer}/upload/${userId}/${fileUrl}`;
            // @ts-ignore
            const html = <Image src={encodeURI(src)} />;

            htmlContent = html;
          }

          if (isOtherFile) {
            const src = `${httpServer}/upload/${userId}/${fileUrl}`;
            // @ts-ignore
            html = `<a href=${encodeURI(
              src
            )} target="_blank">${originalName}</a>`;
            htmlContent = html;
          }

          return (
            <div className="item" key={_id}>
              {/* 时间 */}
              {item.time && <div className="time">{item.time}</div>}

              {/* 内容 */}
              <div className={`chat ${isSelf ? 'chat-right' : ''}`}>
                {/* 头像 */}
                <div className="avatar">
                  <img
                    src={avatarType === 'Local' ? AvatarMap[avatar] : avatar}
                    alt="avatar"
                    className="img"
                  />
                </div>

                {/* 聊天文本 */}
                <div className="content">
                  {userId !== userRef.current.id && (
                    <div className="name">{name}</div>
                  )}
                  <div onContextMenu={onContextmenu}>
                    {!isImgFile ? (
                      <div
                        className={`html ${
                          isSuperEmoji ? 'html_transparent' : ''
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: htmlContent,
                        }}
                      />
                    ) : (
                      <div
                        className={`html ${
                          isSuperEmoji ? 'html_transparent' : ''
                        }`}
                      >
                        {htmlContent}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const userAvatar = useMemo(() => {
    const { avatar, avatarType } = user || {};

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
      {/* 头部内容 */}
      <header className="im-header">
        <div className="left">
          <LeftOutlined className="icon back" onClick={onBack} />
        </div>

        <div className="title">{roomInfo.roomName || ''}</div>

        <div className="right">
          <div className="btn">
            <SettingOutlined className="icon setting" />
          </div>
          <div className="person-avatar">
            <img src={userAvatar} alt="avatar" className="img" />
          </div>
        </div>
      </header>

      {/* 聊天内容 */}
      <div className="im-content" ref={contentRef} onClick={onClickChatContent}>
        {renderContent()}
      </div>

      {/* 聊天输入区 */}
      <div className="im-footer" ref={footerRef}>
        {/* 聊天框组件 */}
        <ChatInput
          chatRef={chatInputRef}
          onStateChange={onChatInputStateChange}
          onSendMessage={onSendMessage}
          user={user}
        ></ChatInput>
      </div>
    </div>
  );
}

export default IM;

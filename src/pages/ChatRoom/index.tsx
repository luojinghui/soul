import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { message, Image } from 'antd';
import { LeftOutlined, SettingOutlined, FileFilled } from '@ant-design/icons';
import { imServer } from '../../enum';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { AvatarMap, Header } from '@/components';
import { MessageTime } from '@/utils/messageTime';
import action from '@/action';
import { ChatInput } from '@/components';
import { emojiMaxList } from '@/components/ChatInput/emoji';
import { IUserInfo } from '@/type';
import { httpServer } from '@/enum';
import { saveImg } from '@/utils';
import { platform } from '@/utils/browser';
import { copyText } from '@/utils/copy';

import { useRecoilState, useRecoilValue } from 'recoil';
import {
  userInfoState,
  userAvatarState,
  messageListState,
  messageListStoreFunc,
} from '@/store';

import './index.less';
import 'highlight.js/styles/github.css';

const browser = platform();

function ChatRoom() {
  const socketRef = useRef<Socket | null>();
  const messageListRef = useRef([]);
  const chatRef = useRef(null);
  const contentRef = useRef<any>(null);
  const userRef = useRef<any>({});
  const cacheUserMap = useRef<any>({});
  const MessageTimeRef = useRef<any>(MessageTime);
  const chatInputRef = useRef(null);
  const footerRef = useRef<any>(null);

  const [roomInfo, setRoomInfo] = useState<any>({});
  const [pageInfo, setPageInfo] = useState({
    currentPage: 0,
    totalPage: 0,
  });
  const [menuSet, setMenuSet] = useState<any>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    content: '',
  });

  const navigate = useNavigate();
  const params: any = useParams();
  const storeKey = `messageState${params.roomId}`;
  const messageStore = messageListStoreFunc(storeKey);

  const [messageList, setMessageList] = useRecoilState<any>(messageStore);
  const userInfo = useRecoilValue(userInfoState);
  const userAvatar = useRecoilValue(userAvatarState);
  userRef.current = userInfo;

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
      const { roomId } = params;
      const { id: userId } = userRef.current;
      const result = await action.getRoomInfo(roomId, userId);

      // 房间号不存在
      if (result?.code === 204 && roomId !== '888') {
        message.info('房间不存在，请先创建房间！');
        onBack();
        return;
      }

      if (result?.code === 204 && roomId === '888') {
        const createResult = await action.createRootRoom({ roomId, userId });

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
    console.log('imServer: ', imServer);

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

      contentRef.current.style = `
        height: calc(100% - var(--im-header-height) - ${footerHeight}px);
        bottom: ${footerHeight}px;
      `;
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

  const onContextmenu = (item: any, e: any) => {
    if (browser.isPc) {
      console.log('item: ', item);
      console.log('item e: ', e);

      setMenuSet({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        item,
        content: e.target.innerText,
      });
    }
  };

  const onDownload = useCallback(() => {
    console.log('menu: ', menuSet);

    // saveImg('.ant-image-img', '123.png');
  }, [menuSet]);

  const onCopyText = useCallback(() => {
    if (!menuSet.content.length) {
      message.info('没有内容可以复制');
      return;
    }

    copyText(menuSet.content);
    message.info('复制成功');
  }, [menuSet]);

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
          const isRenderContent = !isImgFile && !isOtherFile;

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

            const html = (
              <div className="soul-folder">
                <a href={src} target="_blank" className="name">
                  {originalName}
                </a>
                <FileFilled className="icon" />
              </div>
            );

            htmlContent = html;
          }

          const avatarSrc = `${httpServer}/upload/${userId}/${avatar}`;

          return (
            <div className="item" key={_id}>
              {/* 时间 */}
              {item.time && <div className="time">{item.time}</div>}

              {/* 内容 */}
              <div className={`chat ${isSelf ? 'chat-right' : ''}`}>
                {/* 头像 */}
                <NavLink
                  to={isSelf ? '/user' : `/user/${userId}`}
                  className="avatar"
                >
                  <img
                    src={avatarType === 'Local' ? AvatarMap[avatar] : avatarSrc}
                    alt="avatar"
                    className="img"
                  />
                </NavLink>

                {/* 聊天文本 */}
                <div className="content">
                  {userId !== userRef.current.id && (
                    <div className="name">{name}</div>
                  )}
                  <div
                    onContextMenu={(e: any) => {
                      e.preventDefault();

                      onContextmenu(item, e);
                    }}
                  >
                    {isRenderContent ? (
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

  return (
    <div className="app">
      {/* 头部内容 */}
      {/* <header className="im-header">
        <div className="left">
          <LeftOutlined className="icon back" onClick={onBack} />
        </div>

        <div className="title">{roomInfo.roomName || ''}</div>

        <div className="right">
          <div className="btn">
            <SettingOutlined className="icon setting" />
          </div>
          <NavLink to="/user" className="person-avatar">
            <img src={userAvatar} alt="avatar" className="img" />
          </NavLink>
        </div>
      </header> */}
      <Header title={roomInfo.roomName || ''}></Header>

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
          user={userInfo}
        ></ChatInput>
      </div>

      {menuSet.visible && (
        <div
          className="menu-mask"
          onClick={() => {
            setMenuSet({ visible: false, x: 0, y: 0, item: null });
          }}
        >
          <div
            className="menu-content"
            style={{ left: `${menuSet.x - 60}px`, top: `${menuSet.y}px` }}
          >
            <a className="btn" onClick={onCopyText}>
              复制
            </a>
            <a className="btn" onClick={onDownload}>
              下载
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Input, Button, Form } from 'antd';
import {
  SwapOutlined,
  LeftOutlined,
  SettingOutlined,
  PlusOutlined,
  SmileOutlined,
  PictureOutlined,
  FolderOpenOutlined,
  PictureFilled,
  FolderOpenFilled,
  SmileFilled,
} from '@ant-design/icons';
import { imServer } from '../../enum';
import { useNavigate, useLocation } from 'react-router-dom';

import { parseMD } from '@/utils/markdown';

import './index.less';
import 'highlight.js/styles/github.css';

const { TextArea } = Input;

function IM() {
  const socketRef = useRef<Socket | null>();
  const nameRef = useRef('');
  const listRef = useRef([]);
  const msgRef = useRef('');

  const [meetingId, setMeetingId] = useState('');
  // disconnect, connect, room
  const [state, setState] = useState('disconnect');
  const [list, setList] = useState([]);

  const navigate = useNavigate();
  let location = useLocation();

  console.log('location: ', location);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, [meetingId]);

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  useEffect(() => {
    onConnectWss();
  }, []);

  const onConnectWss = useCallback(() => {
    console.log(`${meetingId} is connected`);
    // 连接信令服务器
    console.log('imServer: ', imServer);

    socketRef.current = io(imServer, {
      path: '/im',
    });

    socketRef.current.on('message', (msg: any) => {
      console.log('msg: ', msg);
      const parseMsg = JSON.parse(msg);
      const { type, data } = parseMsg;

      switch (type) {
        case 'history-msg':
          console.log('history-data: ', data);
          setList(data);

          break;
        case 'remote-chat':
          console.log('history-data: ', data);
          const newList: any = [...listRef.current];
          newList.push(data);

          setList(newList);

          break;
        case 'rooms':
          console.log('rooms: ', data);

          break;
      }
    });

    socketRef.current.on('connect', () => {
      console.log('im connected: ', meetingId);

      sendMessage({
        type: 'connected',
        data: {},
      });
    });
  }, [meetingId]);

  const onJoin = () => {
    sendMessage({
      type: 'join',
      data: {},
    });

    navigate(`./?roomId=${meetingId}`);
  };

  const sendMessage = useCallback(
    (data: Object) => {
      const nextData = {
        ...data,
        meetingId,
        name: nameRef.current,
      };
      const stringData = JSON.stringify(nextData);

      console.log('success send msg: ', stringData);
      socketRef.current?.send(stringData);
    },
    [meetingId]
  );

  const onInput = (val: any) => {
    if (val.target.value) {
      setMeetingId(val.target.value);
    }
  };

  const onInputName = (val: any) => {
    nameRef.current = val.target.value;
  };

  const onInputMsg = (val: any) => {
    msgRef.current = val.target.value;
  };

  const onSend = () => {
    const data = {
      type: 'chat',
      data: {
        text: msgRef.current,
        msgType: 'text',
        id: new Date().valueOf(),
        sender: nameRef.current,
      },
    };

    sendMessage(data);
  };

  const onBack = () => {
    // navigate('../', { replace: true });
    navigate(-1);
  };

  const onIinputMsg = (e: any) => {
    console.log('handleEditorChange：', e);

    const result = parseMD.render(e.msg);

    console.log('result: ', result);

    const list: any = [
      {
        id: 1,
        sender: 'test',
        text: result,
      },
      {
        id: 2,
        sender: 'test',
        text: result,
      },
      {
        id: 3,
        sender: 'test',
        text: result,
      },
      {
        id: 4,
        sender: 'test',
        text: result,
      },
      {
        id: 5,
        sender: 'test',
        text: result,
      },
      {
        id: 6,
        sender: 'test',
        text: result,
      },
      {
        id: 7,
        sender: 'test',
        text: result,
      },
      {
        id: 8,
        sender: 'test',
        text: result,
      },
    ];

    setList(list);
  };

  const renderContent = () => {
    return (
      <>
        <div className="chats">
          {list.map((item: any) => {
            return (
              <div key={item.id} className="chat">
                <div className="avatar">
                  <img
                    src="https://api.dujin.org/bing/1920.php"
                    alt="avatar"
                    className="img"
                  />
                </div>
                <div className="chat-content">
                  <div className="name">{item.sender}</div>
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

    // if (state === 'connect' || state === 'disconnect') {
    //   return (
    //     <div className="form">
    //       <div className="box">
    //         <div className="input">
    //           <Input placeholder="房间号" onChange={onInput}></Input>
    //         </div>
    //         <div className="input">
    //           <Input placeholder="用户名" onChange={onInputName}></Input>
    //         </div>
    //         <Button type="primary" className="join" onClick={onJoin}>
    //           加入聊天室
    //         </Button>
    //       </div>
    //     </div>
    //   );
    // }
  };

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
            <img
              src="https://joeschmoe.io/api/v1/random"
              alt="avatar"
              className="img"
            />
          </div>
        </div>
      </header>
      <div className="content">{renderContent()}</div>

      <div className="im-footer">
        <Form
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

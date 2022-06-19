import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Input, Button } from 'antd';
import './index.less';

function IM() {
  const socketRef = useRef<Socket | null>();
  const nameRef = useRef('');
  const listRef = useRef([]);
  const msgRef = useRef('');

  const [meetingId, setMeetingId] = useState('');
  const [state, setState] = useState('login');
  const [list, setList] = useState([]);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, [meetingId]);

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  const onJoin = useCallback(() => {
    console.log(`${meetingId} is connected`);
    // 连接信令服务器
    socketRef.current = io('ws://localhost:3001', {
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
      }
    });

    socketRef.current.on('connect', () => {
      console.log('im connected: ', meetingId);
      setState('joined');

      sendMessage({
        type: 'join',
        data: {},
      });
    });
  }, [meetingId]);

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

  const renderContent = () => {
    if (state === 'joined') {
      return (
        <div>
          <div>
            {list.map((item: any) => {
              return (
                <div key={item.id}>
                  {item.sender}: {item.text}
                </div>
              );
            })}
          </div>
          <div className="fixed">
            <Input placeholder="输入内容" onChange={onInputMsg}></Input>
            <Button type="primary" className="join" onClick={onSend}>
              发送
            </Button>
          </div>
        </div>
      );
    }

    if (state === 'login') {
      return (
        <div className="form">
          <div className="box">
            <Input placeholder="房间号" onChange={onInput}></Input>
            <Input placeholder="用户名" onChange={onInputName}></Input>
            <Button type="primary" className="join" onClick={onJoin}>
              加入聊天室
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="content">{renderContent()}</div>
    </div>
  );
}

export default IM;

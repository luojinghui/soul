import { useEffect, useRef, useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { MS, CONFIGURATION, imServer } from '@/enum';
import { io } from 'socket.io-client';
import Stream from './stream';
import Video from './video';
import { Header } from '@/components';
import { useRecoilValue } from 'recoil';
import { userInfoState } from '@/store';
import logger from '@/utils/log';
import './index.less';

export const VideoCall = () => {
  // wss引用
  const socket = useRef<any>(null);
  const peerMap = useRef<any>({});
  const streamMap = useRef<any>({});
  const roomRef = useRef<any>({
    username: '',
    meetingId: 0,
  });
  const userListRef = useRef<any>({});
  const localInfoRef = useRef<any>({
    audio: true,
    video: true,
    username: '',
  });
  const meetingStatusRef = useRef<any>(MS.login);
  const isInitLocalStream = useRef<any>(false);
  const msgRef = useRef<any>([]);
  const msgEleRef = useRef<any>(null);
  const channelRef = useRef(false);

  const userInfo = useRecoilValue(userInfoState);

  const [imForm] = Form.useForm();
  // 当前用户信息
  const [layoutList, setLayoutList] = useState<any>([]);
  const [msgList, setMsgList] = useState([]);
  // 当前呼叫状态,login/meeting
  const [meetingStatus, setMeetingStatus] = useState(MS.login);

  const initWSS = () => {
    // 连接信令服务器
    socket.current = io(imServer, {
      path: '/video',
    });

    socket.current.on('message', async (msg: any) => {
      const result = JSON.parse(msg);

      logger.log('io receive: ', result);

      switch (result.type) {
        case 'call-state':
          handleCallState(result);

          break;
        case 'users':
          logger.log('users message: ', result.data);

          handleUsers(result.data);
          break;

        case 'offer':
          logger.log('offer message: ', result.data);

          await handleOffer(result.data);
          break;

        case 'answer':
          logger.log('answer message: ', result.data);

          await handleAnswer(result.data);
          break;

        case 'candidate':
          logger.log('candidate message: ', result.data);

          await handleCandidate(result.data);
          break;
      }
    });

    socket.current.on('connect', () => {
      // 填写完用户名和房间号后，发送消息给信令
      sendMessage({
        type: 'start-call',
        data: roomRef.current,
      });
    });
  };

  useEffect(() => {
    meetingStatusRef.current = meetingStatus;
  }, [meetingStatus]);

  useEffect(() => {
    if (msgEleRef.current) {
      msgEleRef.current.scrollTop = msgEleRef.current.scrollHeight;
    }
  }, [msgList]);

  /**
   * 处理用户列表数据
   *
   * 变动来源：当前用户加入会议、远端有人出/入会
   */
  const handleUsers = async (data: any) => {
    const userList = data.users;
    const userLen = userList.length;
    const lastUser = userList[userLen - 1];
    const { username } = localInfoRef.current;

    updateUserListRef(userList);

    // 最后一位是自己，则说明是自己入会成功
    if (lastUser.username === username) {
      // 非第一次加入会议
      if (!isInitLocalStream.current) {
        // 当前用户加入会议
        await localJoinMeeting();
      }
    }
    //  else {
    //   // 远端新用户加入会议
    //   remoteJoinMeeting(lastUser.username);
    // }

    // 创建LayoutList数据，用来渲染用户信息和画面
    createLayout();
    setMeetingStatus(userList.length > 0 ? MS.meeting : MS.login);
  };

  const updateUserListRef = (userList: any) => {
    logger.log('更新userList cache数据');

    const userLen = userList.length;

    for (let i = 0; i < userLen; i++) {
      const item = userList[i];
      const { username: currentUserName } = item;
      const currentUser = userListRef.current[currentUserName];

      if (!currentUser) {
        userListRef.current[currentUserName] = {
          ...item,
          stream: null,
          isDeal: true,
        };
      } else {
        currentUser.isDeal = true;
        userListRef.current[currentUserName] = currentUser;
      }
    }

    for (let username in userListRef.current) {
      const item = userListRef.current[username];

      if (item && !item.isDeal) {
        const { stream, streamInstance } = streamMap.current[username] || {};

        // 清理退会成员stream/peer资源
        if (stream && streamInstance) {
          streamInstance.destroyStream();
        }

        delete streamMap.current[username];
        delete peerMap.current[username];
        delete userListRef.current[username];
      } else {
        const stream = streamMap.current[username]?.stream || {};
        userListRef.current[username] = { ...item, isDeal: false, stream };
      }
    }

    logger.log('userListRef.current: ', userListRef.current);
  };

  const remoteJoinMeeting = (username: any) => {
    logger.log('新用户加入会议2');
    const { peer } = peerMap.current[username] || {};

    if (!peer) {
      logger.log('创建remote peer and track3');
      // 否则，是远端新用户加入会议，创建Peer通道，等待P2P连接
      createPeer(username);
      addTrack(peerMap.current[username], false);
    }
  };

  const localJoinMeeting = async () => {
    logger.log('当前用户加入会议');

    try {
      // 创建本地画面
      await initLocalStream();
      // 基于用户列表数据，处理本地采集视频流、创建P2P通道
      await createPeerConnections();
      // 当前用户加入会议，向所有远端用户peer通道上添加local stream数据
      addStreams();
      // 当前用户加入会议，向所有远端用户发送offer数据，进行ice连接
      await sendOffers();

      isInitLocalStream.current = true;
    } catch (err) {
      logger.log('加入会议失败，无法采集视频流: ', err);
    }
  };

  const handleCandidate = async (msg: any) => {
    const { candidate, callName } = msg;
    const { peer } = peerMap.current[callName] || {};

    logger.log('remote candidate: ', {
      msg,
      peer,
    });

    logger.log('candidate: ', candidate);

    try {
      await peer?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      logger.log('peer add ice candidate error: ', err);
    }
  };

  const handleAnswer = async (msg: any) => {
    const { answer, callName } = msg;
    const { peer } = peerMap.current[callName] || {};

    logger.log('remote answer: ', {
      msg,
      peer,
    });

    try {
      await peer?.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      logger.log('handle answer error: ', err);
    }
  };

  const handleOffer = async (msg: any) => {
    logger.log('handl offer 1');

    const { offer, callName, connectedName } = msg;
    let peerInstance: any;
    let { peer } = peerMap.current[callName] || {};

    peerInstance = peer;

    if (!peerInstance) {
      remoteJoinMeeting(callName);

      peerInstance = peerMap.current[callName].peer;
    }

    logger.log('handle offer msg: ', msg);
    logger.log('handle peer: ', peerInstance);

    try {
      await peerInstance?.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      logger.log('set remote desc succ');
    } catch (err) {
      logger.log('handle offer error: ', err);
    }

    try {
      // Create an answer to an offer
      const answer = await peerInstance?.createAnswer();

      logger.log('created answer sdp: ', answer);

      await peerInstance.setLocalDescription(answer);

      sendMessage({
        type: 'answer',
        data: {
          answer,
          connectedName: callName,
        },
      });
    } catch (error: any) {
      logger.log('creating an answer error: ', error);
    }
  };

  // 呼叫会议状态
  const handleCallState = (result: any) => {
    const { code, msg } = result;

    // 房间已存在此用户
    if (code === 300) {
      message.info(msg);
    }
  };

  const sendOffers = async () => {
    const userList = userListRef.current;
    const { username } = roomRef.current;

    for (let name in userList) {
      if (name !== username) {
        // 新增远端用户，需要初始化PeerConnection
        logger.log('is Remote, send offer...');

        await sendOffer(name);
      }
    }
  };

  const sendOffer = async (name: any) => {
    const { peer } = peerMap.current[name] || {};

    logger.log('send offer: ', {
      peer,
      name,
    });

    try {
      const offer = await peer?.createOffer();

      logger.log('create offer: ', offer);

      peer.setLocalDescription(offer);
      sendMessage({
        type: 'offer',
        data: {
          offer: offer,
          connectedName: name,
        },
      });
      logger.log('send offer success');
    } catch (err: any) {
      logger.log('create offer error: ', err);
    }
  };

  /**
   * 向peer通道添加stream track数据
   */
  const addTrack = (peerInstance: any, isOffer: boolean) => {
    const { username } = localInfoRef.current;
    const localStream = streamMap.current[username].stream.mediaStream;

    logger.log('add tracks to peer: ', peerInstance);

    if (localStream) {
      localStream.getTracks().forEach((track: any) => {
        if (isOffer) {
          logger.log('trans....');
          peerInstance.peer.addTransceiver(track, {
            streams: [localStream],
            direction: 'sendrecv',
            sendEncodings: [
              {
                maxFramerate: 30,
                maxBitrate: 2000 * 1e3,
              },
            ],
          });
        } else {
          logger.log('addtrack....');
          peerInstance.peer.addTrack(track, localStream);
        }
      });
    }
  };

  const addStreams = () => {
    for (let peer in peerMap.current) {
      addTrack(peerMap.current[peer], true);
    }
  };

  const createPeerConnections = async () => {
    const userList = userListRef.current;
    const { username } = roomRef.current;

    for (let name in userList) {
      const { peer } = peerMap.current[name] || {};

      // 没有创建Peer通道
      if (name !== username && !peer) {
        // 新增远端用户，需要初始化PeerConnection
        logger.log('is Remote, connection peer...');

        createPeer(name);
      }
    }
  };

  const createPeer = (username: any) => {
    logger.log('CONFIGURATION: ', CONFIGURATION);
    const peer = new RTCPeerConnection(CONFIGURATION);
    const channal = peer.createDataChannel('sendChannel');

    logger.log('create peerconnection start');

    peerMap.current[username] = { peer, channal };

    channal.onopen = () => {
      channelRef.current = true;
      logger.log('datachannel open');
    };

    channal.onclose = () => {
      logger.log('datachannel closed');
    };

    peer.oniceconnectionstatechange = (event) => {
      // @ts-ignore
      const state = event?.target?.iceConnectionState;

      logger.log('ice state change: ', state);
    };

    peer.onicecandidateerror = (event) => {
      logger.log('ice candidate error: ', event);
    };

    peer.ontrack = (event) => {
      logger.log('track event: ', event);

      const mediaStream = event.streams[0];
      const streamInstance = new Stream();

      streamInstance.setStream(mediaStream);

      streamMap.current[username] = {
        stream: streamInstance.getStream(),
        streamInstance,
      };

      createLayout();
    };

    peer.onicecandidate = (event) => {
      logger.log('ice event: ', event);

      if (event.candidate) {
        sendMessage({
          type: 'candidate',
          data: {
            candidate: event.candidate,
            connectedName: username,
          },
        });
      }
    };

    peer.onconnectionstatechange = (event) => {
      logger.log('peerConnection connect status: ', peer.connectionState);
      logger.log('conect peer: ', peer);
    };

    createIMByDatachannel(peer);

    logger.log('创建peer通道成功: ', {
      peer,
      username,
    });
  };

  const onIMMessage = (event: any) => {
    logger.log('im message event: ', event);

    const data = JSON.parse(event.data);

    updateMsgList(data);
  };

  const updateMsgList = (data: any) => {
    msgRef.current.push(data);

    setMsgList(JSON.parse(JSON.stringify(msgRef.current)));
  };

  const createIMByDatachannel = (peer: any) => {
    peer.ondatachannel = (event: any) => {
      const receiveChannel = event.channel;

      receiveChannel.onmessage = onIMMessage;
      receiveChannel.onopen = (event: any) => {
        logger.log('im open event: ', event);
      };
      receiveChannel.onclose = (event: any) => {
        logger.log('im close event: ', event);
      };
    };
  };

  const initLocalStream = async () => {
    const { username, video, audio } = localInfoRef.current;
    const localStream = streamMap.current[username];

    if (localStream) {
      return;
    }
    logger.log('init local stream: ', username);

    const streamInstance = new Stream();

    // 采集音/视频流
    await streamInstance.initStream({ video, audio });

    streamMap.current[username] = {
      stream: streamInstance.getStream(),
      streamInstance,
    };

    logger.log('streamMap.current: ', streamMap.current);
  };

  const createLayout = () => {
    const layouts = [];
    const { username: localName } = localInfoRef.current;

    for (let username in userListRef.current) {
      const user = userListRef.current[username];
      const stream = streamMap.current[username]?.stream || {};
      const streamId = stream ? stream.id : 0;
      const isLocal = localName === username;
      const nextUser = {
        ...user,
        stream,
        id: `${username}_${streamId}`,
        isLocal,
      };

      layouts.push(nextUser);
    }

    logger.log('layouts: ', layouts);
    setLayoutList(layouts);
  };

  // 加入房间
  const onCallMeeting = async (values: any) => {
    logger.log('join room:', values);

    const val = {
      ...values,
      video: true,
      audio: false,
    };

    // 缓存入会信息
    roomRef.current = val;
    // 更新Local本地数据
    localInfoRef.current = {
      ...localInfoRef.current,
      ...val,
      username: values.username,
    };

    initWSS();
  };

  // 发送wss消息
  const sendMessage = (msg: any) => {
    const { data } = msg;
    const { meetingId, username } = roomRef.current;

    // 扩展参数，携带meetingId信息
    msg.data = {
      ...data,
      meetingId,
      callName: username,
    };

    logger.log('send message: ', msg);
    socket.current.send(JSON.stringify(msg));
  };

  const onSendMessage = (e: any) => {
    logger.log('finish e: ', e);

    if (e.msg) {
      const { username } = localInfoRef.current;
      const msg = {
        type: 'text',
        msg: e.msg,
        sender: username,
        id: new Date().valueOf(),
      };

      for (let username in peerMap.current) {
        const { channal } = peerMap.current[username];

        if (channelRef.current) {
          updateMsgList(msg);
          channal.send(JSON.stringify(msg));
        } else {
          message.info('Data Channel Not Opened');
        }
      }
    }

    imForm.resetFields();
  };

  /**
   * 挂断会议
   */
  const endCall = () => {
    channelRef.current = false;
    socket.current.disconnect();

    for (let key in streamMap.current) {
      const stream = streamMap.current[key];

      logger.log('close stream: ', streamMap.current[key]);

      stream.streamInstance.destroyStream();
    }

    peerMap.current = {};
    streamMap.current = {};
    localInfoRef.current = {};
    msgRef.current = [];
    roomRef.current = {};
    userListRef.current = {};
    isInitLocalStream.current = false;
    setMeetingStatus(MS.login);
    setLayoutList([]);
    setMsgList([]);
  };

  const inRoom = meetingStatus === MS.meeting;

  const renderCall = () => {
    if (inRoom) {
      return null;
    }

    return (
      <div className="call">
        <div className="form">
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onCallMeeting}
          >
            <Form.Item
              label="用户名"
              name="username"
              initialValue={userInfo.name}
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="房间号"
              name="meetingId"
              initialValue="123"
              rules={[
                {
                  required: true,
                  message: 'Please input your meetingId!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                加入会议
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  };

  const renderMeeting = () => {
    if (!inRoom) {
      return null;
    }

    const layout = layoutList.map((val: any) => (
      <Video item={val} key={val.username} />
    ));

    return (
      <div className="layout">
        <div className="users">
          <div className="video-box">{layout}</div>
          <div className="im-box">
            <div className="message" ref={msgEleRef}>
              <ul>
                {msgList.map((item: any) => {
                  const isSelf = localInfoRef.current.username === item.sender;

                  return (
                    <li
                      key={item.id}
                      className={isSelf ? 'msg reverse' : 'msg'}
                    >
                      <div className="name">{item.sender}</div>
                      <div>{item.msg}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="input">
              <Form layout="inline" form={imForm} onFinish={onSendMessage}>
                <Form.Item name="msg" className="im-input">
                  <Input />
                </Form.Item>

                <Form.Item className="im-btn">
                  <Button type="primary" htmlType="submit">
                    发送
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
        <div className="operate">
          <Button type="primary" onClick={endCall}>
            挂断会议
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="app video-call content">
      {/* 头部内容 */}
      <Header title={'视频聊天'}></Header>

      {/* 聊天内容 */}
      <div className="im-content">
        {renderCall()}
        {renderMeeting()}
      </div>
    </div>
  );
};
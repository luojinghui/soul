import Emmitter from './emmitter';
import { Socket, io } from 'socket.io-client';
import logger from '@/utils/log';
import { MS, CONFIGURATION } from '@/enum';
import Stream from './stream';
import { callConfig, Config, Resolution } from './type';

const defaultConfig = {
  server: '',
  socketOption: {},
};

export default class Client extends Emmitter {
  private config: Config;
  private socket: Socket | null;
  private callConfig: callConfig;
  private userMap: Map<string, any>;
  private streamMap: any;
  private peerMap: any;
  private isInitLocalStream: boolean;
  private isChannelOk: boolean;
  private msgList: any[];

  constructor(config: Config) {
    super();

    this.config = Object.assign({}, defaultConfig, config);
    this.socket = null;
    this.callConfig = {
      video: false,
      audio: false,
      username: '',
      meetingId: '',
      policy: 'all',
      resolution: '720',
    };
    this.msgList = [];
    this.userMap = new Map();
    this.streamMap = {};
    this.peerMap = {};
    this.isInitLocalStream = false;
    this.isChannelOk = false;
    this.init();
  }

  /**
   * init client
   */
  public init() {
    logger.importantLog('Version: 1.0.0');
  }

  public join(callConfig: callConfig) {
    const { server, socketOption } = this.config;
    this.callConfig = callConfig;

    logger.log('join callconfig: ', this.callConfig);

    // 连接信令服务器
    this.socket = io(server, socketOption);

    this.socket.on('message', async (msg: any) => {
      const result = JSON.parse(msg);

      logger.log('io receive: ', result);

      switch (result.type) {
        case 'call-state':
          this.handleCallState(result);

          break;
        case 'users':
          logger.log('users message: ', result.data);

          this.handleUsers(result.data);
          break;

        case 'offer':
          logger.log('offer message: ', result.data);

          await this.handleOffer(result.data);
          break;

        case 'answer':
          logger.log('answer message: ', result.data);

          await this.handleAnswer(result.data);
          break;

        case 'candidate':
          logger.log('candidate message: ', result.data);

          await this.handleCandidate(result.data);
          break;
      }
    });

    this.socket.on('connect', () => {
      // 填写完用户名和房间号后，发送消息给信令
      this.sendMessage({
        type: 'start-call',
        data: this.callConfig,
      });
    });
  }

  private async handleCandidate(msg: any) {
    const { candidate, callName } = msg;
    const { peer } = this.peerMap[callName] || {};

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
  }

  private async handleAnswer(msg: any) {
    const { answer, callName } = msg;
    const { peer } = this.peerMap[callName] || {};

    logger.log('remote answer: ', {
      msg,
      peer,
    });

    try {
      await peer?.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      logger.log('handle answer error: ', err);
    }
  }

  private async handleOffer(msg: any) {
    logger.log('handl offer 1');

    const { offer, callName, connectedName } = msg;
    let peerInstance: any;
    let { peer } = this.peerMap[callName] || {};

    peerInstance = peer;

    if (!peerInstance) {
      this.remoteJoinMeeting(callName);

      peerInstance = this.peerMap[callName].peer;
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

      this.sendMessage({
        type: 'answer',
        data: {
          answer,
          connectedName: callName,
        },
      });
    } catch (error: any) {
      logger.log('creating an answer error: ', error);
    }
  }

  private remoteJoinMeeting(username: any) {
    logger.log('新用户加入会议2');
    const { peer } = this.peerMap[username] || {};

    if (!peer) {
      logger.log('创建remote peer and track3');
      // 否则，是远端新用户加入会议，创建Peer通道，等待P2P连接
      this.createPeer(username);
      this.addTrack(this.peerMap[username], false);
    }
  }

  /**
   * 处理用户列表数据
   *
   * 变动来源：当前用户加入会议、远端有人出/入会
   */
  private async handleUsers(data: any) {
    const userList = data.users;
    const userLen = userList.length;
    const lastUser = userList[userLen - 1];
    const { username } = this.callConfig;

    this.updateUserListRef(userList);

    // 最后一位是自己，则说明是自己入会成功
    if (lastUser.username === username) {
      // 非第一次加入会议
      if (!this.isInitLocalStream) {
        // 当前用户加入会议
        await this.localJoinMeeting();
      }
    }

    // 创建LayoutList数据，用来渲染用户信息和画面
    this.emmit('call-state', {
      code: userList.length > 0 ? MS[200].code : MS[301].code,
      msg: userList.length > 0 ? MS[200].msg : MS[301].msg,
      data: null,
    });

    this.createLayout();
  }

  private async localJoinMeeting() {
    logger.log('当前用户加入会议');

    try {
      // 创建本地画面
      await this.initLocalStream();
      // 基于用户列表数据，处理本地采集视频流、创建P2P通道
      await this.createPeerConnections();
      // 当前用户加入会议，向所有远端用户peer通道上添加local stream数据
      this.addStreams();
      // 当前用户加入会议，向所有远端用户发送offer数据，进行ice连接
      await this.sendOffers();

      this.isInitLocalStream = true;
    } catch (err) {
      logger.log('加入会议失败，无法采集视频流: ', err);
    }
  }

  private async sendOffers() {
    const { username } = this.callConfig;
    const entries = this.userMap.entries();

    // @ts-ignore
    for (let [key] of entries) {
      if (key !== username) {
        // 新增远端用户，需要初始化PeerConnection
        logger.log('is Remote, send offer...');

        await this.sendOffer(key);
      }
    }
  }

  private async sendOffer(name: any) {
    const { peer } = this.peerMap[name] || {};

    logger.log('send offer: ', {
      peer,
      name,
    });

    try {
      const offer = await peer?.createOffer();

      logger.log('create offer: ', offer);

      peer.setLocalDescription(offer);
      this.sendMessage({
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
  }

  private addStreams() {
    for (let peer in this.peerMap) {
      this.addTrack(this.peerMap[peer], true);
    }
  }

  /**
   * 向peer通道添加stream track数据
   */
  private addTrack(peerInstance: any, isOffer: boolean) {
    const { username } = this.callConfig;
    const localStream = this.streamMap[username].stream.mediaStream;

    logger.log('add tracks to peer: ', peerInstance);

    if (localStream) {
      localStream.getTracks().forEach((track: any) => {
        if (isOffer) {
          logger.log('trans....');
          const transceiver = peerInstance.peer.addTransceiver(track, {
            streams: [localStream],
            direction: 'sendrecv',
            sendEncodings: [
              {
                maxFramerate: 30,
                maxBitrate: 1000 * 1e3,
              },
            ],
          });

          this.peerMap[peerInstance.username].transceiver = transceiver;
        } else {
          logger.log('addtrack....');
          const sender = peerInstance.peer.addTrack(track, localStream);

          this.peerMap[peerInstance.username].sender = sender;
        }
      });

      logger.log('peerInstance: ', this.peerMap[peerInstance.username]);
    }
  }

  private async createPeerConnections() {
    const { username } = this.callConfig;

    this.userMap.forEach((val, key) => {
      const { peer } = this.peerMap[key] || {};

      // 没有创建Peer通道
      if (key !== username && !peer) {
        // 新增远端用户，需要初始化PeerConnection
        logger.log('is Remote, connection peer: ', key);

        this.createPeer(key);
      }
    });
  }

  private createPeer(username: string) {
    const mergeConfig = Object.assign({}, CONFIGURATION, {
      iceTransportPolicy: this.callConfig.policy,
    });
    logger.log('peer mergeConfig: ', mergeConfig);
    const peer = new RTCPeerConnection(mergeConfig);
    const channal = peer.createDataChannel('sendChannel');

    logger.log('create peerconnection start');

    this.peerMap[username] = {
      username,
      peer,
      channal,
      transceiver: null,
      sender: null,
    };

    channal.onopen = () => {
      this.isChannelOk = true;
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

      this.streamMap[username] = {
        stream: streamInstance.getStream(),
        streamInstance,
      };

      this.createLayout();
    };

    peer.onicecandidate = (event) => {
      logger.log('ice event: ', event);

      if (event.candidate) {
        this.sendMessage({
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

    peer.ondatachannel = (event: any) => {
      const receiveChannel = event.channel;

      receiveChannel.onmessage = this.onIMMessage;

      receiveChannel.onopen = (event: any) => {
        logger.log('im open event: ', event);
      };

      receiveChannel.onclose = (event: any) => {
        logger.log('im close event: ', event);
      };
    };

    logger.log('创建peer通道成功: ', {
      peer,
      username,
    });
  }

  private createLayout() {
    const layouts: any = [];
    const { username: localName } = this.callConfig;

    this.userMap.forEach((user, username) => {
      const stream = this.streamMap[username]?.stream || {};
      const streamId = stream ? stream.id : 0;
      const isLocal = localName === username;
      const nextUser = {
        ...user,
        stream,
        id: `${username}_${streamId}`,
        isLocal,
      };

      layouts.push(nextUser);
    });

    logger.log('layouts: ', layouts);
    this.emmit('layout-list', { code: 200, msg: 'ok', data: layouts });
  }

  private onIMMessage(event: any) {
    logger.log('im message event: ', event);

    const data = JSON.parse(event.data);

    this.updateMsgList(data);
  }

  public updateMsgList(data: any) {
    this.msgList.push(data);

    this.emmit('chat-msg-list', {
      code: 200,
      msg: 'chat-ilst',
      data: JSON.parse(JSON.stringify(this.msgList)),
    });
  }

  private async initLocalStream() {
    const { username } = this.callConfig;
    const localStream = this.streamMap[username];

    if (localStream) {
      return;
    }
    logger.log('init local stream: ', username);

    const streamInstance = new Stream();

    // 采集音/视频流
    await streamInstance.initStream(this.callConfig);

    this.streamMap[username] = {
      stream: streamInstance.getStream(),
      streamInstance,
    };

    logger.log('streamMap.current: ', this.streamMap);
  }

  private updateUserListRef(userList: any) {
    logger.log('更新userList cache数据');

    const userLen = userList.length;

    for (let i = 0; i < userLen; i++) {
      const item = userList[i];
      const { username: currentUserName } = item;
      const currentUser = this.userMap.get(currentUserName);

      if (!currentUser) {
        this.userMap.set(currentUserName, {
          ...item,
          stream: null,
          isDeal: true,
        });
      } else {
        currentUser.isDeal = true;
        this.userMap.set(currentUserName, currentUser);
      }
    }

    this.userMap.forEach((item, username) => {
      if (item && !item.isDeal) {
        const { stream, streamInstance } = this.streamMap[username] || {};

        // 清理退会成员stream/peer资源
        if (stream && streamInstance) {
          streamInstance.destroyStream();
        }

        delete this.streamMap[username];
        delete this.peerMap[username];
        this.userMap.delete(username);
      } else {
        const stream = this.streamMap[username]?.stream || {};

        this.userMap.set(username, { ...item, isDeal: false, stream });
      }
    });

    logger.log('userListRef.current: ', this.userMap);
  }

  /**
   * 发送WSS消息
   *
   * @param msg
   */
  private sendMessage(msg: any) {
    const { data } = msg;
    const { meetingId, username } = this.callConfig;

    // 扩展参数，携带meetingId信息
    msg.data = {
      ...data,
      meetingId,
      callName: username,
    };

    logger.log('send message: ', msg);

    if (this.socket) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  /**
   * 呼叫会议状态
   *
   * @private
   * @param { any } result
   */
  private handleCallState(result: any) {
    const { code, msg } = result;

    // 房间已存在此用户
    if (code === 300) {
      this.emmit('call-state', {
        code: MS[300].code,
        msg: MS[300].msg,
        data: {},
      });
    }
  }

  public sendMsg(e: any) {
    const { username } = this.callConfig;
    const msg = {
      type: 'text',
      msg: e.msg,
      sender: username,
      id: new Date().valueOf(),
    };

    this.updateMsgList(msg);

    for (let username in this.peerMap) {
      const { channal } = this.peerMap[username];

      if (this.isChannelOk) {
        channal.send(JSON.stringify(msg));
      } else {
        logger.log('Data Channel Not Opened');
      }
    }
  }

  public async setResolution(res: Resolution) {
    try {
      const { username } = this.callConfig;
      const localStream = this.streamMap[username];
      const mediastream = localStream.stream.mediaStream;
      const streamInstance = localStream.streamInstance;
      const track = mediastream.getVideoTracks();
      const cons = streamInstance.getCons(res);

      console.log('cons: ', cons);
      await track[0].applyConstraints(cons);
    } catch (err: any) {
      console.log('apply cons erro: ', err);
    }
  }

  public setBandwidth(bandwidth: string) {
    for (let key in this.peerMap) {
      const item = this.peerMap[key];
      const { peer } = item;

      peer.getSenders().forEach((sender: any) => {
        try {
          if (sender.track.kind === 'video') {
            const params = sender.getParameters();

            params.encodings.forEach((e: any) => {
              e.maxBitrate = +bandwidth * 1e3;
            });

            console.log('params ======>: ', params);

            sender.setParameters(params);
          }
        } catch (err: any) {
          console.log('set params err: ', err);
        }
      });
    }
  }

  public endCall() {
    if (this.socket) {
      this.socket.disconnect();
    }

    for (let key in this.streamMap) {
      const stream = this.streamMap[key];

      logger.log('close stream: ', this.streamMap[key]);

      stream.streamInstance.destroyStream();
    }

    this.socket = null;
    this.callConfig = {
      video: false,
      audio: false,
      username: '',
      meetingId: '',
      policy: 'all',
      resolution: '720',
    };
    this.msgList = [];
    this.userMap = new Map();
    this.streamMap = {};
    this.peerMap = {};
    this.isInitLocalStream = false;
    this.isChannelOk = false;
  }
}

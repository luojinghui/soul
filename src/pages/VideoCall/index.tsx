import { useEffect, useRef, useState } from 'react';
import { Button, Input, Form, message, Radio } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { MS, imServer } from '@/enum';
import Video from './video';
import Audio from './audio';
import { Header } from '@/components';
import { useRecoilValue } from 'recoil';
import { userInfoState } from '@/store';
import logger from '@/utils/log';
import { platform } from '@/utils/browser';

import './index.less';

import Client from './client';
import { ClientEvent, callConfig } from './type';

const browser = platform();

export const VideoCall = () => {
  const client = useRef<Client>();
  const roomRef = useRef<any>({ username: '', meetingId: 0 });
  const msgEleRef = useRef<any>(null);

  const userInfo = useRecoilValue(userInfoState);
  const [imForm] = Form.useForm();

  // 当前用户信息
  const [layoutList, setLayoutList] = useState<any>([]);
  const [audioList, setAudioList] = useState<any>([]);
  const [msgList, setMsgList] = useState([]);
  // 当前呼叫状态,login/meeting
  const [meetingStatus, setMeetingStatus] = useState(MS[301].code);
  const [showIM, setShowIM] = useState(false);
  const [debug, setDebug] = useState(false);
  const [mic, setMic] = useState(true);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const initWSS = () => {
    client.current = new Client({
      server: imServer,
      socketOption: {
        path: '/video',
      },
    });

    client.current.on('call-state', (e: ClientEvent) => {
      const { code, data, msg } = e;

      if (code === MS[300].code) {
        message.info(msg);
      } else if (code === MS[301].code) {
        setMeetingStatus(MS[301].code);
      } else if (code === MS[200].code) {
        setMeetingStatus(MS[200].code);
      }
    });

    client.current.on('chat-msg-list', (e: ClientEvent) => {
      setMsgList(e.data);
    });

    client.current.on('layout-list', (e: ClientEvent) => {
      setLayoutList(e.data);
    });

    client.current.on('audio-list', (e: ClientEvent) => {
      setAudioList(e.data);
    });

    client.current.join(roomRef.current);
  };

  useEffect(() => {
    if (msgEleRef.current) {
      msgEleRef.current.scrollTop = msgEleRef.current.scrollHeight;
    }
  }, [msgList]);

  // 加入房间
  const onCallMeeting = async (values: callConfig) => {
    const val = { ...values, video: true, audio: true };
    // 缓存入会信息
    roomRef.current = val;

    logger.log('roomRef.current: ', roomRef.current);

    initWSS();
  };

  const onSendMessage = (e: any) => {
    logger.log('finish e: ', e);

    if (client.current && e.msg) {
      client.current.sendMsg(e);
    }

    imForm.resetFields();
  };

  /**
   * 挂断会议
   */
  const endCall = () => {
    client.current?.endCall();

    setMeetingStatus(MS[301].code);
    setLayoutList([]);
    setMsgList([]);
    setDebug(false);
  };

  const renderCall = () => {
    if (meetingStatus === MS[200].code) {
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
              rules={[
                {
                  required: true,
                  message: 'Please input your meetingId!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="resolution" label="分辨率" initialValue="360">
              <Radio.Group>
                <Radio value="720">720</Radio>
                <Radio value="360">360</Radio>
                <Radio value="180">180</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="policy" label="协商" initialValue="all">
              <Radio.Group>
                <Radio value="all">智能</Radio>
                <Radio value="relay">中继</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="codec" label="编解码器" initialValue="all">
              <Radio.Group>
                <Radio value="all">智能</Radio>
                <Radio value="h264">H264</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              className="join-btn"
              wrapperCol={{ offset: 8, span: 16 }}
            >
              <Button type="primary" htmlType="submit">
                加入房间
              </Button>
            </Form.Item>
          </Form>

          <div className="join-tips">提示：请允许授权浏览器摄像头权限</div>
        </div>
      </div>
    );
  };

  const onToggleIM = () => {
    setShowIM(!showIM);
  };

  const toggleDebug = () => {
    setDebug(!debug);
  };

  const onSwitchResolution = async (e: any) => {
    const value = e.target.value;

    if (value) {
      await client.current?.setResolution(value);
    }
  };

  const onSwitchBandwidth = (e: any) => {
    const value = e.target.value;

    if (value && client.current) {
      client.current.setBandwidth(value);
    }
  };

  const toggleMic = () => {
    setMic(!mic);

    if (client.current) {
      client.current.switchMic(!mic);
    }
  };

  const playVideos = () => {
    console.log('layoutList: ', layoutList);

    layoutList.forEach((item: any) => {
      const videoEle = document.getElementById(item.id) as HTMLVideoElement;

      if (videoEle) {
        videoEle
          .play()
          .then(() => {
            console.log('video play success');
          })
          .catch((err) => {
            console.log('video play failed: ', err);
          });
      }
    });
  };

  const renderMeeting = () => {
    if (!(meetingStatus === MS[200].code)) {
      return null;
    }

    const layout = layoutList.map((val: any) => {
      return <Video item={val} debug={debug} key={val.username} />;
    });

    const audios = audioList.map((val: any) => {
      return <Audio key={val.id} item={val} streamId={val.id} />;
    });

    return (
      <div className="layout">
        <div className="video-box">{layout}</div>

        <div className="audio-box">{audios}</div>

        <div className="operate">
          <Button type="primary" className="btn" onClick={toggleDebug}>
            Debug
          </Button>
          {browser.isSafari && (
            <Button type="primary" className="btn" onClick={playVideos}>
              播放
            </Button>
          )}
          <Button type="primary" className="btn" onClick={toggleMic}>
            {mic ? '关闭麦克风' : '开启麦克风'}
          </Button>
          <Button type="primary" className="btn" onClick={endCall}>
            挂断
          </Button>
        </div>
        <div className="operate">
          <span>分辨率: </span>
          <Radio.Group
            defaultValue={roomRef.current.resolution}
            onChange={onSwitchResolution}
          >
            <Radio value="720">720</Radio>
            <Radio value="360">360</Radio>
            <Radio value="180">180</Radio>
          </Radio.Group>
        </div>

        <div className="operate">
          <span>带宽: </span>
          <Radio.Group onChange={onSwitchBandwidth}>
            <Radio value="200">200</Radio>
            <Radio value="500">500</Radio>
            <Radio value="1000">1000</Radio>
            <Radio value="1500">1500</Radio>
            <Radio value="2000">2000</Radio>
          </Radio.Group>
        </div>

        <div className={`im-box ${showIM ? 'im-show' : 'im-hidden'}`}>
          <div className="toggle" onClick={onToggleIM}>
            {showIM ? <RightOutlined /> : <LeftOutlined />}
          </div>
          <div className="message" ref={msgEleRef}>
            <ul>
              {msgList.map((item: any) => {
                const isSelf = roomRef.current.username === item.sender;

                return (
                  <li key={item.id} className={isSelf ? 'msg reverse' : 'msg'}>
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

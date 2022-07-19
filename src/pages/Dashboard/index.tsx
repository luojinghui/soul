import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  MusicInfo,
  MusicBarPosition,
  MusicBarVisible,
  MusicBarMiniMode,
} from '@/store';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import Draggable from 'react-draggable';
import { message } from 'antd';

import './index.less';

export default function Dashboard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef(null);
  const countRef = useRef(0);

  const [pauseState, setPause] = useState(true);
  const [isDrag, setIsDrag] = useState(false);
  const [miniMode, setMiniMode] = useRecoilState(MusicBarMiniMode);
  const [visible, setMusicBarVisible] = useRecoilState(MusicBarVisible);
  const [musicInfo] = useRecoilState(MusicInfo);
  const [position, setPosition] = useRecoilState(MusicBarPosition);

  useEffect(() => {
    if (musicInfo.url) {
      console.log('music info: ', musicInfo);

      play();
    }
  }, [musicInfo]);

  useEffect(() => {
    window.addEventListener('resize', resizePage);

    return () => {
      window.removeEventListener('resize', resizePage);
    };
  }, [visible, position]);

  useEffect(() => {
    resizePage();
  }, [visible, musicInfo, miniMode]);

  const resizePage = () => {
    if (visible && musicInfo.url) {
      const positionObj = getMusicBarPosition({
        x: position.x,
        node: playerRef.current,
        y: position.y,
      });

      setPosition(positionObj);
    }
  };

  const onClose = async () => {
    console.log('close music');

    await pause();

    setMusicBarVisible(false);
  };

  const handleStart = (e: any) => {};

  const handleDrag = (e: any) => {
    setIsDrag(true);
    countRef.current += 1;
  };

  const getMusicBarPosition = (data: any) => {
    const bodyWidth = document.body.clientWidth;
    const node = data.node;
    const slefBodyWidth = Math.ceil(bodyWidth / 2);
    const slftNodeWidth = Math.ceil(node.clientWidth / 2);
    const offsetX = data.x + slftNodeWidth;
    let x = 0;
    let left = true;

    if (slefBodyWidth < offsetX) {
      x = bodyWidth - node.clientWidth;
      left = false;
    }

    return {
      x,
      y: data.y,
      left,
    };
  };

  const getDataType = (node: any): string => {
    if (node && !node.getAttribute) {
      return '';
    }

    const classNames = node.getAttribute('class') || '';

    if (classNames && classNames.includes('player_operate')) {
      return '';
    }

    if (!classNames || !classNames.includes('event')) {
      return getDataType(node.parentNode);
    }

    if (classNames.includes('event')) {
      return node.getAttribute('data-type');
    }

    return '';
  };

  const handleStop = (e: any, data: any) => {
    setIsDrag(false);

    if (!countRef.current) {
      const type = getDataType(e.target);

      if (type) {
        // @ts-ignore
        const event = eventMap[type];

        console.log('type: ', type);

        if (event) {
          event();
        }
      }
    } else {
      const positionObj = getMusicBarPosition(data);

      setPosition(positionObj);
    }

    countRef.current = 0;
  };

  const toggleMode = () => {
    setMiniMode(!miniMode);
  };

  const onError = () => {
    if (musicInfo.url) {
      message.info('播放失败，切换别的歌曲吧');

      setPause(true);
    }
  };

  const play = async () => {
    console.log('play music');

    try {
      if (audioRef.current) {
        await audioRef.current.play();
      }
    } catch (err) {
      console.log('play err: ', err);
    }
  };

  const pause = async () => {
    console.log('pause music');

    if (audioRef.current && !audioRef.current.paused) {
      try {
        await audioRef.current.pause();
      } catch (err) {
        console.log('pause err: ', err);
      }
    }
  };

  const onPause = () => {
    setPause(true);
  };

  const onPlay = () => {
    setPause(false);
  };

  const eventMap = {
    play: play,
    pause: pause,
    close: onClose,
    toggle: toggleMode,
  };

  const playerClassName = useMemo(() => {
    const playStateClass = visible ? 'soul_player_show' : 'soul_player_hidden';
    const playerBorderClass = position.left ? 'left' : 'right';

    return `${playStateClass} ${playerBorderClass}`;
  }, [musicInfo, position, visible]);

  const toggleClassName = useMemo(() => {
    let className = '';

    if (position.left) {
      className = miniMode ? 'icon-xianghou' : 'icon-xiangqian';
    } else {
      className = miniMode ? 'icon-xiangqian' : 'icon-xianghou';
    }

    return className;
  }, [miniMode, position]);

  return (
    <>
      <div>
        {
          <Draggable
            bounds="#root"
            defaultClassNameDragging={isDrag ? 'soul_player_draging' : ''}
            defaultClassName={`soul_player ${playerClassName}`}
            onStart={handleStart}
            onDrag={handleDrag}
            onStop={handleStop}
            position={position}
          >
            <div ref={playerRef}>
              <div className="player_operate">
                <div className="toggle event" data-type="toggle">
                  <span
                    className={`iconfont ${toggleClassName} toggle-icon`}
                  ></span>
                </div>

                <div
                  className={`cover mr ${
                    miniMode ? 'soul_player_hidden' : 'soul_player_show_flex'
                  }`}
                >
                  <img
                    draggable={false}
                    className={pauseState ? 'rotate-pause' : ''}
                    src={musicInfo.cover}
                    alt=""
                  />
                </div>

                <div
                  className={`title mr ${
                    miniMode ? 'soul_player_hidden' : 'soul_player_show_flex'
                  }`}
                >
                  <span className="song">{musicInfo.song}</span>
                  <span className="sing">{musicInfo.sing}</span>
                </div>

                {pauseState ? (
                  <PlayCircleFilled className="btn event mr" data-type="play" />
                ) : (
                  <PauseCircleFilled
                    className="btn event mr"
                    data-type="pause"
                  />
                )}

                <CloseOutlined className="btn event close" data-type="close" />
              </div>

              <audio
                onPause={onPause}
                onPlay={onPlay}
                onError={onError}
                src={musicInfo.url}
                controls={false}
                ref={audioRef}
              />
            </div>
          </Draggable>
        }
      </div>

      <Outlet />
    </>
  );
}

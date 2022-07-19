import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { MusicInfo, MusicBarPosition, MusicBarVisible } from '@/store';
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
    if (visible) {
      const positionObj = getMusicBarPosition({
        x: document.body.clientWidth,
        node: playerRef.current,
        y: 160,
      });

      setPosition(positionObj);
    }
  }, [visible]);

  const resizePage = () => {
    if (visible) {
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

    if (!classNames || !classNames.includes('btn')) {
      return getDataType(node.parentNode);
    }

    if (classNames.includes('btn')) {
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
  };

  const playerClassName = useMemo(() => {
    const playStateClass = visible ? 'soul_player_show' : 'soul_player_hidden';
    const playerBorderClass = position.left ? 'left' : 'right';

    return `${playStateClass} ${playerBorderClass}`;
  }, [musicInfo, position, visible]);

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
                {pauseState ? (
                  <PlayCircleFilled className="btn mr" data-type="play" />
                ) : (
                  <PauseCircleFilled className="btn mr" data-type="pause" />
                )}

                <CloseOutlined className="btn close" data-type="close" />
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

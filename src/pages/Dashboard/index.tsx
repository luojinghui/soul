import { useEffect, useState, useRef, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  MusicInfo,
  MusicBarPosition,
  MusicBarVisible,
  MusicBarMiniMode,
  MusicBarMagneticLeft,
} from '@/store';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDrag } from '@use-gesture/react';

import './index.less';

export default function Dashboard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef(null);
  const playerOuterRef = useRef(null);
  const musicTitleRef = useRef(null);
  const playerDragingRef = useRef(false);

  const navigate = useNavigate();

  const [pauseState, setPause] = useState(true);
  const [isDrag, setIsDrag] = useState(false);
  const [miniMode, setMiniMode] = useRecoilState(MusicBarMiniMode);
  const [visible, setMusicBarVisible] = useRecoilState(MusicBarVisible);
  const [musicInfo] = useRecoilState(MusicInfo);
  const [position, setPosition] = useRecoilState(MusicBarPosition);
  const [magneticLeft, setMagneticLeft] = useRecoilState(MusicBarMagneticLeft);

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
      const { x = 0, y = 0 }: any = getMusicBarPosition({
        left: magneticLeft,
        nextX: position.x,
        nextY: position.y,
      });

      setPosition({ x, y });
    }
  };

  const bind = useDrag(
    (state) => {
      let nextX = state.offset[0];
      let nextY = state.offset[1];
      let left = true;

      if (!playerDragingRef.current) {
        setIsDrag(true);
      }

      playerDragingRef.current = true;

      if (state.last) {
        const data: any = getMusicBarPosition({ nextX, nextY });
        nextX = data.x;
        nextY = data.y;
        left = data.left;

        playerDragingRef.current = false;
        setIsDrag(false);
        setMagneticLeft(left);

        if (musicTitleRef.current) {
          // @ts-ignore
          musicTitleRef.current.style.marginRight = '7px';
          setTimeout(() => {
            // @ts-ignore
            musicTitleRef.current.style.marginRight = '6px';
          }, 20);
        }
      }

      setPosition({ x: nextX, y: nextY });
    },
    {
      axis: undefined,
      pointer: {
        touch: true,
      },
      filterTaps: true,
      bounds: playerOuterRef,
      from: () => [position.x, position.y],
    }
  );

  const onClose = async () => {
    console.log('close music');

    await pause();

    setMusicBarVisible(false);
  };

  const getMusicBarPosition = (data: any) => {
    let { nextX, nextY, left = 'unset' } = data;

    const boundary: any = playerOuterRef.current;
    const button: any = playerRef.current;

    if (!boundary || !button) return;

    const containerWidth = boundary.clientWidth;
    const selfContainerWidth = Math.ceil(containerWidth / 2);
    const playerWidth = button.clientWidth;
    const selfPlayerWidth = Math.ceil(playerWidth / 2);
    const offsetX = nextX + selfPlayerWidth;

    if (left === 'unset') {
      if (selfContainerWidth < offsetX) {
        nextX = containerWidth - playerWidth;
        left = false;
      } else {
        nextX = 0;
        left = true;
      }
    } else {
      if (left) {
        nextX = 0;
      } else {
        nextX = containerWidth - playerWidth;
      }
    }

    return {
      x: nextX,
      y: nextY,
      left,
    };
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

  const onClickCover = () => {
    navigate('music');
  };

  const playerClassName = useMemo(() => {
    const playStateClass = visible ? 'soul_player_show' : 'soul_player_hidden';
    const playerBorderClass = magneticLeft ? 'left' : 'right';
    const dragClass = isDrag ? 'soul_player_draging' : '';

    return `${dragClass} ${playStateClass} ${playerBorderClass}`;
  }, [magneticLeft, visible, isDrag]);

  const toggleClassName = useMemo(() => {
    let className = '';

    if (magneticLeft) {
      className = miniMode ? 'icon-xianghou' : 'icon-xiangqian';
    } else {
      className = miniMode ? 'icon-xiangqian' : 'icon-xianghou';
    }

    return className;
  }, [miniMode, magneticLeft]);

  return (
    <>
      <div>
        {
          <>
            <div className="soul_player_outer" ref={playerOuterRef}></div>
            <div
              {...bind()}
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
              }}
              className={`soul_player ${playerClassName}`}
              ref={playerRef}
            >
              <div className="soul_player_content">
                <div className="player_operate">
                  <div
                    className="toggle event"
                    data-type="toggle"
                    onClick={toggleMode}
                  >
                    <span
                      className={`iconfont ${toggleClassName} toggle-icon`}
                    ></span>
                  </div>

                  <div
                    className={`cover mr ${
                      miniMode ? 'soul_player_hidden' : 'soul_player_show_flex'
                    }`}
                    onClick={onClickCover}
                  >
                    <img
                      draggable={false}
                      className={pauseState ? 'rotate-pause' : ''}
                      src={musicInfo.cover}
                      alt=""
                    />
                  </div>

                  <div
                    ref={musicTitleRef}
                    id="soul_music_title"
                    className={`title mr ${
                      miniMode ? 'soul_player_hidden' : 'soul_player_show_flex'
                    }`}
                  >
                    <span className="song">{musicInfo.song}</span>
                    <span className="sing">{musicInfo.sing}</span>
                  </div>

                  {pauseState ? (
                    <PlayCircleFilled
                      className="btn event mr"
                      data-type="play"
                      onClick={play}
                    />
                  ) : (
                    <PauseCircleFilled
                      className="btn event mr"
                      data-type="pause"
                      onClick={pause}
                    />
                  )}

                  <CloseOutlined
                    className="btn event close"
                    data-type="close"
                    onClick={onClose}
                  />
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
            </div>
          </>
        }
      </div>

      <Outlet />
    </>
  );
}

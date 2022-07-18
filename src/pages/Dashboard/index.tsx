import { useEffect, useState, useRef, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { MusicInfo, MusicBarPosition, MusicBarVisible } from '@/store';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import Draggable from 'react-draggable';

export default function Dashboard() {
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const countRef = useRef(0);

  const [pauseState, setPause] = useState(true);
  const [visible, setMusicBarVisible] = useRecoilState(MusicBarVisible);
  const [musicInfo] = useRecoilState(MusicInfo);
  const [position, setPosition] = useRecoilState(MusicBarPosition);

  useEffect(() => {
    if (musicInfo.url) {
      console.log('play music: ', musicInfo);

      play();
    }
  }, [musicInfo]);

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

  const play = async () => {
    console.log('audioRef.currentL', audioRef.current);
    console.log('play');

    try {
      // @ts-ignore
      await audioRef.current.play();

      console.log('played');
      setPause(false);
    } catch (err) {
      console.log('play err: ', err);
    }

    // audioRef.current.play().then(
    //   () => {
    //     console.log('played');
    //     setPause(false);
    //   },
    //   (err: any) => {
    //     console.log('play err: ', err);
    //   }
    // );
  };

  const pause = async () => {
    console.log('pause');

    // @ts-ignore
    if (!audioRef.current.paused) {
      // @ts-ignore
      await audioRef.current.pause();

      setPause(true);
    }
  };

  const onClose = async () => {
    await pause();

    setMusicBarVisible(false);
  };

  const handleStart = (e: any) => {};

  const handleDrag = (e: any) => {
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

  const eventMap = {
    play: play,
    pause: pause,
    close: onClose,
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

  const playerClassName = useMemo(() => {
    const playStateClass = visible ? 'player_show' : 'player_hidden';
    const playerBorderClass = position.left ? 'left' : 'right';

    return `${playStateClass} ${playerBorderClass}`;
  }, [musicInfo, position, visible]);

  return (
    <>
      <div>
        {
          <Draggable
            bounds="#root"
            defaultClassName={`player ${playerClassName}`}
            onStart={handleStart}
            onDrag={handleDrag}
            // @ts-ignore
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

              <audio src={musicInfo.url} controls={false} ref={audioRef} />
            </div>
          </Draggable>
        }
      </div>

      <Outlet />
    </>
  );
}

import { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { MusicInfo } from '@/store';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import Draggable from 'react-draggable';

export default function Dashboard() {
  const audioRef = useRef(null);

  const [pauseState, setPause] = useState(true);
  const [musicInfo, setMusicInfo] = useRecoilState(MusicInfo);

  useEffect(() => {
    if (musicInfo.url) {
      play();
    }
  }, [musicInfo]);

  const play = async () => {
    console.log('play');

    // @ts-ignore
    if (audioRef.current.paused) {
      // @ts-ignore
      await audioRef.current.play();

      setPause(false);
    }
  };

  const pause = async () => {
    console.log('pause');
    // @ts-ignore
    await audioRef.current.pause();

    setPause(true);
  };

  const onClose = () => {
    setMusicInfo({ url: '' });
  };

  return (
    <>
      {musicInfo.url && (
        <Draggable bounds={{ left: 0 }} axis="y" defaultClassName="player">
          <div className="">
            <div className="player_operate">
              {pauseState ? (
                <PlayCircleFilled onClick={play} className="btn play" />
              ) : (
                <PauseCircleFilled onClick={pause} className="btn play" />
              )}

              <CloseOutlined className="btn close" onClick={onClose} />
            </div>

            <audio controls={false} ref={audioRef}>
              <source src={musicInfo.url} type="audio/mpeg" />
            </audio>
          </div>
        </Draggable>
      )}

      <Outlet />
    </>
  );
}

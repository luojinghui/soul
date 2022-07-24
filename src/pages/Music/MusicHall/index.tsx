import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ChineseMusicPlayList, MusicInfo, MusicBarVisible } from '@/store';
import action from '@/action';
import { Header } from '@/components';
import './index.less';

export default function MusicHall() {
  const [chineseMusicPlayList, setChineseMusicPlayList] =
    useRecoilState(ChineseMusicPlayList);
  const [musicInfo, setMusicInfo] = useRecoilState(MusicInfo);
  const setMusicBarVisible = useSetRecoilState(MusicBarVisible);

  const [loading] = useState(false);

  useEffect(() => {
    (async () => {
      // const { list } = await getTopList(10, '华语', 0);
      const { list } = await getCommentList();

      setChineseMusicPlayList(list);
    })();
  }, []);

  const playMusic = async (item: any) => {
    setMusicBarVisible(true);
    setMusicInfo(item);
  };

  const getCommentList = async () => {
    try {
      const result = await action.getCommentList();

      if (result?.code === 200) {
        console.log('result: ', result);

        return {
          list: result.data,
          code: 200,
        };
      }
    } catch (err) {
      console.log('get list error: ', err);
    }

    return {
      list: [],
      code: 300,
    };
  };

  const getTopList = async (limit: number, cat: string, offset: number) => {
    try {
      const result = await action.getMusicTopList(limit, cat, offset);

      if (result?.code === 200) {
        const list = result?.data?.body?.playlists || [];

        console.log('result: ', list);

        return {
          list,
          code: 200,
        };
      }
    } catch (err) {
      console.log('get list error: ', err);
    }

    return {
      list: [],
      code: 300,
    };
  };

  const renderRoomList = useCallback(() => {
    let list = chineseMusicPlayList;

    return list.map(({ cover, song, id, sing }: any, index: number) => {
      return (
        <div
          key={id}
          className={`room-info bg${(index % 19) + 1}`}
          onClick={() => {
            playMusic(list[index]);
          }}
        >
          <div className="avatar">
            <img src={cover} loading="lazy" alt="" />
          </div>
          <div className="info">
            <div>
              <span className="title">{song}</span>
            </div>

            <div>
              <span>{sing}</span>
            </div>

            <div>
              {/* <span className="time">更新时间：{getTime(createTime, 'M')}</span> */}
            </div>
          </div>
        </div>
      );
    });
  }, [chineseMusicPlayList]);

  return (
    <div className="app music-hall">
      <Header title="音乐星球"></Header>

      {/* 内容 */}
      <div className="im-content music-heall-content">
        {loading && <div className="loading">稍等片刻...</div>}

        {/* <h3>华语热门歌单</h3> */}
        {/* <div className={`room-list`}>{renderRoomList()}</div> */}
        <div className={`room-list`}>{renderRoomList()}</div>
      </div>
    </div>
  );
}

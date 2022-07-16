import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { ChineseMusicPlayList, MusicInfo } from '@/store';
import action from '@/action';
import { Header } from '@/components';
import { getTime } from '@/utils';
import './index.less';

export default function MusicHall() {
  const contentRef = useRef(null);

  const [chineseMusicPlayList, setChineseMusicPlayList] =
    useRecoilState(ChineseMusicPlayList);
  const [musicInfo, setMusicInfo] = useRecoilState(MusicInfo);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { list } = await getTopList(10, '华语', 0);

      setChineseMusicPlayList(list);
    })();
  }, []);

  const playMusic = async () => {
    const result = await action.getMusicInfo();

    if (result.code === 200) {
      setMusicInfo(result.data);
    }
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

    return list.map(
      ({ coverImgUrl, name, id, trackUpdateTime }: any, index: number) => {
        return (
          <div
            key={id}
            className={`room-info bg${(index % 19) + 1}`}
            onClick={() => {
              playMusic();
            }}
          >
            <div className="avatar">
              <img src={coverImgUrl.replace('http', 'https')} alt="" />
            </div>
            <div className="info">
              <div>
                <span className="title">{name}</span>
              </div>

              <div>
                <span className="time">
                  更新时间：{getTime(trackUpdateTime, 'M')}
                </span>
              </div>
            </div>
          </div>
        );
      }
    );
  }, [chineseMusicPlayList]);

  return (
    <div className="app music-hall">
      <Header title="音乐星球"></Header>

      {/* 内容 */}
      <div className="im-content music-heall-content">
        {loading && <div className="loading">稍等片刻...</div>}

        <h3>华语热门歌单</h3>
        <div className={`room-list`}>{renderRoomList()}</div>
      </div>
    </div>
  );
}

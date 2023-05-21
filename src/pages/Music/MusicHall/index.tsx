import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ChineseMusicPlayList, MusicInfo, MusicBarVisible, wrapperSizeState } from '@/store';
import action from '@/action';
import { Header } from '@/components';
import './index.less';

export default function MusicHall() {
  const [chineseMusicPlayList, setChineseMusicPlayList] = useRecoilState(ChineseMusicPlayList);
  const [musicInfo, setMusicInfo] = useRecoilState(MusicInfo);
  const setMusicBarVisible = useSetRecoilState(MusicBarVisible);

  const [style, setStyle] = useRecoilState(wrapperSizeState);
  const [loading] = useState(false);
  const contentRef = useRef(null);

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

  // 初始化计算每个item的size信息
  useEffect(() => {
    resizePage();
    window.addEventListener('resize', resizePage);
    return () => {
      window.removeEventListener('resize', resizePage);
    };
  }, []);

  const resizePage = () => {
    const size = getImgSize();

    setStyle(size);
  };

  const calcImgSize = (size: number) => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;
    // @ts-ignore
    const height = document.body.clientHeight;
    const marginWidth = size * 15;

    const realWidth = Math.floor((width - marginWidth) / size);
    const realHeight = Math.floor(realWidth * 1.6);

    let realH = height;
    let realW = height / 2;

    return {
      height: realHeight,
      width: realWidth,
      realH,
      realW,
    };
  };

  console.log("style: ", style);
  

  const getImgSize = () => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;
    let size: any;

    if (width <= 500) {
      size = calcImgSize(3);
    } else if (width <= 900) {
      size = calcImgSize(4);
    } else if (width <= 1300) {
      size = calcImgSize(5);
    } else if (width <= 1700) {
      size = calcImgSize(6);
    } else if (width <= 2100) {
      size = calcImgSize(7);
    } else if (width <= 2500) {
      size = calcImgSize(8);
    } else {
      size = calcImgSize(8);
    }

    return size;
  };

  const renderRoomList = useCallback(() => {
    let list = chineseMusicPlayList;

    return list.map(({ cover, song, id, sing }: any, index: number) => {
      return (
        <div
          key={id}
          style={{width: `${style.width}px`}}
          className={`room-info bg${(index % 19) + 1}`}
          onClick={() => {
            playMusic(list[index]);
          }}
        >
          {/* <div className="avatar">
            <img src={cover} loading="lazy" alt="" />
          </div> */}
          <div className="info">
            <div>
              <span className="title">{song}</span>
            </div>

            <div>
              <span>{sing}</span>
            </div>

            <div>{/* <span className="time">更新时间：{getTime(createTime, 'M')}</span> */}</div>
          </div>
        </div>
      );
    });
  }, [chineseMusicPlayList, style]);

  return (
    <div className="app music-hall">
      <Header title="音乐星球"></Header>

      {/* 内容 */}
      <div className="im-content music-heall-content">
        {loading && <div className="loading">稍等片刻...</div>}

        {/* <h3>华语热门歌单</h3> */}
        {/* <div className={`room-list`}>{renderRoomList()}</div> */}
        <div ref={contentRef} className={`room-list`}>
          {renderRoomList()}
        </div>
      </div>
    </div>
  );
}

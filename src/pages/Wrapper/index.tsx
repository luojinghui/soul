import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { wrapperSizeState } from '@/store';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { httpServer } from '@/enum';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IImgSize } from '@/type';
import { Header } from '@/components';
import './index.less';

export default function Wrapper() {
  const contentRef = useRef(null);
  const firstIn = useRef(true);

  // const [list, setList] = useRecoilState(wrapperListState);
  const [style, setStyle] = useRecoilState(wrapperSizeState);
  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [model, setVisible] = useState({
    visible: false,
    url: '',
  });
  const [pageIndex, setPageIndex] = useState(1);

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

  useEffect(() => {
    (async () => {
      const dataList: any = await getWrapperList(pageIndex);

      if (dataList.code === 200) {
        setList(dataList.list);
      } else {
        console.log('data get error');
      }

      if (firstIn.current) {
        setLoading(false);
        firstIn.current = false;
      }
    })();
  }, [pageIndex]);

  const getMoreData = useCallback(() => {
    setPageIndex(pageIndex + 1);
  }, [pageIndex]);

  const getWrapperList = async (index: number) => {
    try {
      const result = await action.getWrapperV2List(index);

      if (result?.code === 200) {
        const data: any = result.data;
        const newList = [...list, ...data];

        return {
          list: newList,
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

  const calcImgSize = (size: number): IImgSize => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;
    // @ts-ignore
    const height = document.body.clientHeight;

    const realWidth = Math.floor((width - 10) / size);
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

  const getImgSize = () => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;
    let size: IImgSize;

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

  const onToggleModel = () => {
    setVisible({
      visible: false,
      url: '',
    });
  };

  return (
    <div className="app wrapper-page">
      <Header title="热门壁纸"></Header>

      <div className="content" id="content" ref={contentRef}>
        {loading && <div className="loading">稍等片刻...</div>}

        <InfiniteScroll
          scrollableTarget="content"
          className="scroll"
          dataLength={list.length}
          next={getMoreData}
          hasMore={pageIndex <= 10}
          scrollThreshold={0.9}
          loader={
            <h4
              style={{
                textAlign: 'center',
                width: '100vw',
                marginTop: '10px',
              }}
            >
              Loading...
            </h4>
          }
          endMessage={<p style={{ textAlign: 'center' }}>没有数据啦...</p>}
        >
          {list.map((item: any) => {
            const { id, full_image_url, thumb_url } = item;
            const oriUrl = `${httpServer}${full_image_url}`;
            const thumbUrl = `${httpServer}${thumb_url}`;

            return (
              <div
                className="item"
                key={id}
                style={{
                  width: `${style.width}px`,
                  height: `${style.height}px`,
                }}
                onClick={() => {
                  setVisible({
                    visible: true,
                    url: oriUrl,
                  });
                }}
              >
                <img src={thumbUrl} loading="lazy" alt="" />
              </div>
            );
          })}
        </InfiniteScroll>
      </div>

      {model.visible && (
        <div className="wrapper-model" onClick={onToggleModel}>
          <div className="model">
            <img src={model.url} alt="" />
          </div>
        </div>
      )}
    </div>
  );
}

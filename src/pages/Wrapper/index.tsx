import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { wrapperListState, wrapperSizeState } from '@/store';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { Image } from 'antd';
import { httpServer } from '@/enum';
import InfiniteScroll from 'react-infinite-scroll-component';

import './index.less';
import { message } from 'antd';

export default function Wrapper() {
  const navigate = useNavigate();
  const [list, setList] = useRecoilState(wrapperListState);
  const [style, setStyle] = useRecoilState(wrapperSizeState);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);

  const contentRef = useRef(null);

  useEffect(() => {
    // window.addEventListener('resize', setListStyle);
    // return () => {
    //   window.removeEventListener('resize', setListStyle);
    // };
  }, []);

  const getWrapperList = async (index: number) => {
    const result = await action.getWrapperV2List(index);

    if (result?.code === 200) {
      const nextList: any = result.data;
      const newList = list.concat(nextList);

      setList(newList);
      return;
    } else {
      setList([]);
    }
  };

  const fetchData = () => {
    console.log('load img: ', pageIndex);
    setPageIndex(pageIndex + 1);
  };

  const getImgSize = (size: number) => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;

    const realWidth = Math.floor((width - 10) / size);
    const realHeight = Math.floor(realWidth * 2.164);
    // const realWidth = Math.floor((width - 10) / size);
    // const realHeight = Math.floor(realWidth * 1.54);

    return {
      height: realHeight,
      width: realWidth,
    };
  };

  const setListStyle = () => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;

    let size: any;

    if (width <= 500) {
      size = getImgSize(3);
    } else if (width <= 900) {
      size = getImgSize(4);
    } else if (width <= 1300) {
      size = getImgSize(5);
    } else if (width <= 1700) {
      size = getImgSize(6);
    } else if (width <= 2100) {
      size = getImgSize(7);
    } else if (width <= 2500) {
      size = getImgSize(8);
    } else if (width <= 2900) {
      size = getImgSize(9);
    } else if (width <= 3300) {
      size = getImgSize(10);
    } else if (width <= 3700) {
      size = getImgSize(11);
    } else {
      size = getImgSize(10);
    }

    setStyle(JSON.parse(JSON.stringify(size)));
  };

  useEffect(() => {
    setListStyle();
  });

  useEffect(() => {
    (async () => {
      await getWrapperList(pageIndex);

      setLoading(false);
    })();
  }, [pageIndex]);

  const onHome = () => {
    navigate(-1);
  };

  return (
    <div className="app wrapper-page">
      {/* 头部内容 */}
      <header className="im-header">
        <div className="left">
          <LeftOutlined className="icon back" onClick={onHome} />
        </div>
        <div className="title">热门壁纸</div>
        <div className="right"></div>
      </header>

      <div className="content" id="content" ref={contentRef}>
        {loading && <div className="loading">一波图片正在袭来，请等候...</div>}

        <InfiniteScroll
          scrollableTarget="content"
          className="scroll"
          dataLength={list.length}
          next={fetchData}
          hasMore={pageIndex <= 10}
          scrollThreshold={0.8}
          loader={
            <h4
              style={{ textAlign: 'center', width: '100vw', marginTop: '10px' }}
            >
              Loading...
            </h4>
          }
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>没有数据啦...</b>
            </p>
          }
        >
          {list.length &&
            list.map((item: any, index: number) => {
              return (
                <div
                  className="item"
                  key={item.id}
                  style={{
                    width: `${style.width}px`,
                    height: `${style.height}px`,
                  }}
                  onClick={() => {
                    setCurrent(index);
                    setVisible(true);
                  }}
                >
                  <img
                    src={`${httpServer}${item.thumb_url}`}
                    loading="lazy"
                    alt=""
                  />
                </div>
              );
            })}
        </InfiniteScroll>
      </div>

      {visible && (
        <Image.PreviewGroup
          preview={{
            visible,
            current,
            onVisibleChange: (vis) => setVisible(vis),
          }}
        >
          {list.map((item: any) => {
            return (
              <Image
                className="preive-img"
                key={item.id}
                // src={item.full_image_url}
                src={`${httpServer}${item.full_image_url}`}
              ></Image>
            );
          })}
        </Image.PreviewGroup>
      )}
    </div>
  );
}

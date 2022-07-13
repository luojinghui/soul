import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { wrapperListState, wrapperSizeState } from '@/store';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { Image } from 'antd';
import { httpServer } from '@/enum';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IImgSize } from '@/type';
import { Header } from '@/components';

import './index.less';
import { message } from 'antd';

import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';

export default function Wrapper() {
  const navigate = useNavigate();

  const contentRef = useRef(null);
  const firstIn = useRef(true);

  // const [list, setList] = useRecoilState(wrapperListState);
  const [style, setStyle] = useRecoilState(wrapperSizeState);
  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);

  // 初始化计算每个item的size信息
  useEffect(() => {
    const size = getImgSize();

    setStyle(size);
  }, []);

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
    console.log('height; ', height);

    const realWidth = Math.floor((width - 10) / size);
    // const realHeight = Math.floor(realWidth * 2.164);
    const realHeight = Math.floor(realWidth * 2);

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

  const onHome = () => {
    navigate('/');
  };

  console.log('dataList: ', list);
  console.log('stule: ', style);

  return (
    <div className="app wrapper-page">
      <Header title="热门壁纸"></Header>

      <div className="content" id="content" ref={contentRef}>
        {loading && <div className="loading">一波图片正在袭来，请等候...</div>}

        <div className="scroll">
          <Gallery>
            {list.map((item: any) => {
              const { id, full_image_url, thumb_url } = item;
              const oriUrl = `${httpServer}${full_image_url}`;
              const thumbUrl = `${httpServer}${thumb_url}`;

              return (
                <Item
                  key={id}
                  original={oriUrl}
                  thumbnail={thumbUrl}
                  width={style.realW}
                  height={style.realH}
                >
                  {({ ref, open }: any) => (
                    <div
                      className="item"
                      key={item.id}
                      style={{
                        width: `${style.width}px`,
                        height: `${style.height}px`,
                      }}
                      onClick={open}
                    >
                      <img ref={ref} src={thumbUrl} />
                    </div>
                  )}
                </Item>
              );
            })}
          </Gallery>
        </div>
      </div>
    </div>
  );
}

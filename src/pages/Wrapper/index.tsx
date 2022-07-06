import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { wrapperListState, wrapperSizeState } from '@/store';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import action from '@/action';
import { Image } from 'antd';

import './index.less';
import { message } from 'antd';

export default function Wrapper() {
  const navigate = useNavigate();
  const [list, setList] = useRecoilState(wrapperListState);
  const [style, setStyle] = useRecoilState(wrapperSizeState);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const contentRef = useRef(null);

  const getWrapperList = async () => {
    const result = await action.getWrapperList();

    if (result?.code === 200) {
      console.log('result.data.vertical: ', result.data.vertical);

      setList(result.data.vertical);
      return;
    } else {
      message.info('服务跑路了');
    }
  };

  const getImgSize = (size: number) => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;

    const realWidth = Math.floor(width / size);
    const realHeight = Math.floor(realWidth * 1.54);

    return {
      height: realHeight,
      width: realWidth,
    };
  };

  useEffect(() => {
    (async () => {
      // @ts-ignore
      const width = contentRef.current.clientWidth;

      let size: any;

      if (width <= 500) {
        size = getImgSize(2);
      } else if (width <= 900) {
        size = getImgSize(3);
      } else if (width <= 1300) {
        size = getImgSize(4);
      } else if (width <= 1700) {
        size = getImgSize(5);
      } else if (width <= 2100) {
        size = getImgSize(6);
      } else if (width <= 2500) {
        size = getImgSize(7);
      } else if (width <= 2900) {
        size = getImgSize(8);
      } else if (width <= 3300) {
        size = getImgSize(9);
      } else if (width <= 3700) {
        size = getImgSize(10);
      } else {
        size = getImgSize(10);
      }

      setStyle(size);

      await getWrapperList();

      setLoading(false);
    })();
  }, []);

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
                <img src={item.thumb} loading="lazy" alt="preview" />
              </div>
            );
          })}
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
            return <Image key={item.id} src={item.preview}></Image>;
          })}
        </Image.PreviewGroup>
      )}
    </div>
  );
}

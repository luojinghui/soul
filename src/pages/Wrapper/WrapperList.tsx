import React, { useEffect, useRef, useCallback } from 'react';
import { Scroll } from '@/components';
import action from '@/action';
import { IWrapperSelectKey } from '@/type';
import { wrapperStoreFunc } from '@/store';
import { useRecoilState } from 'recoil';
import { httpServer } from '@/enum';

interface IProps {
  activeKey?: IWrapperSelectKey;
  style: {
    width: number;
    height: number;
    realW: number;
    realH: number;
  };
  visible: boolean;
  onSelectImg: (data: any) => void;
}

export default function WrapperList(props: IProps) {
  const { activeKey = 'hot', style, visible = true, onSelectImg } = props;
  const { listState, pageState, loadingState } = wrapperStoreFunc(activeKey);

  const cachePageSizeRef = useRef(0);
  const [list, setList] = useRecoilState<any>(listState);
  const [pageSize, setPageSize] = useRecoilState<number>(pageState);
  const [loading, setLoading] = useRecoilState<boolean>(loadingState);

  useEffect(() => {
    if (pageSize >= 1 && list.length > 0) {
      cachePageSizeRef.current = pageSize;
    }
  }, []);

  const getWrapperList = async (
    index: number,
    activeKey: IWrapperSelectKey
  ) => {
    try {
      const result = await action.getWrapperV2List(index, activeKey);

      if (result?.code === 200) {
        const data: any = result.data;

        return {
          list: data,
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

  useEffect(() => {
    (async () => {
      if (pageSize <= cachePageSizeRef.current) {
        console.log('break');

        return;
      }

      console.log('actikey: ', activeKey);

      const data: any = await getWrapperList(pageSize, activeKey);

      if (data.code === 200) {
        let nextList = data.list;

        if (!loading) {
          nextList = [...list, ...data.list];
        }

        setList(nextList);
      } else {
        console.log('data get error');
      }

      if (loading) {
        setLoading(false);
      }
    })();
  }, [pageSize]);

  const getMoreData = useCallback(() => {
    setPageSize(pageSize + 1);
  }, [pageSize]);

  return (
    <div className={`${visible ? 'show' : 'hidden'}`}>
      {loading && <div className="loading">稍等片刻...</div>}

      <Scroll
        hasMore={pageSize < 15}
        scrollThresholdBottom={50}
        autoHide={true}
        autoHideTimeout={1000}
        onNext={getMoreData}
      >
        <div className="scroll">
          {list.map((item: any) => {
            const { id, full_image_url, thumb_url } = item;
            const oriUrl = `${httpServer}${full_image_url}`;
            const thumbUrl = `${httpServer}${thumb_url}`;

            return (
              <a
                className="item"
                key={id}
                style={{
                  width: `${style.width}px`,
                  height: `${style.height}px`,
                }}
                onClick={() => {
                  onSelectImg({
                    visible: true,
                    url: oriUrl,
                  });
                }}
              >
                <img src={thumbUrl} loading="lazy" alt="" />
              </a>
            );
          })}
        </div>
      </Scroll>
    </div>
  );
}

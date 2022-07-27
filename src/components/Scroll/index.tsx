import React, { useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

interface IProps {
  hasMore?: boolean;
  scrollThresholdBottom?: number;
  autoHide?: boolean;
  autoHideTimeout?: number;
  scrollableTarget?: string;
  onScroll?: (e: any) => void;
  onNext?: () => void;
  children?: React.ReactNode;
}

export default function Scroll(props: IProps) {
  const scrollHeightRef = useRef(0);
  const thresholdHeightRef = useRef(0);
  const clientHeightRef = useRef(0);
  const isNextDataRef = useRef(false);

  const {
    hasMore = false,
    scrollThresholdBottom = 50,
    autoHide = true,
    autoHideTimeout = 1000,
    onScroll = () => {},
    onNext = () => {},
    children,
  } = props;

  const onScrollBox = (e: any) => {
    onScroll(e);

    const scrollHeight = e.target.scrollHeight;
    const clientHeight = e.target.clientHeight;
    const scrollTop = e.target.scrollTop;

    if (clientHeightRef.current !== clientHeight) {
      clientHeightRef.current = clientHeight;
    }

    if (scrollHeightRef.current !== scrollHeight) {
      scrollHeightRef.current = scrollHeight;
      thresholdHeightRef.current =
        scrollHeight - scrollThresholdBottom - clientHeightRef.current;

      isNextDataRef.current = true;
    }

    if (
      scrollTop >= thresholdHeightRef.current &&
      isNextDataRef.current &&
      hasMore
    ) {
      isNextDataRef.current = false;

      onNext();
    }
  };

  return (
    <Scrollbars
      autoHide={autoHide}
      autoHideTimeout={autoHideTimeout}
      onScroll={onScrollBox}
    >
      {children}
    </Scrollbars>
  );
}

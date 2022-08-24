/**
 * XYRTC Audio Component
 *
 * @authors Luo-jinghui (luojinghui424@gmail.com)
 * @date  2020-1-07 10:34:18
 */

import React, { useEffect, useRef } from 'react';

interface IProps {
  streamId: string;
  item: any;
}

const Audio = (props: IProps) => {
  const { streamId, item } = props;
  const audioRef = useRef<HTMLAudioElement>(null);

  console.log('streamId: ', streamId);

  // 组件加载完成（DOM已经渲染）的回调事件
  useEffect(() => {
    const audioEle = audioRef.current;
    if (audioEle && !audioEle.srcObject && streamId) {
      audioEle.srcObject = item;
    }

    // react hook 组件销毁时的回调函数
    return () => {
      // 暂停audio组件播放
      audioEle && audioEle.pause();
    };
  }, [streamId]);

  // audio组件在页面中隐藏即可，不需要展示出来
  return (
    <div className="wrap-audio">
      <audio ref={audioRef} autoPlay></audio>
    </div>
  );
};

export default Audio;

import React, { useEffect, useRef, useState } from 'react';
import parseAPNG, { APNG } from 'apng-js';
import Player from 'apng-js/types/library/player';

interface IPlayer {
  apng: APNG;
  player: Player;
}

interface IProps {
  src: string;
  className?: string;
  arg?: any;
  autoPlay?: boolean;
  style?: React.CSSProperties | null;
  onLoadPlayer?: ({ apng, player }: IPlayer) => void;
}

export default function APng(props: IProps) {
  const {
    src,
    className = '',
    style = {},
    autoPlay = true,
    arg,
    onLoadPlayer = () => {},
  } = props;
  const apngRef = useRef<APNG | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  const [isApng, setIsApng] = useState(true);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const getImgBuffer = (url: string): Promise<string | ArrayBuffer | null> => {
    return new Promise(async (resolve) => {
      const blob = await fetch(url).then((res) => res.blob());
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  };

  useEffect(() => {
    (async () => {
      const imgBuffer = await getImgBuffer(src);
      const canvasContext = canvasRef.current
        ? canvasRef.current.getContext('2d')
        : null;

      if (imgBuffer) {
        try {
          apngRef.current = parseAPNG(imgBuffer as ArrayBuffer) as APNG;
          if (canvasContext) {
            playerRef.current = await apngRef.current.getPlayer(
              canvasContext,
              true
            );

            if (!autoPlay) {
              playerRef.current.pause();
            }

            onLoadPlayer({
              apng: apngRef.current,
              player: playerRef.current,
            });

            const size = {
              width: apngRef.current.width,
              height: apngRef.current.height,
            };
            setImgSize(size);
          }
        } catch (err: any) {
          setIsApng(false);
          return;
        }
      }
    })();
  }, [src]);

  return (
    <>
      {isApng ? (
        <canvas
          {...arg}
          ref={canvasRef}
          width={imgSize.width}
          height={imgSize.height}
          style={style ? style : {}}
          className={className}
        ></canvas>
      ) : (
        <img
          src={src}
          {...arg}
          style={style ? style : {}}
          className={className}
        />
      )}
    </>
  );
}

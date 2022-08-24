import React, { useEffect, useRef, useState } from 'react';

const Video = (props: any) => {
  const timerRef = useRef<any>();
  const [setting, setSetting] = useState<any>({});
  const { item, debug } = props;
  const { username, stream, id, isLocal } = item;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (
      stream &&
      stream.id &&
      videoRef.current &&
      !videoRef.current.srcObject
    ) {
      videoRef.current.srcObject = stream.mediaStream;
    }

    return () => {
      console.log('video destroy: ', username);
    };
  }, [id, stream, username]);

  useEffect(() => {
    if (!debug) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          try {
            const videoTrack = stream.mediaStream.getVideoTracks();

            if (videoTrack.length) {
              const setting = videoTrack[0].getSettings();

              setSetting(setting);
            }
          } catch (err) {
            console.log('video error: ', err);
          }
        }, 3000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [debug]);

  const localStyle = React.useMemo(() => {
    return isLocal ? { transform: 'scaleX(-1)' } : {};
  }, [isLocal]);

  return (
    <div className="wrap-video">
      <video
        style={localStyle}
        ref={videoRef}
        autoPlay
        muted={true}
        playsInline
        controls={false}
        className="video"
      ></video>

      {!item.video && <div className="video video-status">视频暂停中</div>}

      <span className="name">{username}</span>

      {debug && (
        <span className="name">{`${setting.width || 0} * ${
          setting.height || 0
        }`}</span>
      )}
    </div>
  );
};

export default Video;

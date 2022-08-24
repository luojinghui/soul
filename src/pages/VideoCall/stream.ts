/**
 * Stream lib
 */

import { VIDEO_CONSTRAINTS, ResolutionMap } from '@/enum';
import logger from '@/utils/log';
import { callConfig, Resolution } from './type';

class Stream {
  public mediaStream: any;
  public constraints: any;
  public streamId: any;

  constructor() {
    this.mediaStream = null;
    this.constraints = null;
    this.streamId = null;
  }

  setStream(mediaStream: any) {
    this.mediaStream = mediaStream;
    this.streamId = mediaStream.id;
  }

  /**
   * 获取本地Mediastream
   *
   * @returns MediaStream
   */
  getStream() {
    return {
      mediaStream: this.mediaStream,
      id: this.streamId,
    };
  }

  destroyStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        console.log('track destroy: ', track);

        track.stop();
      });
    }
  }

  getCons(resolution: Resolution) {
    const videoSetting = Object.assign(
      {},
      VIDEO_CONSTRAINTS,
      ResolutionMap[resolution]
    );

    return videoSetting;
  }

  async initStream(config: callConfig) {
    const { video = false, audio = false, resolution } = config || {};
    const constraints: any = {};
    constraints.audio = audio;
    let videoSetting: any = false;

    if (video) {
      if (typeof video === 'boolean') {
        videoSetting = Object.assign(
          {},
          VIDEO_CONSTRAINTS,
          ResolutionMap[resolution]
        );
      } else if (typeof video === 'object') {
        videoSetting = Object.assign(
          {},
          VIDEO_CONSTRAINTS,
          ResolutionMap[resolution],
          video
        );
      }
    }
    constraints.video = videoSetting;

    logger.log('initStream constraints: ', constraints);

    if (!constraints.video && !constraints.audio) {
      this.mediaStream = null;
      this.streamId = null;
      return;
    }

    try {
      this.mediaStream = await this.getUserMedia(constraints);
      this.streamId = this.mediaStream.id;
    } catch (err) {
      console.log('getUserMedia error: ', err);
    }
  }

  async getUserMedia(constraints: MediaStreamConstraints) {
    return await navigator.mediaDevices.getUserMedia(constraints);
  }
}

export default Stream;

/**
 * Stream lib
 */

const VIDEO_CONSTRAINTS = {
  aspectRatio: 1.7778,
  resizeMode: 'crop-and-scale',
  width: 640,
  height: 360,
};

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

  async initStream(config: any) {
    const { video = true, audio = true } = config || {};
    const constraints: any = {};
    constraints.audio = audio;

    const videoCons = video ? VIDEO_CONSTRAINTS : false;
    constraints.video = videoCons;

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

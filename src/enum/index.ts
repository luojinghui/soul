const wssProtocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';

let port = window.location.port;

if (port === '3000') {
  port = '3001';
}

export const imServer = `${window.location.protocol}//${window.location.hostname}:${port}`;
export const httpServer = `${window.location.protocol}//${
  window.location.hostname
}${port ? ':' + port : ''}`;

export const MS = {
  300: {
    msg: 'Aleady exit user',
    code: 300,
    type: 'Failed',
  },
  301: {
    msg: 'Need Login',
    code: 301,
    type: 'Failed',
  },
  200: {
    msg: 'ok',
    code: 200,
    type: 'MEETING',
  },
};

export const VIDEO_CONSTRAINTS = {
  aspectRatio: 1.777,
  resizeMode: 'crop-and-scale',
  width: 640,
  height: 360,
};

export const ResolutionMap = {
  720: {
    width: 1280,
    height: 720,
  },
  360: {
    width: 640,
    height: 360,
  },
  180: {
    width: 360,
    height: 180,
  },
};

export const DEFAULT_ICE_SERVER = {
  urls: 'turn:47.52.156.68:3478',
  credential: 'zmecust',
  username: 'zmecust',
};

export const CONFIGURATION: any = {
  iceServers: [
    {
      urls: 'turn:120.48.66.29:3478',
      credential: '123456',
      username: 'luojh',
    },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 0,
  sdpSemantics: 'unified-plan',
};

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
  login: 'LOGIN',
  meeting: 'MEETING',
};

export const DEFAULT_ICE_SERVER = {
  urls: 'turn:47.52.156.68:3478',
  credential: 'zmecust',
  username: 'zmecust',
};

export const CONFIGURATION: any = {
  iceServers: [
    // {
    //   urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443?transport=tcp',
    // },
    {
      urls: 'turn:120.48.66.29:3478',
      credential: '123456',
      username: 'luojh',
    },
    // {
    //   urls: 'turn:numb.viagenie.ca',
    //   credential: 'muazkh',
    //   username: 'webrtc@live.com',
    // },
  ],
  iceTransportPolicy: 'relay',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 0,
  sdpSemantics: 'unified-plan',
};

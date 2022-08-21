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
    'stun:stun.voxgratia.org',
    {
      urls: 'turn:192.158.29.39:3478?transport=udp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808',
    },
    {
      urls: 'turn:192.158.29.39:3478?transport=tcp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808',
    },
  ],
  sdpSemantics: 'unified-plan',
};

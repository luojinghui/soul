const wssProtocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';

let port = window.location.port;

if (port === '3000') {
  port = '3001';
}

export const imServer = `${wssProtocol}${window.location.hostname}:${port}`;
export const httpServer = `${window.location.protocol}//${window.location.hostname}:${port}`;

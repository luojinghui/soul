const wssProtocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';

export const imServer = `${wssProtocol}${window.location.hostname}:3001`;
export const httpServer = `${window.location.protocol}${window.location.hostname}:3001`;

export const UserInfo = 'USER_INFO';

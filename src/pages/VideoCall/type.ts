import { ManagerOptions, SocketOptions } from 'socket.io-client';

export type Resolution = '180' | '360' | '720';
export type Codec = 'all' | 'h264';

export interface callConfig {
  audio: boolean;
  meetingId: string;
  username: string;
  video: boolean;
  policy: 'all' | 'relay';
  resolution: Resolution;
  codec: Codec;
}

export interface ClientEvent {
  code: number;
  msg: string;
  data: any;
}

export interface Config {
  server: string;
  socketOption?: Partial<ManagerOptions & SocketOptions> | undefined;
}

export interface userInfo {}

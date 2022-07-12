export interface IUserInfo {
  avatar: string;
  avatarType: 'Local' | 'Remote';
  id: string;
  name: string;
}

export interface IImgSize {
  height: number;
  width: number;
  realW: number;
  realH: number;
}

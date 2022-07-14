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

export type IFile = {
  uid: string;
  name: string;
  status: string;
  url: string;
  oriUrl: string;
};

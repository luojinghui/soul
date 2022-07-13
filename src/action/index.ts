/**
 * action request
 *
 * @authors Luo-jinghui (luojinghui424@gmail.com)
 * @date  2019-10-30 14:14:04
 */

import HttpClient from './httpClient';
import { httpServer } from '../enum';

class Action {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient({
      baseURL: httpServer,
      timeout: 20000,
    });
  }

  async registerUser() {
    const sendUrl = `/api/rest/user/register`;

    return await this.http.post(sendUrl, {
      agent: navigator.userAgent,
      platform: navigator.platform,
    });
  }

  async getUserInfo(userId: string) {
    return await this.http.get(`/api/rest/user/info?userId=${userId}`);
  }

  async getRoomInfo(roomId: string, userId: string) {
    return await this.http.get(
      `/api/rest/room/info?roomId=${roomId}&userId=${userId}`
    );
  }

  async createRootRoom({ roomId, userId }: any) {
    return await this.http.post(`/api/rest/room/createRoot`, {
      roomId,
      userId,
    });
  }

  async createRoom(data: any, userId: string) {
    return await this.http.post(`/api/rest/room/create`, { data, userId });
  }

  async getRoomList(userId: string) {
    return await this.http.get(`/api/rest/room/list?userId=${userId}`);
  }

  async uploadImg(formdata: FormData, userId: string) {
    return await this.http.post(
      `/api/rest/room/uploadImg?userId=${userId}`,
      formdata,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  }

  async updateUserInfo(formdata: any, userId: string) {
    return await this.http.post(
      `/api/rest/user/update?userId=${userId}`,
      formdata,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  }

  async updateUserInfoV2(formdata: any, userId: string) {
    return await this.http.post(
      `/api/rest/user/updatev2?userId=${userId}`,
      formdata,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  async getWrapperList() {
    return await this.http.get(`/api/happy/wrappaper`);
  }

  async getWrapperV2List(pageIndex: number) {
    return await this.http.get(
      `/api/happy/v2/wrappaper?pageIndex=${pageIndex}`
    );
  }
}

export default new Action();

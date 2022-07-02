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

  async createRoom(roomId: string, userId: string) {
    return await this.http.post(`/api/rest/room/info`, { roomId, userId });
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

  // async verifyPassword() {
  //   const resp = await this.http.put(
  //     `/api/rest/uss/v4/en/cloudmeeting/validation`,
  //     {}
  //   );

  //   return resp;
  // }

  // // 埋点
  // async setStates(data: any) {
  //   try {
  //     await this.http.post('/api/rest/v3/device/states', data);
  //   } catch (err) {}
  // }

  // async igonreMeetingMonito(confNumber: string, securityKey: string) {
  //   const sendUrl = `/api/rest/uss/v1/cloudmeeting/monitor?securityKey=${securityKey}&conferenceNumber=${confNumber}&nonce=${nonce}`;

  //   return await this.http.get(sendUrl);
  // }
}

export default new Action();

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
    const sendUrl = `/api/rest/registerUser`;

    return await this.http.get(sendUrl);
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

/**
 * LocalStorage lib
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-23 20:28:09
 * Last modified  : 2022-07-03 22:52:51
 */

export const UserInfo = 'SOUL_USER_INFO_v1';

export const storage = {
  set: (key: string, data: any) => {
    window.localStorage.setItem(key, JSON.stringify(data));
  },
  get: (key: string) => {
    const data: string | null = window.localStorage.getItem(key);
    const parseData: any = data ? JSON.parse(data) : data;

    return parseData;
  },
  delete: (key: string) => {
    window.localStorage.removeItem(key);
  },
  clear: () => {
    window.localStorage.clear();
  },
};

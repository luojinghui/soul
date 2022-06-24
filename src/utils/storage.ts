/**
 * LocalStorage lib
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-23 20:28:09
 * Last modified  : 2022-06-23 20:34:17
 */

export const UserInfo = 'USER_INFO';

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

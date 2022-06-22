/**
 * axiox request lib
 *
 * @authors Luo-jinghui (luojinghui424@gmail.com)
 * @date  2019-11-01 14:14:45
 */

import Axios, {
  AxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
  AxiosError,
} from 'axios';

class HttpClient {
  public commonOption: AxiosRequestConfig;
  public axios: AxiosInstance;

  constructor(commonOption: AxiosRequestConfig) {
    this.commonOption = commonOption;
    const mergerCommonOption = {
      ...commonOption,
      headers: {},
    };

    Axios.defaults.timeout = 10000;

    this.axios = Axios.create(mergerCommonOption);

    this.axios.interceptors.request.use((config: any) => {
      const randomNum = Math.ceil(Math.random() * 10000);

      if (config.url.includes('?')) {
        config.url += `&random=${randomNum}`;
      } else {
        config.url += `?random=${randomNum}`;
      }

      return config;
    });

    /***
     * 添加默认的响应拦截器
     */
    this.axios.interceptors.response.use(
      (response: AxiosResponse): any => {
        return {
          ...response?.data,
          status: response.status,
        };
      },
      (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
      }
    );
  }

  public assignOptions = (option?: AxiosRequestConfig) => {
    return Object.assign({}, this.commonOption, option, {
      params: Object.assign(
        {},
        this.commonOption.params,
        option && option.params
      ),
    });
  };

  public get = (url: string, option?: AxiosRequestConfig): any => {
    return this.axios.get(url, this.assignOptions(option)).catch((err) => {
      return {
        err,
      };
    });
  };

  public put = (url: string, data?: any, option?: AxiosRequestConfig): any => {
    return this.axios
      .put(url, data, this.assignOptions(option))
      .catch((err: any) => {
        return {
          err,
        };
      });
  };

  public post = (url: string, data?: any, option?: AxiosRequestConfig): any => {
    return this.axios
      .post(url, data, this.assignOptions(option))
      .catch((err: any) => {
        return {
          err,
        };
      });
  };

  public delete = (url: string, option?: AxiosRequestConfig): any => {
    return this.axios
      .delete(url, this.assignOptions(option))
      .catch((err: any) => {
        return {
          err,
        };
      });
  };
}

export default HttpClient;

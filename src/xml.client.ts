import { AxiosDigestAuth } from '@lukesthl/ts-axios-digest-auth';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Axios } from 'axios';
import { XMLParser } from 'fast-xml-parser';

export class XMLClient {
  private axiosInstance = new Axios({});

  private xmlParser = new XMLParser({ ignoreAttributes: false });

  public async request<T>(
    url: string,
    config?: AxiosRequestConfig,
    digestAuth?: boolean
  ): Promise<T> {
    const response = await this.requestXml(url, config, digestAuth);
    if (response?.data && typeof response.data === 'string') {
      return this.xmlParser.parse(response.data) as T;
    }
    throw new Error('Invalid response');
  }

  private async requestXml<T>(
    url: string,
    config?: AxiosRequestConfig,
    digestAuth?: boolean
  ): Promise<AxiosResponse<T>> {
    if (!this.axiosInstance) {
      this.axiosInstance = new Axios({});
    }
    if (digestAuth && config?.auth?.username && config?.auth?.password) {
      return new AxiosDigestAuth({
        username: config?.auth?.username,
        password: config?.auth?.password,
      }).request<T>({ url, ...config });
    }
    return this.axiosInstance.request<T>({ url, ...config });
  }
}

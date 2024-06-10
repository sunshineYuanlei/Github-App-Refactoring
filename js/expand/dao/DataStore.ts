import { get } from './HiNet';
import Constants from './Constants';
import { URL } from 'react-native-url-polyfill';//use URLSearchParams in RN

export const FLAG_STORAGE = {
  flag_popular: 'popular',
  flag_trending: 'trending',
};
export default class DataStore {
  /**
   * 获取数据
   * @param url
   * @param flag
   * @param pageIndex
   * @param pageSize
   * @returns {Promise<unknown>}
   */
  fetchData(url: string, flag: string, pageIndex = 1, pageSize = 25) {
    const isTrending = flag === FLAG_STORAGE.flag_trending;
    const api = isTrending ?  Constants.trending.api : Constants.popular.api
    let params: any = { pageIndex, pageSize };
    if (isTrending) {
      params.sourceUrl = url;
    } else {
      //从url中取出q参数：eg:url https://api.devio.org/uapi/popular?q=java&pageIndex=1&pageSize=25 
      const q = new URL(url).searchParams.get('q');
      params.q = q;
    };
    return get(api)(params);
  }
}

 

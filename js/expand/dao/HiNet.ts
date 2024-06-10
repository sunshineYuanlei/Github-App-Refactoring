import NavigationUtil from '../../navigator/NavigationUtil';
import {getBoarding} from '../../util/BoardingUtil';
import Constants from './Constants';
/**
 * 发送get请求
 * @param api 要请求的接口
 * @returns
 */
export function get(api: string) {
  /**
   * params get请求的参数
   */
  return async (params?: {}) => {
    const boarding = await getBoarding();
    const {headers, url} = Constants;
    return handleData(
      fetch(buildParams(url + api, params), {
        headers: {
          ...headers,
          'boarding-pass': boarding || '',
        },
      }),
    );
  };
}
export function post(api: string) {
  /**
   * 第一个参数作为body参数，第二个参数作为URL path或者查询参数
   */
  return (params: {}) => {
    return async (queryParams?: {} | string) => {
      const boarding = await getBoarding();
      const {headers, url} = Constants;
      var data, cType;
      if (params instanceof FormData) {
        data = params;
        cType = 'multipart/form-data'; // fix TypeError: Network request failed
      } else {
        data = JSON.stringify(params);
        cType = 'application/json';
      }
      return handleData(
        fetch(buildParams(url + api, queryParams), {
          method: 'POST',
          body: data,
          headers: {
            'content-type': cType,
            ...headers,
            'boarding-pass': boarding || '',
          },
        }),
      );
    };
  };
}
/**
 * 处理接口请求数据
 * @param doAction
 * @returns
 */
function handleData(doAction: Promise<any>) {
  return new Promise((resolve, reject) => {
    doAction
      .then(res => {
        //解析Content-Type 防止将非json数据进行json转换
        const type = res.headers.get('Content-Type');
        if ((type || '').indexOf('json') !== -1) {
          return res.json();
        }
        return res.text();
      })
      .then(result => {
        console.log(JSON.stringify(result));
        if (typeof result === 'string') {
          throw new Error(result);
        }
        const {code, msg, data: {list = undefined} = {}} = result;
        if (code === 401) {
          //跳转到登录页
          NavigationUtil.login();
          return;
        }
        resolve(list || result);
      })
      .catch(error => {
        reject(error);
      });
  });
}
/**
 * 构建url参数
 * @param url
 * @param params
 * @returns
 */
function buildParams(url: string, params?: {} | string): string {
  let newUrl = new URL(url),
    finalUrl;
  if (typeof params === 'object') {
    for (const [key, value] of Object.entries(params)) {
      newUrl.searchParams.append(key, value as string);
    }
    finalUrl = newUrl.toString();
  } else if (typeof params === 'string') {
    //适配path参数
    finalUrl = url.endsWith('/') ? url + params : url + '/' + params;
  } else {
    finalUrl = newUrl.toString();
  }
  console.log('---buildParams----:', finalUrl);
  return finalUrl;
}

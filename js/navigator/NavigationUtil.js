import {StackActions} from '@react-navigation/native';

/**
 * 全局导航跳转工具类 by CrazyCodeBoy
 */
export default class NavigationUtil {
  /**
   * 跳转到指定页面
   * @param params 要传递的参数
   * @param page 要跳转的页面名
   **/
  static goPage(params, page) {
    const navigation = NavigationUtil.navigation || (params || {}).navigation;
    if (!navigation) {
      console.error('NavigationUtil.navigation can not be null');
      return;
    }
    navigation.navigate(page, {
      ...params,
      navigation: undefined, //fix Non-serializable values were found in the navigation state. Check:
    });
  }

  /**
   * 返回上一页
   * @param navigation
   */
  static goBack(navigation) {
    navigation.goBack();
  }

  /**
   * 重置到首页
   * @param navigation
   */
  static resetToHomPage(params) {
    // 从参数取出导航器
    const {navigation} = params;

    navigation.dispatch(StackActions.replace('HomePage', {}));
  }

  /**
   * 重置到登录
   * @param params
   */
  static login(params = {}) {
    let {navigation} = params;
    navigation = navigation || NavigationUtil.navigation;

    navigation.dispatch(StackActions.replace('LoginPage', {}));
  }

   /**
   * 重置到注册
   * @param params
   */
   static registration(params = {}) {
    let {navigation} = params;
    navigation = navigation || NavigationUtil.navigation;

    navigation.dispatch(StackActions.replace('RegistrationPage', {}));
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeFactory, {ThemeFlags} from '../../res/styles/ThemeFactory';

const THEME_KEY = 'theme_key';
export default class ThemeDao {
  /**
   * 获取当前主题
   * @returns {Promise<any> | Promise}
   */
  getTheme() {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(THEME_KEY, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          const {Default} = ThemeFlags;
          this.save(Default);
          result = Default;
        }
        // 水管弯弯, 适配store所需数据结构
        resolve(ThemeFactory.createTheme(result));
      });
    });
  }

  /**
   * 保存主题标识
   * @param themeFlag
   */
  save(themeFlag) {
    AsyncStorage.setItem(THEME_KEY, themeFlag);
  }
}

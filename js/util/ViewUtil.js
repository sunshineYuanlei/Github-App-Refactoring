import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class ViewUtil {
  /**
   * 获取设置页的Item
   * @param callBack 单击item的回调
   * @param text 显示的文本
   * @param color 图标着色
   * @param Icons react-native-vector-icons组件
   * @param icon 左侧图标
   * @param expandableIco 右侧图标
   * @return {XML}
   */
  static getSettingItem(callBack, text, color, Icons, icon, expandableIco, menu) {
    return (
      <TouchableOpacity
        onPress={() => callBack(menu)}
        style={styles.setting_item_container}>
        <View style={{alignItems: 'center', flexDirection: 'row'}}>
          {Icons && icon ? (
            <Icons
              name={icon}
              size={16}
              style={{color: color, marginRight: 10}}
            />
          ) : (
            <View
              style={{opacity: 1, width: 16, height: 16, marginRight: 10}}
            />
          )}
          <Text>{text}</Text>
        </View>
        <Ionicons
          name={expandableIco || 'arrow-forward'}
          size={16}
          style={{
            marginRight: 10,
            alignSelf: 'center',
            color: color || 'black',
          }}
        />
      </TouchableOpacity>
    );
  }

  /**
   * 获取设置页的Item
   * @param callBack 单击item的回调
   * @param menu @MORE_MENU
   * @param color 图标着色
   * @param expandableIco 右侧图标
   * @return {XML}
   */
  static getMenuItem(callBack, menu, color, expandableIco) {
    return ViewUtil.getSettingItem(
      callBack,
      menu.name,
      color,
      menu.Icons,
      menu.icon,
      expandableIco,
      menu
    );
  }

  /**
   * 获取左侧返回按钮
   * @param callBack
   * @returns {XML}
   */
  static getLeftBackButton(callBack) {
    return (
      <TouchableOpacity
        style={{paddingLeft: 12, paddingTop: 3}}
        onPress={callBack}>
        <Ionicons name={'arrow-back'} size={23} style={{color: 'white'}} />
      </TouchableOpacity>
    );
  }

  /**
   * 获取右侧文字按钮
   * @param title
   * @param callBack
   * @returns {XML}
   */
  static getRightButton(title, callBack) {
    return (
      <TouchableOpacity style={{alignItems: 'center'}} onPress={callBack}>
        <Text style={{fontSize: 20, color: '#FFFFFF', marginRight: 10}}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
  /**
   * 获取分享按钮
   * @param callBack
   * @returns {XML}
   */
  static getShareButton(callBack) {
    return (
      <TouchableOpacity underlayColor={'transparent'} onPress={callBack}>
        <Ionicons
          name={'share-social'}
          size={20}
          style={{opacity: 0.9, marginRight: 10, color: 'white'}}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  setting_item_container: {
    backgroundColor: 'white',
    padding: 10,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

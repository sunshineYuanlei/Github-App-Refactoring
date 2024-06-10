import React from 'react';
import {
  Modal,
  TouchableHighlight,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ThemeDao from '../expand/dao/ThemeDao';
import GlobalStyles from '../res/styles/GlobalStyles';
import {ThemeFlags} from '../res/styles/ThemeFactory';
import {setCustomTheme} from '../redux/themeSlice';
import {useDispatch} from 'react-redux';

const CustomTheme = props => {
  const {visible} = props;
  const themeDao = new ThemeDao();

  const dispatch = useDispatch();

  const renderContentView = () => {
    return (
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          props.onClose();
        }}>
        {/* styles.modalContainer -- 设置shadow效果等 */}
        <View style={styles.modalContainer}>
          <ScrollView>{renderThemeItems()}</ScrollView>
        </View>
      </Modal>
    );
  };

  const renderThemeItems = () => {
    const views = [];
    let keys = Object.keys(ThemeFlags);
    for (let i = 0; i < keys.length; i += 3) {
      const keysInner = [keys[i], keys[i + 1], keys[i + 2]];
      views.push(
        <View key={i} style={{flexDirection: 'row'}}>
          {getThemeItem(keysInner[0])}
          {getThemeItem(keysInner[1])}
          {getThemeItem(keysInner[2])}
        </View>,
      );
    }
    return !views.length ? null : views;
  };

  const getThemeItem = themeKey => {
    if (!themeKey) return null;
    return (
      <TouchableHighlight
        style={{flex: 1}}
        underlayColor="white"
        onPress={() => onSelectTheme(themeKey)}>
        {/* styles.themeItem -- 设置text中文字水平垂直居中效果等 */}
        {/* backgroundColor: ThemeFlags[themeKey] -- 设置对应的颜色作为色块背景色 */}
        <View
          style={[{backgroundColor: ThemeFlags[themeKey]}, styles.themeItem]}>
          <Text style={styles.themeText}>{themeKey}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  const onSelectTheme = themeKey => {
    // 关闭当前模态框
    props.onClose();
    // 解析主题色
    const theme = ThemeFlags[themeKey];
    // 本地持久化保存主题色
    themeDao.save(theme);
    // 更新store中的主题色
    dispatch(setCustomTheme(theme));
  };

  return visible ? (
    // root_container -- 占满全屏(flex:1), 白色背景色
    <View style={GlobalStyles.root_container}>{renderContentView()}</View>
  ) : null;
};

export default CustomTheme;

const styles = StyleSheet.create({
  themeItem: {
    flex: 1,
    height: 120,
    margin: 3,
    padding: 3,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    margin: 10,
    marginTop: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: 'white',
    borderRadius: 3,
    shadowColor: 'gray',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    padding: 3,
  },
  themeText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});

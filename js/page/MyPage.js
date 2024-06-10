import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {MORE_MENU} from '../common/MORE_MENU';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector, useDispatch} from 'react-redux';
import ViewUtil from '../util/ViewUtil';
import GlobalStyles from '../res/styles/GlobalStyles';
import NavigationUtil from '../navigator/NavigationUtil';
import {FLAG_LANGUAGE} from '../expand/dao/LanguageDao';
import {setShowCustomThemeView} from '../redux/themeSlice';

const MyPage = props => {
  const themeColor = useSelector(state => state.theme.theme);
  const dispatch = useDispatch();

  const onClick = menu => {
    let RouteName,
      params = {themeColor};
    switch (menu) {
      case MORE_MENU.Tutorial:
        RouteName = 'WebViewPage';
        params.title = '教程';
        params.url = 'https://coding.m.imooc.com/classindex.html?cid=89';
        break;
      case MORE_MENU.About:
        RouteName = 'AboutPage';
        break;
      case MORE_MENU.Custom_Key:
      case MORE_MENU.Custom_Language:
      case MORE_MENU.Remove_Key:
        RouteName = 'CustomKeyPage';
        params.flag =
          menu === MORE_MENU.Custom_Language
            ? FLAG_LANGUAGE.flag_language
            : FLAG_LANGUAGE.flag_key;
        params.isRemoveKey = menu === MORE_MENU.Remove_Key;
        break;
      case MORE_MENU.Custom_Theme:
        dispatch(setShowCustomThemeView(true));
        break;
      case MORE_MENU.About_Author:
        RouteName = 'AboutMePage';
        break;
      case MORE_MENU.CodePush:
        RouteName = 'CodePushPage';
        break;
    }

    if (RouteName) {
      NavigationUtil.goPage(params, RouteName);
    }
  };

  const getItem = menu => {
    return ViewUtil.getMenuItem(onClick, menu, themeColor);
  };
  return (
    <ScrollView>
      <TouchableOpacity
        style={styles.item}
        onPress={() => onClick(MORE_MENU.About)}>
        <View style={styles.about_left}>
          <Ionicons
            name={MORE_MENU.About.icon}
            size={40}
            style={{
              marginRight: 10,
              color: themeColor,
            }}
          />
          <Text>GitHub Popular</Text>
        </View>
        <Ionicons
          name={'arrow-forward'}
          size={16}
          style={{
            marginRight: 10,
            alignSelf: 'center',
            color: themeColor,
          }}
        />
      </TouchableOpacity>

      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.Tutorial)}

      {/*趋势管理*/}
      <Text style={styles.groupTitle}>趋势管理</Text>
      {/*自定义语言*/}
      {getItem(MORE_MENU.Custom_Language)}
      {/*语言排序*/}
      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.Sort_Language)}

      {/*最热管理*/}
      <Text style={styles.groupTitle}>最热管理</Text>
      {/*自定义标签*/}
      {getItem(MORE_MENU.Custom_Key)}
      {/*标签排序*/}
      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.Sort_Key)}
      {/*标签移除*/}
      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.Remove_Key)}

      {/*设置*/}
      <Text style={styles.groupTitle}>设置</Text>
      {/*自定义主题*/}
      {getItem(MORE_MENU.Custom_Theme)}
      {/*关于作者*/}
      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.About_Author)}
      <View style={GlobalStyles.line} />
      {/*反馈*/}
      {getItem(MORE_MENU.Feedback)}
      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.CodePush)}
    </ScrollView>
  );
};

export default MyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  about_left: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  item: {
    backgroundColor: 'white',
    padding: 10,
    height: 90,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  groupTitle: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 12,
    color: 'gray',
  },
});

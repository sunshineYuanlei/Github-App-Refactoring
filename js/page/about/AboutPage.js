import React, {useState} from 'react';
import {View, Linking} from 'react-native';
import NavigationUtil from '../../navigator/NavigationUtil';
import {MORE_MENU} from '../../common/MORE_MENU';
import ViewUtil from '../../util/ViewUtil';
import AboutCommon, {FLAG_ABOUT} from './AboutCommon';
import config from '../../res/data/config';
import GlobalStyles from '../../res/styles/GlobalStyles';
import {useSelector} from 'react-redux';

const AboutPage = props => {
  const themeColor = useSelector(state => state.theme.theme);
  // 通过路由获取参数
  const params = props.route.params;
  const [state, setState] = useState({data: config});
  const aboutCommon = new AboutCommon(
    {
      ...params,
      theme: themeColor,
      navigation: props.navigation,
      flagAbout: FLAG_ABOUT.flag_about,
    },
    data => setState({...data}),
  );

  const onClick = menu => {
    let RouteName,
      params = {};
    switch (menu) {
      case MORE_MENU.Tutorial:
        RouteName = 'WebViewPage';
        params.title = '教程';
        params.url = 'https://coding.m.imooc.com/classindex.html?cid=89';
        break;
      case MORE_MENU.About_Author:
        RouteName = 'AboutMePage';
        break;
      case MORE_MENU.Feedback:
        const url = 'mailto://crazycodeboy@gmail.com';
        Linking.canOpenURL(url)
          .then(support => {
            if (!support) {
              console.log("Can't handle url: " + url);
            } else {
              Linking.openURL(url);
            }
          })
          .catch(e => {
            console.error('An error occurred', e);
          });
        break;
    }
    RouteName && NavigationUtil.goPage(params, RouteName);
  };

  const getItem = menu => {
    return ViewUtil.getMenuItem(onClick, menu, themeColor);
  };

  const content = (
    <View>
      {getItem(MORE_MENU.Tutorial)}
      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.About_Author)}
      <View style={GlobalStyles.line} />
      {getItem(MORE_MENU.Feedback)}
    </View>
  );
  // state.data.app - {name, avatar, backgroundImg, description}
  // 使用公共组装类的render方法进行渲染, content - 内容元素, state.data.app - 核心属性需要的参数, 保存在json中
  return aboutCommon.render(content, state.data.app);
};

export default AboutPage;

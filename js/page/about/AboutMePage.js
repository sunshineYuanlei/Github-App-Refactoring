import React, {useState} from 'react';
import {Linking, View, Clipboard} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NavigationUtil from '../../navigator/NavigationUtil';
import config from '../../res/data/config';
import GlobalStyles from '../../res/styles/GlobalStyles';
import ViewUtil from '../../util/ViewUtil';
import AboutCommon, {FLAG_ABOUT} from './AboutCommon';
import {useSelector} from 'react-redux';
import Toast from 'react-native-root-toast';

const AboutMePage = props => {
  const themeColor = useSelector(state => state.theme.theme);
  // 通过路由获取参数
  const {params} = props.route;
  const initState = {
    data: config,
    showTutorial: true,
    showBlog: false,
    showQQ: false,
    showContact: false,
  };
  const [state, setState] = useState(initState);

  // toast实现
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  let timeout = null;

  const aboutCommon = new AboutCommon(
    {
      ...params,
      theme: themeColor,
      navigation: props.navigation,
      flagAbout: FLAG_ABOUT.flag_about_me,
    },
    data => setState({...state, ...data}),
  );

  const _item = (data, isShow, key) => {
    return ViewUtil.getSettingItem(
      () => {
        setState({...state, [key]: !state[key]});
      },
      data.name,
      themeColor,
      Ionicons,
      data.icon,
      isShow ? 'arrow-up' : 'arrow-down',
      data,
    );
  };

  /**
   * 显示列表数据
   * @param diccls
   * @param isShowAccount
   */
  const renderItems = (dic, isShowAccount) => {
    if (!dic) return null;
    let views = [];
    for (let i in dic) {
      let title = isShowAccount
        ? dic[i].title + ':' + dic[i].account
        : dic[i].title;
      views.push(
        <View key={i}>
          {ViewUtil.getSettingItem(
            onClick,
            title,
            themeColor,
            null,
            null,
            null,
            dic[i],
          )}
          <View style={GlobalStyles.line} />
        </View>,
      );
    }
    return views;
  };

  const onClick = async tab => {
    if (!tab) return;
    const {url, title, account} = tab;
    if (url) {
      NavigationUtil.goPage(
        {
          title: tab.title,
          url: tab.url,
        },
        'WebViewPage',
      );
      return;
    }
    if (account && account.includes('@')) {
      let url = 'mailto://' + account;
      const supported = await Linking.canOpenURL(url).catch(err =>
        console.error('An error occurred', err),
      );
      if (!supported) {
        console.log("Can't handle url: " + url);
      } else {
        Linking.openURL(url);
      }
      return;
    }
    if (account) {
      Clipboard.setString(account);
      const msg = title + account + '已复制到剪切板。';
      setToastMessage(msg);
      setToastVisible(true);
      timeout = setTimeout(() => {
        setToastMessage('');
        setToastVisible(false);
        clearTimeout(timeout);
        timeout = null;
      }, 1000);
    }
  };

  const content = (
    <View>
      {_item(state.data.aboutMe.Tutorial, state.showTutorial, 'showTutorial')}
      <View style={GlobalStyles.line} />
      {state.showTutorial
        ? renderItems(state.data.aboutMe.Tutorial.items)
        : null}

      {_item(state.data.aboutMe.Blog, state.showBlog, 'showBlog')}
      <View style={GlobalStyles.line} />
      {state.showBlog ? renderItems(state.data.aboutMe.Blog.items) : null}

      {_item(state.data.aboutMe.QQ, state.showQQ, 'showQQ')}
      <View style={GlobalStyles.line} />
      {state.showQQ ? renderItems(state.data.aboutMe.QQ.items, true) : null}

      {_item(state.data.aboutMe.Contact, state.showContact, 'showContact')}
      <View style={GlobalStyles.line} />
      {state.showContact
        ? renderItems(state.data.aboutMe.Contact.items, true)
        : null}
    </View>
  );
  return (
    <View style={{flex: 1}}>
      {aboutCommon.render(content, state.data.author)}

      <Toast
        visible={toastVisible}
        position={50}
        shadow={false}
        animation={false}
        hideOnPress={true}>
        {toastMessage}
      </Toast>
    </View>
  );
};

export default AboutMePage;

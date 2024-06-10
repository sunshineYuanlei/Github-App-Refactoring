import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  DeviceInfo,
  Share,
} from 'react-native';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import ViewUtil from '../util/ViewUtil';
import {WebView} from 'react-native-webview';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import share from '../res/data/share';
// import ShareUtil from '../util/ShareUtil';
import NavigationUtil from '../navigator/NavigationUtil';
import FavoriteDao from '../expand/dao/FavoriteDao';
import {useSelector} from 'react-redux';
import BackPressComponent from '../common/BackPressComponent';

const TRENDING_URL = 'https://github.com/';

const DetailPage = props => {
  const params = props.route.params; // 导航传参
  const {projectModel, flag, callBack} = params;
  // flag参数的用途
  const favoriteDao = new FavoriteDao(flag);
  // projectModel参数的用途
  const url =
    projectModel.item.html_url || TRENDING_URL + projectModel.item.fullName;
  const title = projectModel.item.full_name || projectModel.item.fullName;
  // 全局主题
  const themeColor = useSelector(state => state.theme.theme);

  const initState = {
    url,
    isFavorite: projectModel.isFavorite,
    canGoBack: false,
  };

  const [state, setState] = useState(initState);
  const [myWebView, setMyWebView] = useState(null);

  const onBack = () => {
    //高版本react-native-webview 在Android上存在webView.goBack()没有回调onNavigationStateChange的bug
    //在此bug 未修复之前可以直接通过NavigationUtil.goBack(this.props.navigation) 返回上一页来规避
    if (state.canGoBack && Platform.OS === 'ios') {
      myWebView.goBack();
    } else {
      NavigationUtil.goBack(props.navigation);
    }
  };

  const onBackPress = () => {
    onBack();
    return true;
  };

  const backPress = new BackPressComponent({backPress: () => onBackPress()});

  useEffect(() => {
    backPress.componentDidMount();
    return () => {
      backPress.componentWillUnmount();
    };
  }, []);

  const onFavoriteButtonClick = () => {
    const isFavorite = !projectModel.isFavorite;
    // 更新本组件的Item的收藏状态
    setState({...state, isFavorite});
    // 更新主界面的Item的收藏状态
    callBack(isFavorite);
    // 更新持久化缓存的Item的收藏状态
    let key = projectModel.item.fullName || projectModel.item.id.toString();
    if (isFavorite) {
      favoriteDao.saveFavoriteItem(key, JSON.stringify(projectModel.item));
    } else {
      favoriteDao.removeFavoriteItem(key);
    }
  };

  const onShare = async ({url, title}) => {
    try {
      const result = await Share.share({
        title: title,
        url: url,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // 用户使用的分享应用
          console.log('分享应用:', result.activityType);
        } else {
          console.log('分享取消');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('分享面板被关闭');
      }
    } catch (error) {
      console.error('分享出错:', error);
    }
  };

  const renderRightButton = (
    <View style={{flexDirection: 'row', paddingTop: 6}}>
      <TouchableOpacity onPress={onFavoriteButtonClick}>
        <FontAwesome
          name={state.isFavorite ? 'star' : 'star-o'}
          size={20}
          style={{color: 'white', marginRight: 10}}
        />
      </TouchableOpacity>
      {/* ? */}
      {ViewUtil.getShareButton(() => {
        let shareApp = share.share_app;
        const {url, title} = shareApp;
        onShare({url, title});
        // ShareUtil.shareboard( // ?
        //   shareApp.content,
        //   shareApp.imgUrl,
        //   state.url,
        //   shareApp.title,
        //   [0, 1, 2, 3, 4, 5, 6],
        //   (code, message) => {
        //     console.log('result:' + code + message);
        //   },
        // );
      })}
    </View>
  );

  const onNavigationStateChange = navState => {
    const {canGoBack, url} = navState;
    setState({...state, canGoBack, url});
  };

  return (
    <SafeAreaViewPlus style={styles.container} topColor={themeColor}>
      {/* 顶部状态栏 */}
      <View style={{...styles.inner, backgroundColor: themeColor}}>
        {ViewUtil.getLeftBackButton(onBack)}
        <View>
          <Text
            style={{...styles.title, paddingRight: title.length > 20 ? 30 : 3}}>
            {title.length > 20 ? `...${title.slice(0, 20)}` : title}
          </Text>
        </View>
        {renderRightButton}
      </View>
      <WebView
        style={styles.webView}
        ref={setMyWebView}
        source={{uri: state.url}}
        onNavigationStateChange={e => onNavigationStateChange(e)}
        startInLoadingState={true}
      />
    </SafeAreaViewPlus>
  );
};

export default DetailPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 类似 Platform.OS !== 'ios'
    marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0,
  },
  inner: {
    height: 37.5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    padding: 3,
    color: 'white',
    fontSize: 17,
  },
  webView: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
});

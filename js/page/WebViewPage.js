import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import BackPressComponent from '../common/BackPressComponent';
import {WebView} from 'react-native-webview';
import {useSelector} from 'react-redux';
import NavigationUtil from '../navigator/NavigationUtil';
import ViewUtil from '../util/ViewUtil';
import SafeAreaViewPlus from 'react-native-safe-area-plus';

const WebViewPage = props => {
  const themeColor = useSelector(state => state.theme.theme);
  const params = props.route.params;
  const {url, title} = params;
  const initState = {url, title, canGoBack: false};
  const [state, setState] = useState(initState);
  const [myWebView, setMyWebView] = useState(null);

  // WebView内返回处理
  const backPress = new BackPressComponent({backPress: () => onBackPress()});
  useEffect(() => {
    backPress.componentDidMount();
    return () => {
      backPress.componentWillUnmount();
    };
  }, []);

  const onBackPress = () => {
    onBack();
    return true;
  };
  const onBack = () => {
    if (state.canGoBack) {
      myWebView.goBack();
    } else {
      NavigationUtil.goBack(props.navigation);
    }
  };

  const onNavigationStateChange = navState => {
    setState({...state, canGoBack: navState.canGoBack, url: navState.url});
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
        <View style={styles.right}></View>
      </View>
      <WebView
        ref={setMyWebView}
        source={{uri: state.url}}
        onNavigationStateChange={e => onNavigationStateChange(e)}
        startInLoadingState={true}
      />
    </SafeAreaViewPlus>
  );
};

export default WebViewPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    padding: 3,
    color: 'white',
    fontSize: 17,
  },
  inner: {
    height: 37.5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  right: {
    width: 1,
    height: 1,
    opacity: 1,
  },
});

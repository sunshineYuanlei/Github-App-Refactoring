import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NavigationUtil from '../navigator/NavigationUtil';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import PopularItem from '../common/PopularItem';
import Toast from 'react-native-root-toast';
import FavoriteDao from '../expand/dao/FavoriteDao';
import {FLAG_STORAGE} from '../expand/dao/DataStore';
import FavoriteUtil from '../util/FavoriteUtil';
import LanguageDao, {FLAG_LANGUAGE} from '../expand/dao/LanguageDao';
import BackPressComponent from '../common/BackPressComponent';
import GlobalStyles from '../res/styles/GlobalStyles';
import ViewUtil from '../util/ViewUtil';
import {
  setRefreshSearchAsync,
  setLoadMoreSearchAsync,
  setSearchCancel,
  initState,
  setShowBottomButton
} from '../redux/searchSlice';
import {setLoadLanguageAsync} from '../redux/languageSlice';
import {useSelector, useDispatch} from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

// 用于获取拥有本地收藏状态的popularItems
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular);
// 用于持久化保存标签数据
const languageDao = new LanguageDao(FLAG_LANGUAGE.flag_key);

const pageSize = 10; // 设为常量，防止修改

const SearchPage = props => {
  // 主题
  const themeColor = useSelector(state => state.theme.theme);
  // 获取store中的标签数据
  const popularKeys = useSelector(state => state.language.keys);
  const search = useSelector(state => state.search);
  const {isLoading, projectModels, showBottomButton} = search;

  // 用于实现保存标签功能
  const [isKeyChange, setIsKeyChange] = useState(false);
  // 用于实现取消异步请求功能
  const [token, setToken] = useState('');

  const dispatch = useDispatch();
  const [input, setInput] = useState(null);
  const [inputKeyLocal, setInputKeyLocal] = useState('');

  useEffect(() => {
    dispatch(initState());
  }, []);

  const backPress = new BackPressComponent({backPress: e => onBackPress(e)});
  useEffect(() => {
    backPress.componentDidMount();
    return () => {
      backPress.componentWillUnmount();
    };
  }, []);
  const onBackPress = () => {
    dispatch(setSearchCancel()); // 退出时取消搜索 - UI
    input.blur(); // - UI

    // 退出当前导航时store更新标签 - 其它界面UI
    if (isKeyChange) {
      dispatch(
        setLoadLanguageAsync({flag: FLAG_LANGUAGE.flag_key, key: 'keys'}),
      );
    }

    // 退出当前导航
    NavigationUtil.goBack(props.navigation);
    return true;
  };

  // 设置异步请求接口消息提醒
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isHiddenLoadMore, setIsHiddenLoadMore] = useState(false);
  let timeout = null;
  const setToastMsg = (msg, time = 1000) => {
    setToastMessage(msg);
    setToastVisible(true);
    setIsHiddenLoadMore(true);
    timeout = setTimeout(() => {
      setToastMessage('');
      setToastVisible(false);
      setIsHiddenLoadMore(false);
      clearTimeout(timeout);
      timeout = null;
    }, time);
  };

  // 加载数据公用方法
  const loadData = loadMore => {
    const {pageIndex, items} = search;
    if (loadMore) {
      //已加载完全部数据
      if (pageIndex * pageSize >= items?.length) {
        setToastMsg('没有更多了');
      } else {
        dispatch(
          setLoadMoreSearchAsync({
            dataArray: items,
            pageIndex: pageIndex + 1,
            pageSize,
            favoriteDao,
          }),
        );
      }
    } else {
      const tokenNow = performance.now();
      setToken(tokenNow);
      const callBack = msg => {
        setToastMsg(msg);
      };
      dispatch(
        setRefreshSearchAsync({
          inputKey: inputKeyLocal,
          popularKeys,
          token: tokenNow,
          favoriteDao,
          pageSize,
          callBack,
        }),
      );
    }
  };

  const renderNavBar = () => {
    const {showText} = search;
    const placeholder = '请输入';
    let backButton = ViewUtil.getLeftBackButton(() => onBackPress());
    let inputView = (
      <TextInput
        ref={setInput}
        placeholder={placeholder}
        onChangeText={text => setInputKeyLocal(text.trim())}
        style={styles.textInput}></TextInput>
    );
    let rightButton = (
      <TouchableOpacity
        onPress={() => {
          input.blur(); // 收起键盘
          onRightButtonClick();
        }}>
        <View style={{marginRight: 10}}>
          <Text style={styles.title}>{showText}</Text>
        </View>
      </TouchableOpacity>
    );

    const onRightButtonClick = () => {
      if (search.showText === '搜索') {
        // 发起搜索/下拉刷新
        loadData();
      } else {
        dispatch(setSearchCancel(token));
      }
    };

    return (
      <View
        style={{
          backgroundColor: themeColor,
          flexDirection: 'row',
          alignItems: 'center',
          // height: Platform.OS === 'ios' ? GlobalStyles.nav_bar_height_ios : GlobalStyles.nav_bar_height_android,
        }}>
        {backButton}
        {inputView}
        {rightButton}
      </View>
    );
  };

  const indicatorView = (
    <ActivityIndicator
      style={styles.centering}
      size="large"
      animating={isLoading}
    />
  );

  let canLoadMore = true;
  const listView = (
    <FlatList
      data={projectModels}
      renderItem={data => renderItem(data)}
      keyExtractor={item => '' + item.item.id}
      contentInset={{
        bottom: 45,
      }}
      refreshControl={
        <RefreshControl
          title={'Loading'}
          refreshing={isLoading}
          titleColor={themeColor}
          colors={[themeColor]}
          tintColor={themeColor}
          onRefresh={() => loadData()}
        />
      }
      ListFooterComponent={() => genIndicator()}
      onEndReached={() => {
        console.log('---onEndReached----');
        setTimeout(() => {
          if (canLoadMore) {
            //fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
            loadData(true);
            canLoadMore = false;
          }
        }, 100);
      }}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => {
        canLoadMore = true; //fix 初始化时页调用onEndReached的问题
        console.log('---onMomentumScrollBegin-----');
      }}
    />
  );

  const renderItem = data => {
    const item = data.item;
    return (
      <PopularItem
        projectModel={item}
        theme={themeColor}
        onSelect={callBack => {
          NavigationUtil.goPage(
            {
              projectModel: item,
              flag: FLAG_STORAGE.flag_popular,
              callBack,
            },
            'DetailPage',
          );
        }}
        onFavorite={(item, isFavorite) =>
          FavoriteUtil.onFavorite(favoriteDao, item, isFavorite)
        }
      />
    );
  };

  const genIndicator = () => {
    if (search?.items?.length < 10) return null;
    if (isHiddenLoadMore) return null;
    return search.hideLoadingMore ? null : (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator style={styles.indicator} />
        <Text>正在加载更多</Text>
      </View>
    );
  };

  const bottomButton = showBottomButton ? (
    <TouchableOpacity
      style={[styles.bottomButton, {backgroundColor: themeColor}]}
      onPress={() => {
        saveKey();
      }}>
      <View style={{justifyContent: 'center'}}>
        <Text style={styles.title}>朕收下了</Text>
      </View>
    </TouchableOpacity>
  ) : null;

  const saveKey = () => {
    let key = inputKeyLocal;
    let keys = cloneDeep(popularKeys);
    key = {
      path: key,
      name: key,
      checked: true,
    };
    keys.unshift(key); // 将key添加到数组的开头
    // 持久化保存标签数据
    languageDao.save(keys);
    // 配合onBackPress在返回当前导航时更新store中的标签数据
    setIsKeyChange(true);
    setToastMsg(key.name + '保存成功');
    // 隐藏按钮
    dispatch(setShowBottomButton(false))
  };

  return (
    <SafeAreaViewPlus topColor={themeColor}>
      {/* {statusBar} */}
      {renderNavBar()}
      {!isLoading ? listView : indicatorView}
      {bottomButton}
      <Toast
        visible={toastVisible}
        position={50}
        shadow={false}
        animation={false}
        hideOnPress={true}>
        {toastMessage}
      </Toast>
    </SafeAreaViewPlus>
  );
};

export default SearchPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabStyle: {
    // minWidth: 50 //fix minWidth会导致tabStyle初次加载时闪烁
    padding: 0,
  },
  indicatorStyle: {
    height: 2,
    backgroundColor: 'white',
  },
  labelStyle: {
    fontSize: 13,
    margin: 0,
  },
  indicatorContainer: {
    alignItems: 'center',
  },
  indicator: {
    color: 'red',
    margin: 10,
  },
  statusBar: {
    height: 20,
  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
    height: 40,
    position: 'absolute',
    left: 10,
    top: GlobalStyles.window_height - 90,
    right: 10,
    borderRadius: 3,
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  textInput: {
    flex: 1,
    height: Platform.OS === 'ios' ? 30 : 40,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: 'white',
    alignSelf: 'center',
    paddingLeft: 5,
    marginRight: 10,
    marginLeft: 5,
    borderRadius: 3,
    opacity: 0.7,
    color: 'white',
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
});

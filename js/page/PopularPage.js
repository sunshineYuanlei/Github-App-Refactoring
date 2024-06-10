import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import {tabNav} from '../navigator/NavigationDelegate';
import {useSelector, useDispatch} from 'react-redux';
import {
  setRefreshPopularAsync,
  setLoadMorePopularAsync,
  setFlushPopularFavorite,
} from '../redux/popularSlice';
import {setLoadLanguageAsync} from '../redux/languageSlice';
import FavoriteDao from '../expand/dao/FavoriteDao';
import {FLAG_STORAGE} from '../expand/dao/DataStore';
import PopularItem from '../common/PopularItem';
import Toast from 'react-native-root-toast';
import {Tops} from '../common/LayoutComponent';
import NavigationUtil from '../navigator/NavigationUtil';
import FavoriteUtil from '../util/FavoriteUtil';
import EventBus from 'react-native-event-bus';
import EventTypes from '../util/EventTypes';
import {FLAG_LANGUAGE} from '../expand/dao/LanguageDao';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import langs from '../res/data/langs';
// import keyss from '../res/data/keys';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const URL = 'https://api.github.com/search/repositories?q=';
const QUERY_STR = '&sort=stars'; // 按点赞数进行排序
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular);
const pageSize = 10; //设为常量，防止修改
const THEME_COLOR = 'green';

const PopularTabPage = props => {
  // 标签和语言数据复位
  // AsyncStorage.setItem('language_dao_language', JSON.stringify(langs));
  // AsyncStorage.setItem('language_dao_key', JSON.stringify(keyss));

  const themeColor = useSelector(state => state.theme.theme);
  const extra = {};

  const dispatch = useDispatch();
  const language = useSelector(state => state.language);

  useEffect(() => {
    if (!language?.keys?.length) {
      dispatch(
        setLoadLanguageAsync({flag: FLAG_LANGUAGE.flag_key, key: 'keys'}),
      );
    }
  }, [language.keys]);

  const keys = language.keys;
  const TabNavigator = keys?.length
    ? tabNav({
        Component: PopularTab,
        theme: {themeColor},
        keys,
        extra,
      })
    : null;

  const renderRightButton = () => {
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 5,
          top: Platform.OS === 'ios' ? 5 : 15,
        }}
        onPress={() => {
          //新版本友盟SDK 时间统计方法由 track -> onEvent
          // AnalyticsUtil.onEvent('SearchButtonClick');
          NavigationUtil.goPage({}, 'SearchPage');
        }}>
        <View style={{padding: 5, marginRight: 8}}>
          <Ionicons
            name={'search'}
            size={24}
            style={{
              marginRight: 8,
              alignSelf: 'center',
              color: 'white',
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaViewPlus style={styles.container} topColor={themeColor}>
      <Tops title="最热" backgroundColor={themeColor} />
      {renderRightButton()}
      <View style={styles.container}>{TabNavigator}</View>
    </SafeAreaViewPlus>
  );
};

export default PopularTabPage;

const PopularTab = props => {
  const {
    tabLabel: storeName,
    theme: {themeColor},
  } = props;

  const dispatch = useDispatch();

  const popular = useSelector(state => state.popular);
  let store = popular[storeName]; // 动态获取state
  if (!store) {
    store = {
      items: [],
      projectModels: [], //要显示的数据
      isLoading: false,
      hideLoadingMore: true, //默认隐藏加载更多
    };
  }

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isHiddenLoadMore, setIsHiddenLoadMore] = useState(false);
  let timeout = null;

  const loadData = (loadMore, refreshFavorite) => {
    const {pageIndex, items} = store;
    const url = genFetchUrl(storeName);

    if (loadMore) {
      //已加载完全部数据
      if (pageIndex * pageSize >= items?.length) {
        setToastMessage('没有更多了');
        setToastVisible(true);
        setIsHiddenLoadMore(true);
        timeout = setTimeout(() => {
          setToastMessage('');
          setToastVisible(false);
          setIsHiddenLoadMore(false);
          clearTimeout(timeout);
          timeout = null;
        }, 1000);
      } else {
        dispatch(
          setLoadMorePopularAsync({
            storeName,
            dataArray: store.items,
            pageIndex: ++store.pageIndex,
            pageSize,
            favoriteDao,
          }),
        );
      }
    } else if (refreshFavorite) {
      dispatch(
        setFlushPopularFavorite({
          storeName,
          pageIndex: store.pageIndex,
          pageSize,
          dataArray: store.items,
          favoriteDao,
        }),
      );
    } else {
      dispatch(setRefreshPopularAsync({storeName, url, favoriteDao, pageSize}));
    }
  };

  const genFetchUrl = key => URL + key + QUERY_STR;

  let isFavoriteChanged = false;
  let favoriteChangeListener = null;
  let bottomTabSelectListener = null;
  useEffect(() => {
    // 首次加载全部数据
    loadData();

    // 添加事件总线 - 事件监听
    EventBus.getInstance().addListener(
      EventTypes.favorite_changed_popular,
      (favoriteChangeListener = () => {
        isFavoriteChanged = true;
      }),
    );
    EventBus.getInstance().addListener(
      EventTypes.bottom_tab_select,
      (bottomTabSelectListener = data => {
        if (data.to === 0 && isFavoriteChanged) {
          loadData(null, true);
        }
      }),
    );

    return () => {
      EventBus.getInstance().removeListener(favoriteChangeListener);
      EventBus.getInstance().removeListener(bottomTabSelectListener);
      favoriteChangeListener = null;
      bottomTabSelectListener = null;
    };
  }, []);

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
    if (store?.items?.length < 10) return null;
    if (isHiddenLoadMore) return null;
    return store.hideLoadingMore ? null : (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator style={styles.indicator} />
        <Text>正在加载更多</Text>
      </View>
    );
  };

  let canLoadMore = true;

  return (
    <View>
      <FlatList
        data={store.projectModels}
        renderItem={data => renderItem(data)}
        keyExtractor={item => item.item.id.toString()}
        refreshControl={
          <RefreshControl
            title="Loading"
            titleColor={themeColor}
            colors={[themeColor]}
            tintColor={themeColor}
            refreshing={store.isLoading}
            onRefresh={loadData}
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
      <Toast
        visible={toastVisible}
        position={50}
        shadow={false}
        animation={false}
        hideOnPress={true}>
        {toastMessage}
      </Toast>
      {/* <Toast
        visible={true}
        position={50}
        shadow={false}
        animation={false}
        hideOnPress={true}>
        {popular[storeName]?.projectModels?.length}
        {store?.pageIndex}
      </Toast> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabStyle: {
    minWidth: 50,
  },
  indicatorStyle: {
    height: 2,
    backgroundColor: 'white',
  },
  labelStyle: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 6,
  },
  indicatorContainer: {
    alignItems: 'center',
  },
  indicator: {
    color: 'red',
    margin: 10,
  },
});

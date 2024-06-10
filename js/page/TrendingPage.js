import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import {tabNav} from '../navigator/NavigationDelegate';
import {useSelector, useDispatch} from 'react-redux';
import {
  setRefreshTrendingAsync,
  setLoadMoreTrendingAsync,
  setFlushTrendingFavorite
} from '../redux/trendingSlice';
import FavoriteDao from '../expand/dao/FavoriteDao';
import {FLAG_STORAGE} from '../expand/dao/DataStore';
import TrendingItem from '../common/TrendingItem';
import Toast from 'react-native-root-toast';
import {Tops} from '../common/LayoutComponent';
import NavigationUtil from '../navigator/NavigationUtil';
import FavoriteUtil from '../util/FavoriteUtil';
import EventBus from 'react-native-event-bus';
import EventTypes from '../util/EventTypes';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import {setLoadLanguageAsync} from '../redux/languageSlice';
import {FLAG_LANGUAGE} from '../expand/dao/LanguageDao';

const URL = 'https://github.com/trending/';
const QUERY_STR = '?since=daily'; // 按点赞数进行排序

const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_trending);
const pageSize = 10; //设为常量，防止修改
const THEME_COLOR = 'green';

const TrendingTabPage = props => {
  const themeColor = useSelector(state => state.theme.theme);
  const extra = {};
  const dispatch = useDispatch();
  const language = useSelector(state => state.language);
  useEffect(() => {
    if (!language?.languages?.length) {
      dispatch(
        setLoadLanguageAsync({flag: FLAG_LANGUAGE.flag_language, key: 'languages'}),
      );
    }
  }, [language.languages]);

  const keys = language.languages || [];

  const TabNavigator = keys.length
    ? tabNav({
        Component: TrendingTab,
        theme: {themeColor},
        keys,
        extra,
      })
    : null;
  return (
    <SafeAreaViewPlus style={styles.container} topColor={themeColor}>
      <Tops title="趋势" backgroundColor={themeColor} />
      <View style={styles.container}>{TabNavigator}</View>
    </SafeAreaViewPlus>
  );
};

export default TrendingTabPage;

const TrendingTab = props => {
  const {
    tabLabel: storeName,
    theme: {themeColor},
  } = props;

  const dispatch = useDispatch();

  const trending = useSelector(state => state.trending);
  let store = trending[storeName]; // 动态获取state
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
          setLoadMoreTrendingAsync({
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
        setFlushTrendingFavorite({
          storeName,
          pageIndex: store.pageIndex,
          pageSize,
          dataArray: store.items,
          favoriteDao,
        }),
      );
    } else {
      dispatch(
        setRefreshTrendingAsync({storeName, url, favoriteDao, pageSize}),
      );
    }
  };

  const genFetchUrl = key => URL + key + QUERY_STR;

  let isFavoriteChanged = false;
  let favoriteChangeListener = null;
  let bottomTabSelectListener = null;

  useEffect(() => {
    loadData();

    // 添加事件总线 - 事件监听
    EventBus.getInstance().addListener(
      EventTypes.favorite_changed_trending,
      (favoriteChangeListener = () => {
        isFavoriteChanged = true;
      }),
    );
    EventBus.getInstance().addListener(
      EventTypes.bottom_tab_select,
      (bottomTabSelectListener = data => {
        if (data.to === 1 && isFavoriteChanged) {
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
      <TrendingItem
        projectModel={item}
        theme={themeColor}
        onSelect={callBack => {
          NavigationUtil.goPage(
            {
              projectModel: item,
              callBack,
              flag: FLAG_STORAGE.flag_trending,
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
        keyExtractor={item => item.item.fullName.toString()}
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

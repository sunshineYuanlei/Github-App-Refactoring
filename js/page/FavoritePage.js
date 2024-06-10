import React, {useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  View
} from 'react-native';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import {tabNav} from '../navigator/NavigationDelegate';
import {useSelector, useDispatch} from 'react-redux';
import {setLoadMoreFavoriteAsync} from '../redux/favoriteSlice';
import FavoriteDao from '../expand/dao/FavoriteDao';
import {FLAG_STORAGE} from '../expand/dao/DataStore';
import PopularItem from '../common/PopularItem';
import TrendingItem from '../common/TrendingItem';
import {Tops} from '../common/LayoutComponent';
import NavigationUtil from '../navigator/NavigationUtil';
import FavoriteUtil from '../util/FavoriteUtil';
import EventBus from 'react-native-event-bus';
import EventTypes from '../util/EventTypes';

const TABS = [
  {name: '最热', checked: true},
  {name: '趋势', checked: true},
];

const THEME_COLOR = 'green';

const FavoriteTabPage = props => {
  const themeColor = useSelector(state => state.theme.theme);
  const extra = {tabStyle: styles.tabStyle};
  const TabNavigator = tabNav({
    Component: FavoriteTab,
    theme: {themeColor},
    keys: TABS,
    extra,
  });
  return (
    <SafeAreaViewPlus style={styles.container} topColor={themeColor}>
      <Tops title="收藏" backgroundColor={themeColor} />
      <View style={styles.container}>{TabNavigator}</View>
    </SafeAreaViewPlus>
  );
};

export default FavoriteTabPage;

const FavoriteTab = props => {
  const {
    tabLabel,
    theme: {themeColor},
  } = props;

  const storeName =
    tabLabel === '最热'
      ? FLAG_STORAGE.flag_popular
      : FLAG_STORAGE.flag_trending;
  const favoriteDao = new FavoriteDao(storeName);

  const dispatch = useDispatch();

  const favorite = useSelector(state => state.favorite);
  let store = favorite[storeName]; // 动态获取state
  if (!store) {
    store = {
      items: [],
      projectModels: [], //要显示的数据
    };
  }

  const loadData = isShowLoading => {
    dispatch(setLoadMoreFavoriteAsync({storeName, isShowLoading}));
  };

  let listener = null;
  useEffect(() => {
    // 首次加载全部数据
    loadData(true);

    // 事件总线 - 事件监听
    EventBus.getInstance().addListener(
      EventTypes.bottom_tab_select,
      (listener = data => {
        if (data.to === 2) {
          loadData(false);
        }
      }),
    );

    return () => {
      EventBus.getInstance().removeListener(listener);
    };
  }, []);

  const onFavorite = (item, isFavorite) => {
    FavoriteUtil.onFavorite(favoriteDao, item, isFavorite);
    storeName === FLAG_STORAGE.flag_popular
      ? EventBus.getInstance().fireEvent(EventTypes.favorite_changed_popular)
      : EventBus.getInstance().fireEvent(EventTypes.favorite_changed_trending);
  };

  const renderItem = data => {
    const item = data.item;
    const Item =
      storeName === FLAG_STORAGE.flag_popular ? PopularItem : TrendingItem;
    return (
      <Item
        projectModel={item}
        theme={themeColor}
        onSelect={callBack => {
          NavigationUtil.goPage(
            {
              projectModel: item,
              flag: storeName,
              callBack,
            },
            'DetailPage',
          );
        }}
        onFavorite={(item, isFavorite) => {
          onFavorite(item, isFavorite);
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={store.projectModels}
        renderItem={data => renderItem(data)}
        keyExtractor={item => (item.item.id || item.item.fullName) + ''}
        refreshControl={
          <RefreshControl
            title="Loading"
            titleColor={themeColor}
            colors={[themeColor]}
            tintColor={themeColor}
            refreshing={store.isLoading}
            onRefresh={() => loadData(true)}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabStyle: {
    padding: 0,
    width: 160,
  },
  // labelStyle: {
  //   color: 'white',
  //   fontSize: 16,
  //   margin: 0,
  //   textTransform: 'none', //取消大写
  // },
});

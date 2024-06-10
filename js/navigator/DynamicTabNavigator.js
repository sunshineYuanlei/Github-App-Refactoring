import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import FavoritePage from '../page/FavoritePage';
import MyPage from '../page/MyPage';
import PopularPage from '../page/PopularPage';
import TrendingPage from '../page/TrendingPage';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import EventBus from 'react-native-event-bus';
import EventTypes from '../util/EventTypes';

const Tab = createBottomTabNavigator();

const TABS = {
  //在这里配置页面的路由
  PopularPage: {
    screen: PopularPage,
    navigationOptions: {
      tabBarLabel: '最热',
      headerShown: false,
      tabBarIcon: ({color, focused}) => (
        <MaterialIcons name={'whatshot'} size={26} style={{color: color}} />
      ),
    },
  },
  TrendingPage: {
    screen: TrendingPage,
    navigationOptions: {
      tabBarLabel: '趋势',
      headerShown: false,
      tabBarIcon: ({color, focused}) => (
        <Ionicons name={'trending-up'} size={26} style={{color: color}} />
      ),
    },
  },
  FavoritePage: {
    screen: FavoritePage,
    navigationOptions: {
      tabBarLabel: '收藏',
      headerShown: false,
      tabBarIcon: ({color, focused}) => (
        <MaterialIcons name={'favorite'} size={26} style={{color: color}} />
      ),
    },
  },
  MyPage: {
    screen: MyPage,
    navigationOptions: {
      tabBarLabel: '我的',
      headerShown: false,
      tabBarIcon: ({color, focused}) => (
        <Entypo name={'user'} size={26} style={{color: color}} />
      ),
    },
  },
};

export default props => {
  const {PopularPage, TrendingPage, FavoritePage, MyPage} = TABS;
  const tabs = {PopularPage, TrendingPage, FavoritePage, MyPage};
  PopularPage.navigationOptions.tabBarLabel = '最热'; // 动态配置tab属性
  const themeColor = useSelector(state => state.theme.theme);

  const fireEvent = navigationState => {
    const {index: toIndex, history, routeNames} = navigationState;

    let fromIndex = 0;
    if (history.length > 1) {
      const fromRoute = history[history.length - 2];
      const {key} = fromRoute;
      for (let i = 0; i < routeNames.length; i++) {
        if (key.startsWith(routeNames[i])) {
          fromIndex = i;
          break;
        }
      }
    }

    EventBus.getInstance().fireEvent(EventTypes.bottom_tab_select, {
      //发送底部tab切换的事件
      from: fromIndex,
      to: toIndex,
    });
  };

  return (
    <Tab.Navigator
      tabBar={props => {
        fireEvent(props.state); // props.state -- 导航的状态
        return <BottomTabBar {...props} />;
      }}>
      {Object.entries(tabs).map(item => {
        return (
          <Tab.Screen
            key={item[0]}
            name={item[0]}
            component={item[1].screen}
            options={{
              ...item[1].navigationOptions,
              tabBarActiveTintColor: themeColor,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

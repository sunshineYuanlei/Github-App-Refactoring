import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {StyleSheet} from 'react-native';

const Tab = createMaterialTopTabNavigator();

export function tabNav({Component, keys, theme, extra} = {}) {
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true, // 懒加载, 切换一个tab, 加载一个
        tabBarItemStyle: extra.tabStyle || styles.tabStyle,
        tabBarScrollEnabled: true, //是否支持 选项卡滚动，默认false
        tabBarInactiveTintColor: 'white',
        tabBarActiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: theme.themeColor, //TabBar 的背景颜色
        },
        tabBarIndicatorStyle: styles.indicatorStyle, //标签指示器的样式
        tabBarLabelStyle: extra.labelStyle || styles.labelStyle, //文字的样式
      }}>
      {Object.entries(_genTabs({Component, keys, theme, extra})).map(item => {
        return (
          <Tab.Screen
            name={item[0]}
            key={item[0]}
            component={item[1].Screen}
            options={{
              ...item[1].navigationOptions,
              tabBarActiveTintColor: theme.themeColor,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

function _genTabs({Component, keys, theme, extra = {}} = {}) {
  const tabs = {};
  keys.forEach((item, index) => {
    if (item.checked) {
      tabs[`tab${index}`] = {
        //fix Got a component with the name 'screen' for the screen
        Screen: props => (
          <Component {...props} {...extra} tabLabel={item.name} theme={theme} />
        ), //初始化Component时携带默认参数 @https://github.com/react-navigation/react-navigation/issues/2392
        navigationOptions: {
          title: item.name,
        },
      };
    }
  });
  return tabs;
}

const styles = StyleSheet.create({
  tabStyle: {
    padding: 0,
  },
  indicatorStyle: {
    height: 2,
    backgroundColor: 'white',
  },
  labelStyle: {
    color: 'white',
    fontSize: 13,
    margin: 0,
    textTransform: 'none', //取消大写
  },
});

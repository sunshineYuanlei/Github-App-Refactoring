import React from 'react';
import {StyleSheet, Text, View, Button, SafeAreaView} from 'react-native';
import {tabNav} from '../navigator/NavigationDelegate';
import langs from '../res/data/langs.json';
import {Tops} from '../common/LayoutComponent';
import {setTheme} from '../redux/themeSlice';
import {useSelector, useDispatch} from 'react-redux';

export default props => {
  // const backgroundColor = '#2196f3'
  const themeColor = useSelector(state => state.theme.theme);
  const TabNavigator = langs.length
    ? tabNav({
        Component: TrendingTab,
        theme: {themeColor: themeColor},
        keys: langs,
      })
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <Tops title="趋势" backgroundColor={themeColor} />
      <View style={styles.container}>{TabNavigator}</View>
    </SafeAreaView>
  );
};

const TrendingTab = props => {
  const dispatch = useDispatch();
  const themeColor = useSelector(state => state.theme.theme);
  return (
    <View>
      <Text>{props.tabLabel}</Text>
      <Button
        color={themeColor}
        title="改变主题"
        onPress={() => {
          dispatch(setTheme('yellow'));
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

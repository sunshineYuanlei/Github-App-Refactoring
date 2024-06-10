import React, {useState} from 'react';
import {StyleSheet, Text, Button, View} from 'react-native';
import {tabNav} from '../navigator/NavigationDelegate';
import keys from '../res/data/keys.json';
import {Tops} from '../common/LayoutComponent';
import {setTheme} from '../redux/themeSlice';
import {useSelector, useDispatch} from 'react-redux';
import DataStore from '../expand/dao/DataStore';
import SafeAreaViewPlus from 'react-native-safe-area-plus';

export default props => {
  const themeColor = useSelector(state => state.theme.theme);
  const TabNavigator = keys.length
    ? tabNav({Component: PopularTab, theme: {themeColor: themeColor}, keys})
    : null;
  return (
    <SafeAreaViewPlus style={styles.container}>
      <Tops title="最热" backgroundColor={themeColor} />
      <View style={styles.container}>{TabNavigator}</View>
    </SafeAreaViewPlus>
  );
};

const PopularTab = props => {
  const dispatch = useDispatch();
  const themeColor = useSelector(state => state.theme.theme);
  const [showText, setShowText] = useState('');
  const loadData = () => {
    const url =
      'https://api.devio.org/uapi/popular?q=java&pageIndex=1&pageSize=25';
    new DataStore().fetchData(url).then(data => {
      debugger;
      setShowText(JSON.stringify(data));
      console.log(data);
    });
  };

  return (
    <View>
      <Text>{props.tabLabel}</Text>
      <Button
        color={themeColor}
        title="改变主题"
        onPress={() => {
          dispatch(setTheme('red'));
        }}
      />
      <Text>{showText}</Text>
      <Button title="获取数据" onPress={loadData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import React from 'react';
import NavigationUtil from '../navigator/NavigationUtil';
import DynamicTabNavigator from '../navigator/DynamicTabNavigator';
import {StatusBar, StyleSheet} from 'react-native';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import {useSelector, useDispatch} from 'react-redux';
import CustomTheme from '../page/CustomTheme';
import {setShowCustomThemeView} from '../redux/themeSlice';

const HomePage = props => {
  NavigationUtil.navigation = props.navigation;
  const themeColor = useSelector(state => state.theme.theme);
  const isShowCustomThemeView = useSelector(
    state => state.theme.isShowCustomThemeView,
  );
  const dispatch = useDispatch();
  const renderCustomThemeView = () => {
    return (
      <CustomTheme
        {...props}
        visible={isShowCustomThemeView}
        onClose={() => dispatch(setShowCustomThemeView(false))}
      />
    );
  };
  return (
    <SafeAreaViewPlus style={styles.container} topColor={themeColor}>
      <StatusBar backgroundColor={themeColor} barStyle="light-content" />
      <DynamicTabNavigator />
      {renderCustomThemeView()}
    </SafeAreaViewPlus>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

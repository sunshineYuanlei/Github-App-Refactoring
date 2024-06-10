import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {getBoarding} from '../util/BoardingUtil';
import NavigationUtil from '../navigator/NavigationUtil';
import {getThemeChangeAsync} from '../redux/themeSlice';
import {useDispatch} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';

const WelcomePage = props => {
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(null);
  useEffect(() => {
    SplashScreen.hide();
    dispatch(getThemeChangeAsync());
    doLanunch();
    return () => {
      timer && clearTimeout(timer);
    };
  }, []);

  const doLanunch = async () => {
    const boarding = await getBoarding();
    const {navigation} = props;
    setTimer(
      setTimeout(() => {
        if (boarding) {
          NavigationUtil.resetToHomPage({navigation});
        } else {
          NavigationUtil.login({navigation});
        }
      }, 200),
    );
  };

  return (
    <View style={styles.container}>
      <Text>WelcomePage</Text>
    </View>
  );
};

export default WelcomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

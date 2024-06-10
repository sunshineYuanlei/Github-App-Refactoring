import React, { useState } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import { ConfirmButton, Input, NavBar, Tips } from '../common/LoginComponent';
import LoginDao from '../expand/dao/LoginDao';
import NavigationUtil from '../navigator/NavigationUtil';
import {useSelector} from 'react-redux';

export default (props: any) => {
  const themeColor = useSelector(state => state.theme.theme);
  // 获取注入的导航器
  const { navigation } = props;
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [helpUrl, setHelpUrl] = useState('');
  const onLogin = () => {
    if (userName === '' || password === '') {
      setMsg('用户名或密码不能为空');
      return;
    }
    setHelpUrl('');
    setMsg('');
    LoginDao.getInstance()
      .login(userName, password)
      .then((res) => {
        NavigationUtil.resetToHomPage({ navigation });
      })
      .catch((e) => {
        const { code, data: { helpUrl = '' } = {}, msg } = e;
        setMsg(msg);
        setHelpUrl(helpUrl);
      });
  };
  return (
    <SafeAreaViewPlus style={styles.root} topColor={themeColor}>
      <NavBar
        title="登录"
        rightTitle="注册"
        onRightClick={() =>
          NavigationUtil.registration({ navigation })
        }
      />
      <View style={styles.line} />
      <View style={styles.content}>
        <View style={styles.line} />
        <Input
          label="用户名"
          placeholder="请输入用户名"
          shortLine={true}
          onChangeText={(text: string) => setUserName(text)}
        />
        <Input
          label="密码"
          placeholder="请输入密码"
          secure={true}
          onChangeText={(text: string) => setPassword(text)}
        />
        <ConfirmButton title="登录" onClick={onLogin} />
        <Tips msg={msg} helpUrl={helpUrl} />
      </View>
    </SafeAreaViewPlus>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingTop: 20,
    backgroundColor: '#F1F5F6',
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
  },
  line: {
    height: 0.5,
    backgroundColor: '#D0D4D4',
  },
});

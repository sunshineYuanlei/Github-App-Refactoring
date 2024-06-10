import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { get } from './expand/dao/HiNet'
import Constants from './expand/dao/Constants';
export default (props: any) => {
  const [msg, setMsg] = useState('');
  const doFetch = () => {
    // fetch('https://api.devio.org/uapi/test/test?requestPrams=OOO')
    //   .then(res => res.json())
    //   .then(result => {
    //     setMsg(JSON.stringify(result));
    //   })
    //   .catch(e => {
    //     console.log(e);
    //     setMsg(JSON.stringify(e));
    //   });
    get(Constants.test.api)({ requestPrams: "RN" }).then(result => {
      console.log('result', result);
      setMsg(JSON.stringify(result));
    }).catch(e => {
      console.log(e);
      setMsg(JSON.stringify(e));
    });
  };
  return (
    <SafeAreaView style={styles.root}>
      <TouchableOpacity onPress={doFetch}>
        <Text>加载</Text>
      </TouchableOpacity>
      <Text>{msg}</Text>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

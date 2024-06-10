import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const Tops = (props: any) => {
  const { title, backgroundColor } = props;
  return (
    <View style={{ ...styles.container, backgroundColor }}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    paddingTop: 20,
    color: 'white',
    fontSize: 20,
  }
});

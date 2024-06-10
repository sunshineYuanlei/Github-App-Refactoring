import React, { Component } from 'react';
import {
  StyleSheet,
  Text, View
} from 'react-native'; 
 
export default class Index extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>SortKeyPage</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
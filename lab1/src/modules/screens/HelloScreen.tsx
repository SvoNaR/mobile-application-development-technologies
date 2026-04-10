import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Пример из методички: Hello, world! */
export function HelloScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, world! (опять хд)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
  },
});

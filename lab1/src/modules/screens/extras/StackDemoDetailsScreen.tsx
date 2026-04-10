import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Экран из примера навигации методички (аналог Details) */
export function StackDemoDetailsScreen() {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Details Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
  },
});

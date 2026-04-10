import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExtrasStackParamList } from '../../../navigation/ExtrasStack';

type Props = NativeStackScreenProps<ExtrasStackParamList, 'StackDemoHome'>;

/** Экран из примера навигации методички (аналог Home) */
export function StackDemoHomeScreen({ navigation }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Home Screen</Text>
      <Button
        title="Перейти к Details"
        onPress={() => navigation.navigate('StackDemoDetails')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
});

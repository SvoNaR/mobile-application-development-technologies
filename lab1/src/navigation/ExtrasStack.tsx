import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExtrasMenuScreen } from '../modules/screens/extras/ExtrasMenuScreen';
import { StackDemoHomeScreen } from '../modules/screens/extras/StackDemoHomeScreen';
import { StackDemoDetailsScreen } from '../modules/screens/extras/StackDemoDetailsScreen';
import { CalculatorScreen } from '../modules/screens/extras/CalculatorScreen';
import { TodoScreen } from '../modules/screens/extras/TodoScreen';
import { TypingTestScreen } from '../modules/screens/extras/TypingTestScreen';

export type ExtrasStackParamList = {
  ExtrasMenu: undefined;
  StackDemoHome: undefined;
  StackDemoDetails: undefined;
  Calculator: undefined;
  Todo: undefined;
  TypingTest: undefined;
};

const Stack = createNativeStackNavigator<ExtrasStackParamList>();

export function ExtrasStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="ExtrasMenu">
      <Stack.Screen
        name="ExtrasMenu"
        component={ExtrasMenuScreen}
        options={{ title: 'Дополнительно' }}
      />
      <Stack.Screen
        name="StackDemoHome"
        component={StackDemoHomeScreen}
        options={{ title: 'Stack: Home' }}
      />
      <Stack.Screen
        name="StackDemoDetails"
        component={StackDemoDetailsScreen}
        options={{ title: 'Stack: Details' }}
      />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Todo" component={TodoScreen} options={{ title: 'Список задач' }} />
      <Stack.Screen
        name="TypingTest"
        component={TypingTestScreen}
        options={{ title: 'Скоропечатание' }}
      />
    </Stack.Navigator>
  );
}

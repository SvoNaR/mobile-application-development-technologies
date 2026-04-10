import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HelloScreen } from '../modules/screens/HelloScreen';
import { ButtonScreen } from '../modules/screens/ButtonScreen';
import { BookListScreen } from '../modules/screens/BookListScreen';
import { ExtrasStackNavigator } from './ExtrasStack';

export type RootTabParamList = {
  TabHello: undefined;
  TabButton: undefined;
  TabBooks: undefined;
  TabExtras: undefined;
};

const TAB_ICONS: Record<
  keyof RootTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  TabHello: 'hand-left-outline',
  TabButton: 'radio-button-on-outline',
  TabBooks: 'book-outline',
  TabExtras: 'ellipsis-horizontal-circle-outline',
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarLabelStyle: { fontSize: 11 },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ color, size }) => {
          const iconName = TAB_ICONS[route.name as keyof RootTabParamList];
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="TabHello"
        component={HelloScreen}
        options={{ title: 'Привет', tabBarLabel: 'Привет' }}
      />
      <Tab.Screen
        name="TabButton"
        component={ButtonScreen}
        options={{ title: 'Кнопка', tabBarLabel: 'Кнопка' }}
      />
      <Tab.Screen
        name="TabBooks"
        component={BookListScreen}
        options={{ title: 'Книги', tabBarLabel: 'Книги' }}
      />
      <Tab.Screen
        name="TabExtras"
        component={ExtrasStackNavigator}
        options={{ title: 'Дополнительно', tabBarLabel: 'Ещё', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

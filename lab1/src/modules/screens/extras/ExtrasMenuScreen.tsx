import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExtrasStackParamList } from '../../../navigation/ExtrasStack';
import { STUDENT } from '../../../core/student';

type Props = NativeStackScreenProps<ExtrasStackParamList, 'ExtrasMenu'>;

const items: { title: string; subtitle: string; target: keyof ExtrasStackParamList }[] =
  [
    {
      title: 'Стек (пример из методички)',
      subtitle: 'Home → Details через createNativeStackNavigator',
      target: 'StackDemoHome',
    },
    {
      title: 'Калькулятор',
      subtitle: 'Доп. задание',
      target: 'Calculator',
    },
    {
      title: 'Список задач',
      subtitle: 'Доп. задание: добавление / редактирование / удаление',
      target: 'Todo',
    },
    {
      title: 'Тест скоропечатания',
      subtitle: 'Доп. задание',
      target: 'TypingTest',
    },
  ];

export function ExtrasMenuScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.head}>{STUDENT.workTitle}</Text>
      <Text style={styles.sub}>
        {STUDENT.fio}, {STUDENT.group}
      </Text>
      <Text style={styles.sub2}>{STUDENT.discipline}</Text>
      <View style={styles.list}>
        {items.map((it) => (
          <Pressable
            key={it.target}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate(it.target)}
          >
            <Text style={styles.cardTitle}>{it.title}</Text>
            <Text style={styles.cardSub}>{it.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  head: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    color: '#334155',
  },
  sub2: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardPressed: {
    backgroundColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
  },
});

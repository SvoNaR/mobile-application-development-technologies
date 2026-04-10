import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Task = { id: string; text: string };

let idCounter = 1;
function nextId() {
  return `t-${idCounter++}`;
}

export function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: nextId(), text: 'Купить молоко' },
    { id: nextId(), text: 'Сдать лабораторную' },
  ]);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setTasks((list) => [...list, { id: nextId(), text: t }]);
    setDraft('');
  };

  const startEdit = (item: Task) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const t = editText.trim();
    if (!t) return;
    setTasks((list) =>
      list.map((x) => (x.id === editingId ? { ...x, text: t } : x))
    );
    setEditingId(null);
    setEditText('');
  };

  const remove = (id: string) => {
    Alert.alert('Удалить задачу?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => setTasks((list) => list.filter((x) => x.id !== id)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          placeholder="Новая задача"
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
          onSubmitEditing={add}
        />
        <Pressable onPress={add} style={styles.addBtn}>
          <Text style={styles.addText}>Добавить</Text>
        </Pressable>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {editingId === item.id ? (
              <>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  style={[styles.input, styles.inputFlex]}
                />
                <Pressable onPress={saveEdit} style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>OK</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.taskText}>{item.text}</Text>
                <Pressable onPress={() => startEdit(item)} style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>Изм.</Text>
                </Pressable>
                <Pressable onPress={() => remove(item.id)} style={styles.delBtn}>
                  <Text style={styles.delText}>✕</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  form: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputFlex: {
    flex: 1,
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  smallBtnText: {
    fontWeight: '600',
    color: '#334155',
  },
  delBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  delText: {
    color: '#dc2626',
    fontSize: 18,
  },
});

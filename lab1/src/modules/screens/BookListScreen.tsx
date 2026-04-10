import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type BookItem = {
  id: string;
  title: string;
  description: string;
  /** Прямая ссылка на обложку (если нет — используется picsum по coverSeed) */
  coverUrl?: string;
  coverSeed: string;
};

/** ISBN популярных изданий — обложки с Open Library (HTTPS) */
const initialBooks: BookItem[] = [
  {
    id: '1',
    title: 'Мастер и Маргарита',
    description: 'Роман М. А. Булгакова о дьяволе в Москве 1930-х.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780679760801-L.jpg',
    coverSeed: 'book1',
  },
  {
    id: '2',
    title: '1984',
    description: 'Антиутопия Дж. Оруэлла о тотальном контроле.',
    // ISBN-URL для этого издания в Open Library часто пустой; надёжнее b/id по работе OL1168083W
    coverUrl: 'https://covers.openlibrary.org/b/id/9267242-L.jpg',
    coverSeed: 'book2',
  },
  {
    id: '3',
    title: 'Преступление и наказание',
    description: 'Психологическая повесть Ф. М. Достоевского.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg',
    coverSeed: 'book3',
  },
];

/** Средняя высота строки для расчёта целевого индекса при перетаскивании */
const APPROX_ROW_HEIGHT = 142;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

type BookRowProps = {
  item: BookItem;
  index: number;
  selected: boolean;
  isDragging: boolean;
  onDragStart: (i: number) => void;
  onDragEnd: (from: number, deltaY: number) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string, title: string) => void;
};

function BookRow({
  item,
  index,
  selected,
  isDragging,
  onDragStart,
  onDragEnd,
  onToggle,
  onRemove,
}: BookRowProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    setCoverFailed(false);
  }, [item.id]);

  const coverUri =
    item.coverUrl && !coverFailed
      ? item.coverUrl
      : `https://picsum.photos/seed/${item.coverSeed}/240/320`;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          onDragStart(index);
        },
        onPanResponderMove: (_, g) => {
          translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          onDragEnd(index, g.dy);
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: false,
          }).start();
        },
        onPanResponderTerminate: () => {
          onDragEnd(index, 0);
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: false,
          }).start();
        },
      }),
    [index, onDragStart, onDragEnd, translateY]
  );

  return (
    <Animated.View
      style={[
        styles.row,
        { backgroundColor: selected ? '#dbeafe' : '#ffffff' },
        isDragging && styles.rowLifted,
        { transform: [{ translateY }] },
      ]}
    >
      <View style={styles.dragHandle} {...panResponder.panHandlers}>
        <Text style={styles.dragIcon}>☰</Text>
      </View>
      <Pressable
        onPress={() => onToggle(item.id)}
        onLongPress={() => onRemove(item.id, item.title)}
        delayLongPress={450}
        style={styles.rowBody}
      >
        <View style={styles.coverWrap}>
          <Image
            source={{ uri: coverUri }}
            style={styles.cover}
            resizeMode="cover"
            onError={() => {
              if (item.coverUrl) setCoverFailed(true);
            }}
          />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={3}>
            {item.description}
          </Text>
          <Text style={styles.hint}>
            Тап — фон · долгое на строке — удалить · ☰ — удержать и тянуть
            вверх/вниз
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function BookListScreen() {
  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const toggleSelect = useCallback((id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  const removeBook = useCallback((id: string, title: string) => {
    Alert.alert('Удалить книгу?', title, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          setBooks((list) => list.filter((b) => b.id !== id));
          setSelected((s) => {
            const n = { ...s };
            delete n[id];
            return n;
          });
        },
      },
    ]);
  }, []);

  const addBook = useCallback(() => {
    const title = newTitle.trim();
    if (!title) {
      Alert.alert('Введите название');
      return;
    }
    const desc = newDesc.trim() || 'Без описания';
    setBooks((list) => [
      ...list,
      {
        id: makeId(),
        title,
        description: desc,
        coverUrl: undefined,
        coverSeed: makeId(),
      },
    ]);
    setNewTitle('');
    setNewDesc('');
  }, [newTitle, newDesc]);

  const onDragStart = useCallback((i: number) => {
    setDraggingIndex(i);
  }, []);

  const onDragEnd = useCallback((from: number, deltaY: number) => {
    setDraggingIndex(null);
    const steps = Math.round(deltaY / APPROX_ROW_HEIGHT);
    if (steps === 0) return;
    setBooks((list) => {
      const to = Math.max(0, Math.min(list.length - 1, from + steps));
      return reorder(list, from, to);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          placeholder="Название новой книги"
          value={newTitle}
          onChangeText={setNewTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Краткое описание"
          value={newDesc}
          onChangeText={setNewDesc}
          style={styles.input}
          multiline
        />
        <Pressable onPress={addBook} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Добавить в список</Text>
        </Pressable>
      </View>
      <ScrollView
        scrollEnabled={draggingIndex === null}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {books.map((item, index) => (
          <BookRow
            key={item.id}
            item={item}
            index={index}
            selected={!!selected[item.id]}
            isDragging={draggingIndex === index}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onToggle={toggleSelect}
            onRemove={removeBook}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  form: {
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  rowLifted: {
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 10,
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  dragHandle: {
    padding: 6,
    justifyContent: 'center',
  },
  dragIcon: {
    fontSize: 20,
    color: '#64748b',
  },
  coverWrap: {
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#f1f5f9',
  },
  cover: {
    width: 72,
    height: 96,
    backgroundColor: '#e2e8f0',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  desc: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569',
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    color: '#94a3b8',
  },
});

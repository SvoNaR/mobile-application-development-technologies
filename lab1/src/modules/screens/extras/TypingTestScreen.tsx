import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const PHRASES = [
  'Быстрая коричневая лиса прыгает через ленивую собаку',
  'React Native упрощает кроссплатформенную разработку',
  'Программная инженерия требует дисциплины и тестов',
];

export function TypingTestScreen() {
  const [idx, setIdx] = useState(0);
  const phrase = PHRASES[idx % PHRASES.length];
  const [input, setInput] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const accuracy = useMemo(() => {
    if (!phrase.length) return 0;
    let ok = 0;
    const lim = Math.min(input.length, phrase.length);
    for (let i = 0; i < lim; i++) {
      if (input[i] === phrase[i]) ok++;
    }
    return Math.round((ok / phrase.length) * 100);
  }, [input, phrase]);

  const reset = useCallback(() => {
    setInput('');
    setStartedAt(null);
    setFinishedAt(null);
    setDone(false);
  }, []);

  const nextPhrase = () => {
    setIdx((i) => i + 1);
    reset();
  };

  const onChange = (t: string) => {
    if (done) return;
    if (startedAt === null && t.length > 0) {
      setStartedAt(Date.now());
    }
    setInput(t);
    if (t === phrase) {
      setFinishedAt(Date.now());
      setDone(true);
    }
  };

  const durationSec =
    startedAt && finishedAt
      ? Math.max(0.001, (finishedAt - startedAt) / 1000)
      : 0;
  const words = phrase.split(/\s+/).filter(Boolean).length;
  const wpm =
    done && durationSec > 0 ? Math.round((words / durationSec) * 60) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Набери текст точно:</Text>
      <Text style={styles.phrase}>{phrase}</Text>
      <TextInput
        style={styles.input}
        multiline
        value={input}
        onChangeText={onChange}
        placeholder="Начни ввод…"
        editable={!done}
      />
      <Text style={styles.meta}>Точность: {accuracy}%</Text>
      {done && (
        <Text style={styles.done}>
          Готово! Скорость: ~{wpm} слов/мин (оценка по фразе)
        </Text>
      )}
      <View style={styles.actions}>
        <Pressable onPress={reset} style={styles.btn}>
          <Text style={styles.btnText}>Заново</Text>
        </Pressable>
        <Pressable onPress={nextPhrase} style={styles.btn}>
          <Text style={styles.btnText}>Другая фраза</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  phrase: {
    fontSize: 18,
    lineHeight: 26,
    color: '#0f172a',
    marginBottom: 12,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
    textAlignVertical: 'top',
  },
  meta: {
    marginTop: 10,
    fontSize: 15,
    color: '#334155',
  },
  done: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

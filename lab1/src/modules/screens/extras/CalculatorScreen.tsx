import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Op = '+' | '-' | '*' | '/' | null;

export function CalculatorScreen() {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);

  const value = useMemo(() => parseFloat(display) || 0, [display]);

  const appendDigit = (d: string) => {
    if (fresh) {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
      return;
    }
    if (d === '.' && display.includes('.')) return;
    setDisplay((prev) => (prev === '0' && d !== '.' ? d : prev + d));
  };

  const apply = (a: number, b: number, operator: Op): number => {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const onOp = (next: Op) => {
    if (stored !== null && op && !fresh) {
      const r = apply(stored, value, op);
      setDisplay(String(Number.isFinite(r) ? +r.toFixed(8).replace(/\.?0+$/, '') : r));
      setStored(Number.isFinite(r) ? r : null);
    } else {
      setStored(value);
    }
    setOp(next);
    setFresh(true);
  };

  const onEq = () => {
    if (stored === null || !op) return;
    const r = apply(stored, value, op);
    setDisplay(String(Number.isFinite(r) ? +r.toFixed(8).replace(/\.?0+$/, '') : r));
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay('0');
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  const keys = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', 'C', '+'],
  ] as const;

  return (
    <View style={styles.wrap}>
      <Text style={styles.display} numberOfLines={1}>
        {display}
      </Text>
      {keys.map((row) => (
        <View key={row.join()} style={styles.row}>
          {row.map((k) => (
            <Pressable
              key={k}
              style={({ pressed }) => [
                styles.key,
                k === 'C' && styles.keyWide,
                pressed && styles.keyPressed,
              ]}
              onPress={() => {
                if (k === 'C') {
                  clear();
                  return;
                }
                if (['+', '-', '*', '/'].includes(k)) {
                  onOp(k as Op);
                  return;
                }
                appendDigit(k);
              }}
            >
              <Text style={styles.keyText}>{k}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <Pressable style={styles.eq} onPress={onEq}>
        <Text style={styles.eqText}>=</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
  },
  display: {
    color: '#e2e8f0',
    fontSize: 36,
    textAlign: 'right',
    marginBottom: 16,
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  key: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  keyWide: {},
  keyPressed: {
    backgroundColor: '#334155',
  },
  keyText: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  eq: {
    marginTop: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  eqText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});

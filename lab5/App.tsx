import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer, LightSensor, Magnetometer } from 'expo-sensors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/** Android SENSOR_DELAY_NORMAL — частота обновления, близкая к примеру из методички */
const SENSOR_INTERVAL_MS = 200;

/** sensors_plus отдаёт ускорение в м/с²; expo-sensors — в g */
const G = 9.80665;

const DEEP_PURPLE = '#673AB7';

type Contact = {
  id: number;
  name: string;
  email: string;
};

function normalizeHeading(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function cardinalRu(deg: number): string {
  const normalized = normalizeHeading(deg);
  if (normalized >= 337.5 || normalized < 22.5) return 'Север';
  if (normalized < 112.5) return 'Восток';
  if (normalized < 202.5) return 'Юг';
  return 'Запад';
}

/** Упрощённый азимут по магнитометру (телефон примерно горизонтально), если нет watchHeading */
function headingFromMagnetometer(mx: number, my: number): number {
  const rad = Math.atan2(-my, mx);
  let deg = (rad * 180) / Math.PI;
  return normalizeHeading(deg);
}

export default function App() {
  const [aX, setAX] = useState(0);
  const [aY, setAY] = useState(0);
  const [aZ, setAZ] = useState(0);
  const [mX, setMX] = useState(0);
  const [mY, setMY] = useState(0);
  const [mZ, setMZ] = useState(0);

  const [heading, setHeading] = useState(0);
  const [directionStr, setDirectionStr] = useState('Север (0.0°)');
  const useMagForCompass = useRef(false);

  const [proximityState, setProximityState] = useState('0.0');
  const [lightLevel, setLightLevel] = useState('0.0');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  const refreshContacts = useCallback(async (database: SQLite.SQLiteDatabase) => {
    const rows = await database.getAllAsync<Contact>('SELECT id, name, email FROM mytable');
    setContacts(rows);
  }, []);

  const appStateRef = useRef(AppState.currentState);

  /** После возврата в приложение список скрывается — записи снова видны только по кнопке Read */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appStateRef.current;
      if (
        (prev === 'background' || prev === 'inactive') &&
        next === 'active'
      ) {
        setContacts([]);
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const database = await SQLite.openDatabaseAsync('myDB.db');
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS mytable (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT);',
      );
      if (!cancelled) {
        setDb(database);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Компас: как FlutterCompass — через expo-location.watchHeadingAsync (magHeading / trueHeading) */
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled || status !== 'granted') {
          useMagForCompass.current = true;
          return;
        }
        sub = await Location.watchHeadingAsync((loc) => {
          let deg = loc.magHeading;
          if (deg == null || deg < 0 || Number.isNaN(deg)) {
            deg = loc.trueHeading;
          }
          if (deg == null || deg < 0 || Number.isNaN(deg)) return;
          const normalized = normalizeHeading(deg);
          setHeading(normalized);
          const dir = cardinalRu(normalized);
          setDirectionStr(`${dir} (${normalized.toFixed(1)}°)`);
        });
      } catch {
        useMagForCompass.current = true;
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    const subA = Accelerometer.addListener((e) => {
      setAX(e.x * G);
      setAY(e.y * G);
      setAZ(e.z * G);
    });

    Magnetometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    const subM = Magnetometer.addListener((e) => {
      setMX(e.x);
      setMY(e.y);
      setMZ(e.z);
      if (useMagForCompass.current) {
        const h = headingFromMagnetometer(e.x, e.y);
        setHeading(h);
        const dir = cardinalRu(h);
        setDirectionStr(`${dir} (${h.toFixed(1)}°)`);
      }
    });

    let subLight: { remove: () => void } | undefined;

    (async () => {
      try {
        if (Platform.OS === 'android' && (await LightSensor.isAvailableAsync())) {
          LightSensor.setUpdateInterval(SENSOR_INTERVAL_MS);
          subLight = LightSensor.addListener((e) => {
            setLightLevel(e.illuminance.toFixed(2));
          });
        } else {
          setLightLevel('not available');
        }
      } catch {
        setLightLevel('not available');
      }
    })();

    /** В Expo Go нет нативного proximity — как во Flutter при недоступности датчика */
    setProximityState('0.0');

    return () => {
      subA.remove();
      subM.remove();
      subLight?.remove();
    };
  }, []);

  const addContact = useCallback(async () => {
    const n = name.trim();
    const em = email.trim();
    if (!n || !em || !db) return;
    await db.runAsync('INSERT INTO mytable (name, email) VALUES (?, ?)', n, em);
    setName('');
    setEmail('');
    await refreshContacts(db);
  }, [db, email, name, refreshContacts]);

  const readContacts = useCallback(async () => {
    if (!db) return;
    await refreshContacts(db);
  }, [db, refreshContacts]);

  const clearContacts = useCallback(async () => {
    if (!db) return;
    await db.runAsync('DELETE FROM mytable');
    await refreshContacts(db);
  }, [db, refreshContacts]);

  const statusBarPad = (Constants.statusBarHeight ?? 0) + (Platform.OS === 'android' ? 0 : 8);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.appBar, { paddingTop: statusBarPad }]}>
        <Text style={styles.appBarTitle}>Sensors</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sensorGroupTitle}>Акселерометр</Text>
        <Text style={styles.valueLine}>{aX.toFixed(6)}</Text>
        <Text style={styles.valueLine}>{aY.toFixed(6)}</Text>
        <Text style={styles.valueLine}>{aZ.toFixed(6)}</Text>
        <View style={styles.spacer} />

        <Text style={styles.sensorGroupTitle}>Магнитный датчик</Text>
        <Text style={styles.valueLine}>{mX.toFixed(3)}</Text>
        <Text style={styles.valueLine}>{mY.toFixed(3)}</Text>
        <Text style={styles.valueLine}>{mZ.toFixed(3)}</Text>
        <View style={styles.spacer} />

        <Text style={styles.sensorGroupTitle}>Компас (индивидуальное задание №8)</Text>
        <Text style={styles.valueLine}>Азимут: {heading.toFixed(1)}°</Text>
        <Text style={styles.valueLine}>Направление: {directionStr}</Text>
        <View style={styles.spacer} />

        <Text style={styles.sensorGroupTitle}>Приближение</Text>
        <Text style={styles.valueLine}>{proximityState}</Text>
        <View style={styles.spacer} />

        <Text style={styles.sensorGroupTitle}>Освещение</Text>
        <Text style={styles.valueLine}>{lightLevel}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Работа с базой данных</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={styles.buttonRow}>
          <Pressable style={styles.btn} onPress={addContact}>
            <Text style={styles.btnText}>Add</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={readContacts}>
            <Text style={styles.btnText}>Read</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={clearContacts}>
            <Text style={styles.btnText}>Clear</Text>
          </Pressable>
        </View>

        <Text style={styles.recordsTitle}>Записи</Text>
        {contacts.length === 0 ? (
          <Text>0 rows</Text>
        ) : (
          contacts.map((c) => (
            <Text key={c.id} style={styles.recordRow}>
              ID={c.id}, name={c.name}, email={c.email}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  appBar: {
    backgroundColor: DEEP_PURPLE,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold' },
  sensorGroupTitle: { fontSize: 18, fontWeight: 'bold' },
  valueLine: { marginTop: 2, fontSize: 16 },
  spacer: { height: 20 },
  divider: {
    height: 32,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    fontSize: 16,
  },
  buttonRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
  btn: {
    flex: 1,
    backgroundColor: DEEP_PURPLE,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  recordsTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  recordRow: { marginTop: 2, fontSize: 16 },
});

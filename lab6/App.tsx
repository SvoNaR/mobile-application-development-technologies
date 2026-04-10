import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeTouchEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

/** Material indigo seed + related (Flutter ColorScheme.fromSeed indigo). */
const C = {
  indigo: '#3F51F5',
  indigo200: '#9FA8DA',
  grey50: '#FAFAFA',
  orange100: '#FFE0B2',
  orange400: '#FFA726',
  card: '#FFFFFF',
};

type Point = { x: number; y: number };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function centroidOf(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / points.length, y: sy / points.length };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function angleBetween(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/** RN types allow string identifiers (e.g. web); normalize to number for Map keys. */
function touchId(t: { identifier: number | string }): number {
  return typeof t.identifier === 'number'
    ? t.identifier
    : Number(t.identifier);
}

function segmentsFromPoints(points: (Point | null)[]): Point[][] {
  const out: Point[][] = [];
  let cur: Point[] = [];
  for (const p of points) {
    if (p == null) {
      if (cur.length) {
        out.push(cur);
        cur = [];
      }
    } else {
      cur.push(p);
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

export default function App() {
  const [tab, setTab] = useState<0 | 1>(0);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>ЛР6. Обработка касаний</Text>
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setTab(0)}
            style={[styles.tab, tab === 0 && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 0 && styles.tabTextActive]}>
              Рисование
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab(1)}
            style={[styles.tab, tab === 1 && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 1 && styles.tabTextActive]}>
              Мультитач
            </Text>
          </Pressable>
        </View>
      </View>
      {tab === 0 ? <DrawLabPage /> : <MultiTouchLabPage />}
    </View>
  );
}

function DrawLabPage() {
  const [points, setPoints] = useState<(Point | null)[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 1, h: 1 });

  const onLayoutCanvas = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ w: width, h: height });
  }, []);

  const start = useCallback((p: Point) => {
    setIsDrawing(true);
    setPoints((prev) => [...prev, p]);
  }, []);

  const move = useCallback((p: Point) => {
    setPoints((prev) => [...prev, p]);
  }, []);

  const end = useCallback(() => {
    setIsDrawing(false);
    setPoints((prev) => [...prev, null]);
  }, []);

  const clearCanvas = useCallback(() => {
    setPoints([]);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          start({
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
          });
        },
        onPanResponderMove: (e) => {
          move({
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
          });
        },
        onPanResponderRelease: () => end(),
        onPanResponderTerminate: () => end(),
      }),
    [start, move, end],
  );

  const segments = useMemo(() => segmentsFromPoints(points), [points]);

  return (
    <View style={styles.column}>
      <View style={styles.drawHeader}>
        <Text style={styles.drawHeaderText}>
          ЛР6.1: Рисование касанием (DOWN / MOVE / UP)
        </Text>
        <Pressable
          onPress={clearCanvas}
          style={({ pressed }) => [
            styles.tonalButton,
            pressed && styles.tonalButtonPressed,
          ]}
        >
          <Text style={styles.tonalButtonLabel}>Очистить</Text>
        </Pressable>
      </View>
      <View style={styles.canvasOuter}>
        <View
          style={styles.canvasBorder}
          onLayout={onLayoutCanvas}
          {...panResponder.panHandlers}
        >
          <View style={styles.canvasBg} />
          <Svg
            width={canvasSize.w}
            height={canvasSize.h}
            style={StyleSheet.absoluteFill}
          >
            {segments.map((seg, i) => {
              if (seg.length < 2) return null;
              const pts = seg.map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <Polyline
                  key={i}
                  points={pts}
                  fill="none"
                  stroke={C.indigo}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </Svg>
          <View style={styles.drawStatusWrap} pointerEvents="none">
            <View style={styles.drawStatusCard}>
              <Text style={styles.drawStatusText}>
                {isDrawing ? 'Статус: рисование' : 'Статус: ожидание'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

type Session = {
  startPosition: Point;
  centroidStart: Point;
  startScale: number;
  startRotation: number;
  initialDistance?: number;
  initialAngle?: number;
};

function MultiTouchLabPage() {
  const [downPointerIndex, setDownPointerIndex] = useState(-1);
  const [upPointerIndex, setUpPointerIndex] = useState(-1);
  const [inTouch, setInTouch] = useState(false);
  const [pointerTable, setPointerTable] = useState('');
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const activePointers = useRef<Map<number, Point>>(new Map());
  const sessionRef = useRef<Session | null>(null);
  const positionRef = useRef(position);
  const scaleRef = useRef(scale);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    positionRef.current = position;
    scaleRef.current = scale;
    rotationRef.current = rotation;
  }, [position, scale, rotation]);

  const rebuildPointerTable = useCallback(
    (activeIds: number[], map: Map<number, Point>) => {
      const rows: string[] = [];
      rows.push(`pointerCount: ${activeIds.length}`);
      for (let i = 0; i < 10; i++) {
        if (i < activeIds.length) {
          const id = activeIds[i];
          const point = map.get(id)!;
          rows.push(
            `index:${i} id:${id} x:${point.x.toFixed(1)} y:${point.y.toFixed(1)}`,
          );
        } else {
          rows.push(`index:${i}`);
        }
      }
      return rows.join('\n');
    },
    [],
  );

  const beginSession = useCallback(
    (map: Map<number, Point>, pos: Point, sc: number, rot: number) => {
      const ids = [...map.keys()].sort((a, b) => a - b);
      const pts = ids.map((id) => map.get(id)!);
      const c = centroidOf(pts);
      const s: Session = {
        startPosition: { ...pos },
        centroidStart: c,
        startScale: sc,
        startRotation: rot,
      };
      if (ids.length >= 2) {
        const p0 = map.get(ids[0])!;
        const p1 = map.get(ids[1])!;
        s.initialDistance = distance(p0, p1);
        s.initialAngle = angleBetween(p0, p1);
      }
      sessionRef.current = s;
    },
    [],
  );

  const applyTransform = useCallback(
    (map: Map<number, Point>) => {
      const sess = sessionRef.current;
      if (!sess) return;
      const ids = [...map.keys()].sort((a, b) => a - b);
      if (ids.length === 0) return;
      const pts = ids.map((id) => map.get(id)!);
      const c = centroidOf(pts);
      let nextPos: Point = {
        x: sess.startPosition.x + (c.x - sess.centroidStart.x),
        y: sess.startPosition.y + (c.y - sess.centroidStart.y),
      };
      let nextScale = sess.startScale;
      let nextRot = sess.startRotation;
      if (
        ids.length >= 2 &&
        sess.initialDistance != null &&
        sess.initialAngle != null &&
        sess.initialDistance > 0
      ) {
        const p0 = map.get(ids[0])!;
        const p1 = map.get(ids[1])!;
        const d = distance(p0, p1);
        const ang = angleBetween(p0, p1);
        nextScale = clamp(
          sess.startScale * (d / sess.initialDistance),
          0.4,
          3.5,
        );
        nextRot = sess.startRotation + (ang - sess.initialAngle);
      }
      setPosition(nextPos);
      setScale(nextScale);
      setRotation(nextRot);
    },
    [],
  );

  const handleTouch = useCallback(
    (e: { nativeEvent: NativeTouchEvent }, phase: 'start' | 'move' | 'end') => {
      const ne = e.nativeEvent;
      const map = activePointers.current;
      const countBefore = map.size;

      if (phase === 'start') {
        for (let i = 0; i < ne.changedTouches.length; i++) {
          const t = ne.changedTouches[i];
          const id = touchId(t);
          map.set(id, { x: t.locationX, y: t.locationY });
          const ids = [...map.keys()].sort((a, b) => a - b);
          setDownPointerIndex(ids.indexOf(id));
        }
      } else if (phase === 'move') {
        for (let i = 0; i < ne.touches.length; i++) {
          const t = ne.touches[i];
          const id = touchId(t);
          if (map.has(id)) {
            map.set(id, { x: t.locationX, y: t.locationY });
          }
        }
      } else {
        for (let i = 0; i < ne.changedTouches.length; i++) {
          const t = ne.changedTouches[i];
          const id = touchId(t);
          const ids = [...map.keys()].sort((a, b) => a - b);
          setUpPointerIndex(ids.indexOf(id));
          map.delete(id);
        }
      }

      const activeIds = [...map.keys()].sort((a, b) => a - b);
      setInTouch(activeIds.length > 0);
      setPointerTable(rebuildPointerTable(activeIds, map));

      const n = map.size;
      if (n !== countBefore) {
        if (n === 0) {
          sessionRef.current = null;
        } else {
          beginSession(
            map,
            positionRef.current,
            scaleRef.current,
            rotationRef.current,
          );
        }
      } else if (phase === 'move' && n > 0) {
        applyTransform(map);
      }
    },
    [applyTransform, beginSession, rebuildPointerTable],
  );

  const onTouchStart = useCallback(
    (e: { nativeEvent: NativeTouchEvent }) => handleTouch(e, 'start'),
    [handleTouch],
  );
  const onTouchMove = useCallback(
    (e: { nativeEvent: NativeTouchEvent }) => handleTouch(e, 'move'),
    [handleTouch],
  );
  const onTouchEnd = useCallback(
    (e: { nativeEvent: NativeTouchEvent }) => handleTouch(e, 'end'),
    [handleTouch],
  );

  return (
    <View style={styles.column}>
      <View style={styles.multiCardOuter}>
        <View style={styles.multiCard}>
          <Text style={styles.multiTitle}>ЛР6.2: Мультитач</Text>
          <Text style={styles.multiLine}>down: {downPointerIndex}</Text>
          <Text style={styles.multiLine}>up: {upPointerIndex}</Text>
          <Text style={styles.multiLine}>inTouch: {inTouch ? 'true' : 'false'}</Text>
          <View style={styles.multiSpacer} />
          <Text style={styles.mono}>
            {pointerTable === ''
              ? 'Коснитесь области ниже для отображения индексов/ID/координат.'
              : pointerTable}
          </Text>
        </View>
      </View>
      <View style={styles.multiTouchAreaOuter}>
        <View
          style={styles.multiTouchArea}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <LinearGradient
            colors={['#E8EAF6', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.multiTouchInner}
          >
            <View
              style={[
                styles.transformWrap,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate: `${rotation}rad` },
                    { scale },
                  ],
                },
              ]}
            >
              <View style={styles.orangeBox}>
                <Text style={styles.orangeBoxText}>Pinch / Rotate</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.grey50,
  },
  appBar: {
    backgroundColor: C.indigo,
    paddingTop: 8,
    paddingBottom: 0,
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#fff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  column: {
    flex: 1,
  },
  drawHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  drawHeaderText: {
    flex: 1,
    fontWeight: '600',
    color: '#111',
  },
  tonalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(63,81,181,0.12)',
  },
  tonalButtonPressed: {
    opacity: 0.85,
  },
  tonalButtonLabel: {
    color: C.indigo,
    fontWeight: '600',
    fontSize: 14,
  },
  canvasOuter: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
  },
  canvasBorder: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: C.indigo200,
    overflow: 'hidden',
  },
  canvasBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.grey50,
  },
  drawStatusWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
  },
  drawStatusCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  drawStatusText: {
    fontSize: 12,
    color: '#111',
  },
  multiCardOuter: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  multiCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  multiTitle: {
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  multiLine: {
    color: '#111',
  },
  multiSpacer: {
    height: 6,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#111',
  },
  multiTouchAreaOuter: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  multiTouchArea: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: C.indigo200,
    overflow: 'hidden',
  },
  multiTouchInner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transformWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeBox: {
    width: 170,
    height: 120,
    backgroundColor: C.orange100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.orange400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orangeBoxText: {
    fontWeight: '700',
    color: 'rgba(0,0,0,0.87)',
  },
});

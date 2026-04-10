import React, { Component } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

/**
 * Пример с кнопкой из методички + задания 2 и 5.
 *
 * Реализация «картинка при зажатии»:
 * — локальный asset (не зависит от сети и от бага Android с opacity:0 у Image);
 * — синяя маска поверх картинки скрывает её, при зажатии opacity маски → 0;
 * — жест: onTouchStart / onTouchEnd на контейнере; у Image и маски pointerEvents="none",
 *   чтобы касание стабильно обрабатывал родитель.
 */
export class ButtonScreen extends Component<
  object,
  { pressing: boolean }
> {
  constructor(props: object) {
    super(props);
    this.state = { pressing: false };
  }

  private setPressed = (value: boolean) => {
    this.setState({ pressing: value });
  };

  render() {
    const { pressing } = this.state;
    return (
      <View style={styles.container}>
        <View
          style={styles.touchable}
          onTouchStart={() => this.setPressed(true)}
          onTouchEnd={() => this.setPressed(false)}
          onTouchCancel={() => this.setPressed(false)}
        >
          <View style={styles.button}>
            <View pointerEvents="none" style={styles.imageWrap}>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.imageLayer}
                resizeMode="cover"
              />
            </View>
            <View
              pointerEvents="none"
              style={[styles.mask, { opacity: pressing ? 0 : 1 }]}
            >
              <Text style={styles.welcome}>НАЖМИ МЕНЯ!</Text>
            </View>
          </View>
        </View>
        {!pressing && (
          <Text style={styles.hint}>Зажми кнопку — появится изображение</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  hint: {
    marginTop: 24,
    color: '#64748b',
    fontSize: 14,
  },
  touchable: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    height: 200,
    width: 220,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1e40af',
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  imageLayer: {
    width: '100%',
    height: '100%',
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

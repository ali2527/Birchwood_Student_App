import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Modal, StyleSheet, View} from 'react-native';
import {useAppSelector} from '../../Stores/hooks';
import {selectAppLoader} from '../../Stores/slices/common.slice';

const PRIMARY = '#035392';
const RING = '#035392';
const TRACK = 'rgba(3, 83, 146, 0.14)';

function Spinner() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.88,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    rotate.start();
    breathe.start();
    return () => {
      rotate.stop();
      breathe.stop();
    };
  }, [spin, pulse]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.spinnerWrap, {transform: [{scale: pulse}]}]}>
      <View style={styles.track} />
      <Animated.View style={[styles.arc, {transform: [{rotate}]}]} />
      <View style={styles.core} />
    </Animated.View>
  );
}

export const AppLoader = () => {
  const loading = useAppSelector(selectAppLoader);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      fade.setValue(0);
      return undefined;
    }
    Animated.timing(fade, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return undefined;
  }, [loading, fade]);

  if (!loading) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, {opacity: fade}]}>
        <Spinner />
      </Animated.View>
    </Modal>
  );
};

const SIZE = 44;
const STROKE = 3.5;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 31, 75, 0.28)',
  },
  spinnerWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
    borderColor: TRACK,
  },
  arc: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
    borderTopColor: RING,
    borderRightColor: RING,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  core: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
    opacity: 0.9,
  },
});

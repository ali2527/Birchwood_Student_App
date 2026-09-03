import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppAlertCard from './index';

let listener = null;
let pending = null;
let seq = 0;

export function showAppAlert(payload) {
  const next = {
    id: ++seq,
    title: payload.title || 'Notice',
    description: payload.description,
    type: payload.type || 'info',
    duration: payload.duration || 3600,
  };
  if (listener) {
    listener(next);
  } else {
    pending = next;
  }
}

export function AppAlertHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef(null);
  const toastIdRef = useRef(null);

  const hide = useCallback(
    id => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      const idToHide = id ?? toastIdRef.current;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 18,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished && toastIdRef.current === idToHide) {
          setToast(null);
        }
      });
    },
    [opacity, translateY],
  );

  useEffect(() => {
    listener = next => setToast(next);
    if (pending) {
      setToast(pending);
      pending = null;
    }
    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    toastIdRef.current = toast.id;
    translateY.stopAnimation();
    opacity.stopAnimation();
    translateY.setValue(18);
    opacity.setValue(1);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    hideTimer.current = setTimeout(() => hide(toast.id), toast.duration);
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [toast, hide, opacity, translateY]);

  return (
    <Modal
      visible={!!toast}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => hide(toast?.id)}>
      <View style={styles.overlay} pointerEvents="box-none">
        {toast ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.toast,
              {
                bottom: Math.max(insets.bottom, 12) + 16,
                opacity,
                transform: [{translateY}],
              },
            ]}>
            <Pressable onPress={() => hide(toast.id)} style={styles.shadow}>
              <AppAlertCard
                title={toast.title}
                description={toast.description}
                type={toast.type}
              />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    left: 14,
    right: 14,
  },
  shadow: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 20,
  },
});

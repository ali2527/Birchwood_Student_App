import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const DANGER = '#E11D48';
const DANGER_SOFT = '#FEF2F2';

export default function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Keep',
  icon = 'trash-outline',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState(visible);
  const dim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      setShown(true);
      dim.setValue(0);
      slide.setValue(48);
      Animated.parallel([
        Animated.timing(dim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return undefined;
    }
    if (!shown) {
      return undefined;
    }
    Animated.parallel([
      Animated.timing(dim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 48,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        setShown(false);
      }
    });
    return undefined;
  }, [visible, shown, dim, slide]);

  if (!shown) {
    return null;
  }

  return (
    <Modal
      visible={shown}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={loading ? undefined : onCancel}>
      <View style={styles.root} pointerEvents="box-none">
        <Pressable
          style={styles.backdropHit}
          disabled={loading}
          onPress={onCancel}>
          <Animated.View style={[styles.dim, {opacity: dim}]} />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              opacity: dim,
              transform: [{translateY: slide}],
            },
          ]}>
          <View style={styles.handle} />
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={26} color={DANGER} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.85}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropHit: {
    ...StyleSheet.absoluteFillObject,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  sheet: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: -6},
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: DANGER_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    textAlign: 'center',
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
    letterSpacing: -0.2,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: DANGER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.75,
  },
  confirmText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});

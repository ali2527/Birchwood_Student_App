import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import Svg, {Path} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import profile_icon from '../../Assets/images/profile_bg.png';
import routes from '../../Navigation/routes';
import {getImagePath} from '../../Service/axios';
import {asyncSignOut} from '../../Stores/actions/user.action';
import {asyncGetAppModules} from '../../Stores/actions/modules.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {selectModules} from '../../Stores/slices/modules.slice';
import {selectUnreadNotificationCount} from '../../Stores/slices/notification.slice';
import {WIDTH} from '../../theme/units';
import {BAR_H, HILL_H, humpBumpPath} from '../AppFooter/shape';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';

const ACCOUNT_ITEMS = [
  {label: 'My Profile', icon: 'person-outline', screen: routes.screens.profile},
  {
    label: 'Notifications',
    icon: 'notifications-outline',
    screen: routes.screens.notifications,
  },
  {
    label: 'Children',
    icon: 'people-outline',
    screen: routes.screens.children,
  },
  {label: 'Settings', icon: 'settings-outline', screen: routes.screens.settings},
];

const SCHOOL_ITEMS = [
  {
    label: 'Gallery',
    icon: 'images-outline',
    screen: routes.screens.schoolAlbums,
    module: 'gallery',
  },
];

const SUPPORT_ITEMS = [
  {
    label: 'Help & Support',
    icon: 'help-circle-outline',
    screen: routes.screens.helpSupport,
  },
];

function MenuBody({
  parentName,
  parentPhoto,
  schoolItems,
  renderRow,
  onLogout,
}) {
  return (
    <>
      <Text style={styles.kicker}>MORE</Text>
      <View style={styles.profileRow}>
        <Image source={parentPhoto} style={styles.avatar} />
        <View style={styles.profileCopy}>
          <Text style={styles.parentName} numberOfLines={1}>
            {parentName}
          </Text>
          <Text style={styles.parentRole}>Parent Account</Text>
        </View>
      </View>
      <Text style={styles.section}>ACCOUNT</Text>
      {ACCOUNT_ITEMS.map(renderRow)}
      {schoolItems.length ? <Text style={styles.section}>SCHOOL</Text> : null}
      {schoolItems.map(renderRow)}
      <Text style={styles.section}>SUPPORT</Text>
      {SUPPORT_ITEMS.map(renderRow)}
      <TouchableOpacity
        style={styles.logoutRow}
        onPress={onLogout}
        activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color="#E11D48" />
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
    </>
  );
}

export default function MoreSheet({
  visible,
  onClose,
  barWidth = WIDTH,
  inset = 0,
  footer,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userProfile = useAppSelector(selectUserProfile);
  const modules = useAppSelector(selectModules);
  const unreadNotifications = useAppSelector(selectUnreadNotificationCount);
  const [shown, setShown] = useState(false);
  const [menuH, setMenuH] = useState(0);
  const open = useRef(new Animated.Value(0)).current;
  const dim = useRef(new Animated.Value(0)).current;
  const afterClose = useRef(null);
  const openRef = useRef(0);
  const dragStart = useRef(1);
  const closingRef = useRef(false);

  useEffect(() => {
    const id = open.addListener(({value}) => {
      openRef.current = value;
    });
    return () => open.removeListener(id);
  }, [open]);

  useEffect(() => {
    if (visible) {
      closingRef.current = false;
    }
  }, [visible]);

  const snapSheetOpen = useCallback(() => {
    Animated.parallel([
      Animated.spring(open, {
        toValue: 1,
        tension: 68,
        friction: 11,
        useNativeDriver: false,
      }),
      Animated.timing(dim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dim, open]);

  const finishClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;
    onClose?.();
  }, [onClose]);

  const dismissPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx) * 1.05,
        onMoveShouldSetPanResponderCapture: (_, g) =>
          g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx) * 1.05,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          open.stopAnimation(value => {
            dragStart.current = value;
            openRef.current = value;
          });
        },
        onPanResponderMove: (_, g) => {
          const height = menuH || 280;
          const next = Math.max(0, Math.min(1, dragStart.current - g.dy / height));
          open.setValue(next);
          dim.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const value = openRef.current;
          if (value < 0.82 || g.vy > 0.55 || g.dy > 56) {
            finishClose();
          } else {
            snapSheetOpen();
          }
        },
        onPanResponderTerminate: () => {
          if (openRef.current < 0.82) {
            finishClose();
          } else {
            snapSheetOpen();
          }
        },
      }),
    [dim, finishClose, menuH, open, snapSheetOpen],
  );

  const handlePan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy > 3 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          open.stopAnimation(value => {
            dragStart.current = value;
            openRef.current = value;
          });
        },
        onPanResponderMove: (_, g) => {
          const height = menuH || 280;
          const next = Math.max(0, Math.min(1, dragStart.current - g.dy / height));
          open.setValue(next);
          dim.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const value = openRef.current;
          if (value < 0.82 || g.vy > 0.55 || g.dy > 48) {
            finishClose();
          } else {
            snapSheetOpen();
          }
        },
        onPanResponderTerminate: () => {
          if (openRef.current < 0.82) {
            finishClose();
          } else {
            snapSheetOpen();
          }
        },
      }),
    [dim, finishClose, menuH, open, snapSheetOpen],
  );

  const parentName =
    `${userProfile?.fatherFirstName || userProfile?.firstName || ''} ${
      userProfile?.fatherLastName || userProfile?.lastName || ''
    }`.trim() || 'Parent';
  const parentPhoto =
    userProfile?.fatherImage || userProfile?.image
      ? {uri: getImagePath(userProfile.fatherImage || userProfile.image)}
      : profile_icon;
  const schoolItems = SCHOOL_ITEMS.filter(
    item => !item.module || modules[item.module] !== false,
  );

  useEffect(() => {
    if (visible) {
      dispatch(asyncGetAppModules());
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (visible) {
      setShown(true);
      Animated.timing(dim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else if (shown) {
      Animated.timing(dim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, shown, dim]);

  useEffect(() => {
    if (visible && shown && menuH > 0) {
      Animated.spring(open, {
        toValue: 1,
        tension: 68,
        friction: 11,
        useNativeDriver: false,
      }).start();
      return;
    }
    if (!visible && shown) {
      Animated.timing(open, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start(({finished}) => {
        if (!finished) {
          return;
        }
        setShown(false);
      });
    }
  }, [visible, shown, menuH, open]);

  useEffect(() => {
    if (shown || !afterClose.current) {
      return;
    }
    const job = afterClose.current;
    afterClose.current = null;
    const frame = requestAnimationFrame(job);
    return () => cancelAnimationFrame(frame);
  }, [shown]);

  const go = screen => {
    afterClose.current = () => navigation.navigate(screen);
    onClose?.();
  };

  const renderRow = item => (
    <TouchableOpacity
      key={item.label}
      style={styles.row}
      onPress={() => go(item.screen)}
      activeOpacity={0.8}>
      <Ionicons name={item.icon} size={18} color={NAVY} />
      <Text style={styles.rowLabel}>{item.label}</Text>
      {item.screen === routes.screens.notifications &&
      unreadNotifications > 0 ? (
        <View style={styles.rowDot} />
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={MUTED} />
    </TouchableOpacity>
  );

  const width = barWidth || WIDTH;
  const contentHeight = open.interpolate({
    inputRange: [0, 1],
    outputRange: [0, menuH],
  });
  const slideUp = open.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.max(menuH, 24), 0],
  });

  const menuProps = {
    parentName,
    parentPhoto,
    schoolItems,
    renderRow,
    onLogout: () => {
      afterClose.current = () => dispatch(asyncSignOut());
      onClose?.();
    },
  };

  return (
    <Modal
      visible={shown}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={styles.backdropHit} onPress={onClose}>
          <Animated.View style={[styles.dim, {opacity: dim}]} />
        </Pressable>

        <View
          collapsable={false}
          pointerEvents="none"
          style={styles.measure}
          onLayout={event => {
            const next = Math.ceil(event.nativeEvent.layout.height);
            if (next && Math.abs(next - menuH) > 1) {
              setMenuH(next);
            }
          }}>
          <View style={styles.menuInner}>
            <MenuBody {...menuProps} />
          </View>
        </View>

        <View style={styles.dock} pointerEvents="box-none">
          <View style={styles.humpBar} {...handlePan.panHandlers}>
            <Svg
              pointerEvents="none"
              width={width}
              height={HILL_H + 2}
              viewBox={`0 0 ${width} ${HILL_H + 2}`}
              style={styles.humpSvg}>
              <Path d={humpBumpPath(width)} fill="#FFFFFF" />
            </Svg>
            <TouchableOpacity
              style={styles.humpClose}
              onPress={finishClose}
              activeOpacity={0.7}
              hitSlop={{top: 8, bottom: 8, left: 16, right: 16}}
              accessibilityRole="button"
              accessibilityLabel="Close menu">
              <Ionicons name="chevron-down" size={20} color="#C3C8D2" />
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[styles.menuClip, {height: contentHeight}]}
            {...dismissPan.panHandlers}>
            <Animated.View
              style={[styles.menu, {transform: [{translateY: slideUp}]}]}>
              <View style={styles.menuInner}>
                <MenuBody {...menuProps} />
              </View>
            </Animated.View>
          </Animated.View>
          <View
            style={[
              styles.footerWrap,
              {paddingBottom: inset, minHeight: BAR_H + inset},
            ]}>
            {footer}
          </View>
        </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  dock: {
    width: '100%',
    overflow: 'visible',
  },
  humpBar: {
    height: HILL_H,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  humpSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  humpClose: {
    height: HILL_H,
    width: 64,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 2,
  },
  menuClip: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginTop: -1,
  },
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4000,
    opacity: 0,
  },
  menu: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: '#FFFFFF',
  },
  menuInner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  footerWrap: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  kicker: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: MUTED,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  profileCopy: {
    flex: 1,
    marginLeft: 12,
  },
  parentName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: NAVY,
  },
  parentRole: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  section: {
    marginTop: 18,
    marginBottom: 4,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: MUTED,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  rowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E11D48',
    marginRight: 2,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  logoutLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: '#E11D48',
  },
});

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Svg, {Circle, Path} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HILL_H, raisedBarPath} from '../AppFooter/shape';
import Portrait from '../Portrait';
import StudentSheetBody from '../StudentSheetBody';
import {HEIGHT, WIDTH} from '../../theme/units';
import {setDrawerOpener} from '../../Utils/openPageDrawer';
import {attendanceDotColor} from '../../Screens/DailyAttendance/status';
import routes from '../../Navigation/routes';

const PRIMARY = '#035392';
const SIZE = 44;
const SHEET = '#FFFFFF';
const SHEET_H = Math.round(HEIGHT * 0.4);

function EmptyAvatar({onPress}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Add child">
      <View style={styles.avatarSlot}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={SIZE / 2 - 1.5}
            stroke={PRIMARY}
            strokeWidth={1.6}
            strokeDasharray="3.5 3"
            fill="#FFFFFF"
          />
        </Svg>
        <View style={styles.plusOverlay} pointerEvents="none">
          <Ionicons name="add" size={20} color={PRIMARY} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChildSwitcher({
  childList = [],
  selected,
  onSelect,
  onAdd,
  openOnKey,
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const jumping = useRef(false);
  const lastId = useRef(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [barWidth, setBarWidth] = useState(WIDTH);
  const sheetH = SHEET_H + insets.bottom;
  const slideY = useRef(new Animated.Value(sheetH)).current;
  const dim = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const slideRef = useRef(sheetH);
  const dragStart = useRef(0);
  const atTopRef = useRef(true);
  const list = childList || [];
  const canLoop = list.length > 1;
  const active = selected || list[0] || null;
  const activeIndex = Math.max(
    0,
    list.findIndex(item => item._id === active?._id),
  );

  // [last, ...list, first] so swipe past ends loops seamlessly
  const loopData = useMemo(() => {
    if (!canLoop) {
      return list.map((child, index) => ({
        key: `solo-${child._id}`,
        child,
        realIndex: index,
      }));
    }
    const head = list[list.length - 1];
    const tail = list[0];
    return [
      {key: `clone-head-${head._id}`, child: head, realIndex: list.length - 1},
      ...list.map((child, index) => ({
        key: `real-${child._id}`,
        child,
        realIndex: index,
      })),
      {key: `clone-tail-${tail._id}`, child: tail, realIndex: 0},
    ];
  }, [list, canLoop]);

  const pagerIndexForActive = canLoop ? activeIndex + 1 : activeIndex;

  const playChangeAnim = () => {
    pop.setValue(0.82);
    Animated.sequence([
      Animated.spring(pop, {
        toValue: 1.08,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(pop, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!list.length || jumping.current) {
      return;
    }
    const id = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: pagerIndexForActive * SIZE,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [active?._id, pagerIndexForActive, list.length]);

  useEffect(() => {
    if (!active?._id) {
      return;
    }
    if (lastId.current && lastId.current !== active._id) {
      playChangeAnim();
    }
    lastId.current = active._id;
  }, [active?._id]);

  const openPicker = () => setOpen(true);
  const closePicker = () => setOpen(false);
  const onAvatarPress = () => openPicker();

  useEffect(() => {
    const id = slideY.addListener(({value}) => {
      slideRef.current = value;
    });
    return () => slideY.removeListener(id);
  }, [slideY]);

  useEffect(() => {
    if (!openOnKey) {
      return undefined;
    }
    return setDrawerOpener(openOnKey, openPicker);
  }, [openOnKey]);

  useEffect(() => {
    if (open) {
      setShown(true);
      atTopRef.current = true;
    }
  }, [open]);

  const snapSheetOpen = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        tension: 68,
        friction: 11,
        overshootClamping: true,
        useNativeDriver: true,
      }),
      Animated.timing(dim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dim, slideY]);

  useEffect(() => {
    if (open && shown) {
      slideY.setValue(sheetH);
      snapSheetOpen();
      return;
    }
    if (!open && shown) {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: sheetH,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(dim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          setShown(false);
        }
      });
    }
  }, [open, shown, slideY, dim, sheetH, snapSheetOpen]);

  const sheetPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, g) =>
          atTopRef.current &&
          g.dy > 10 &&
          Math.abs(g.dy) > Math.abs(g.dx) * 1.4,
        onPanResponderTerminationRequest: () => !atTopRef.current,
        onShouldBlockNativeResponder: () => false,
        onPanResponderGrant: () => {
          slideY.stopAnimation(value => {
            dragStart.current = value;
            slideRef.current = value;
          });
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, dragStart.current + Math.max(0, g.dy));
          slideY.setValue(next);
          dim.setValue(Math.max(0, Math.min(1, 1 - next / sheetH)));
        },
        onPanResponderRelease: (_, g) => {
          const y = slideRef.current;
          if (y > sheetH * 0.15 || g.vy > 0.55 || g.dy > 56) {
            closePicker();
          } else {
            snapSheetOpen();
          }
        },
        onPanResponderTerminate: () => {
          if (slideRef.current > sheetH * 0.15) {
            closePicker();
          } else {
            snapSheetOpen();
          }
        },
      }),
    [dim, sheetH, slideY, snapSheetOpen],
  );

  // Handle + title: claim once the finger moves down so taps still work
  const handlePan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy > 3 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          slideY.stopAnimation(value => {
            dragStart.current = value;
            slideRef.current = value;
          });
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, dragStart.current + Math.max(0, g.dy));
          slideY.setValue(next);
          dim.setValue(Math.max(0, Math.min(1, 1 - next / sheetH)));
        },
        onPanResponderRelease: (_, g) => {
          const y = slideRef.current;
          if (y > sheetH * 0.15 || g.vy > 0.55 || g.dy > 48) {
            closePicker();
          } else {
            snapSheetOpen();
          }
        },
        onPanResponderTerminate: () => {
          if (slideRef.current > sheetH * 0.15) {
            closePicker();
          } else {
            snapSheetOpen();
          }
        },
      }),
    [dim, sheetH, slideY, snapSheetOpen],
  );

  const onSheetScroll = useCallback(event => {
    atTopRef.current = event.nativeEvent.contentOffset.y <= 2;
  }, []);

  const choose = child => {
    onSelect?.(child);
    closePicker();
    navigation.navigate(routes.screens.children);
  };

  const addMore = () => {
    closePicker();
    onAdd?.();
  };

  const settleLoop = index => {
    if (!canLoop) {
      return index;
    }
    // Landed on cloned last (top) → jump to real last
    if (index === 0) {
      jumping.current = true;
      const real = list.length;
      listRef.current?.scrollToOffset({
        offset: real * SIZE,
        animated: false,
      });
      requestAnimationFrame(() => {
        jumping.current = false;
      });
      return real;
    }
    // Landed on cloned first (bottom) → jump to real first
    if (index === loopData.length - 1) {
      jumping.current = true;
      listRef.current?.scrollToOffset({
        offset: SIZE,
        animated: false,
      });
      requestAnimationFrame(() => {
        jumping.current = false;
      });
      return 1;
    }
    return index;
  };

  const onPagerEnd = event => {
    if (!list.length) {
      return;
    }
    const offsetY = event.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / SIZE);
    index = Math.max(0, Math.min(loopData.length - 1, index));
    index = settleLoop(index);
    const entry = loopData[index];
    const next = entry?.child;
    if (next && next._id !== active?._id) {
      onSelect?.(next);
    }
  };

  return (
    <>
      {list.length === 0 ? (
        <EmptyAvatar onPress={onAvatarPress} />
      ) : (
        <Animated.View style={[styles.pagerShell, {transform: [{scale: pop}]}]}>
          <FlatList
            ref={listRef}
            data={loopData}
            keyExtractor={item => item.key}
            style={styles.pager}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            decelerationRate="fast"
            snapToInterval={SIZE}
            snapToAlignment="start"
            disableIntervalMomentum
            nestedScrollEnabled
            scrollEnabled={canLoop}
            getItemLayout={(_, index) => ({
              length: SIZE,
              offset: SIZE * index,
              index,
            })}
            onMomentumScrollEnd={onPagerEnd}
            onScrollEndDrag={onPagerEnd}
            renderItem={({item}) => (
              <Pressable
                onPress={onAvatarPress}
                style={styles.page}
                accessibilityRole="button"
                accessibilityLabel="Open child list">
                <Portrait file={item.child?.image} style={styles.avatar} />
              </Pressable>
            )}
          />
          <View
            pointerEvents="none"
            style={[
              styles.statusDot,
              {backgroundColor: attendanceDotColor(active)},
            ]}
          />
        </Animated.View>
      )}

      <Modal
        visible={shown}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closePicker}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdropHit} onPress={closePicker}>
            <Animated.View style={[styles.dim, {opacity: dim}]} />
          </Pressable>
          <Animated.View
            style={[
              styles.sheetDock,
              {
                height: sheetH,
                transform: [{translateY: slideY}],
              },
            ]}
            onLayout={event => {
              const next = event.nativeEvent.layout.width;
              if (next && Math.abs(next - barWidth) > 1) {
                setBarWidth(next);
              }
            }}
            {...sheetPan.panHandlers}>
            <Svg
              pointerEvents="none"
              width={barWidth}
              height={sheetH}
              viewBox={`0 0 ${barWidth} ${sheetH}`}
              style={styles.sheetSvg}>
              <Path
                d={raisedBarPath(barWidth, sheetH - HILL_H)}
                fill={SHEET}
              />
            </Svg>
            <View style={styles.humpBar} {...handlePan.panHandlers}>
              <TouchableOpacity
                style={styles.humpHit}
                onPress={closePicker}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close child list">
                <Ionicons name="chevron-down" size={20} color="#C3C8D2" />
              </TouchableOpacity>
            </View>
            <StudentSheetBody
              title="Switch child"
              subtitle={
                list.length
                  ? 'Tap a child to open their profile'
                  : 'Link a child to get started'
              }
              childList={list}
              activeId={active?._id}
              onSelectChild={choose}
              onAdd={addMore}
              showAddButton={false}
              scrollEnabled
              headerPanHandlers={handlePan.panHandlers}
              onScroll={onSheetScroll}
              style={{paddingBottom: Math.max(insets.bottom, 16)}}
            />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pagerShell: {
    width: SIZE,
    height: SIZE,
    overflow: 'visible',
  },
  pager: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
  },
  page: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#E8EEF5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    zIndex: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F4F5F8',
  },
  avatarSlot: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRoot: {
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
  sheetDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible',
  },
  sheetSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  humpBar: {
    height: HILL_H,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  humpHit: {
    height: HILL_H,
    width: 64,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 2,
  },
});

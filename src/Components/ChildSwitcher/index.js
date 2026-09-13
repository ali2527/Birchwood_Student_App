import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import profile_icon from '../../Assets/images/profile_bg.png';
import {getImagePath} from '../../Service/axios';
import {WIDTH} from '../../theme/units';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PRIMARY = '#035392';
const SIZE = 44;
const DRAWER_W = Math.min(WIDTH * 0.82, 340);

function childName(child) {
  return `${child?.firstName || ''} ${child?.lastName || ''}`.trim() || 'Child';
}

function classLabel(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  const name = classroom.classroomName || classroom.classroomId || '';
  const grade = classroom.classroomGrade;
  if (name && grade) {
    return `${name} • Grade ${grade}`;
  }
  return name || (grade ? `Grade ${grade}` : '');
}

function photoOf(child) {
  return child?.image ? {uri: getImagePath(child.image)} : profile_icon;
}

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
}) {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const jumping = useRef(false);
  const lastId = useRef(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const drawerX = useRef(new Animated.Value(DRAWER_W)).current;
  const dim = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
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

  useEffect(() => {
    if (open) {
      setShown(true);
    }
  }, [open]);

  useEffect(() => {
    if (open && shown) {
      drawerX.setValue(DRAWER_W);
      Animated.parallel([
        Animated.spring(drawerX, {
          toValue: 0,
          tension: 68,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(dim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    if (!open && shown) {
      Animated.parallel([
        Animated.timing(drawerX, {
          toValue: DRAWER_W,
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
  }, [open, shown, drawerX, dim]);

  const choose = child => {
    onSelect?.(child);
    closePicker();
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
        <EmptyAvatar onPress={openPicker} />
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
                onPress={openPicker}
                style={styles.page}
                accessibilityRole="button"
                accessibilityLabel="Switch child">
                <Image source={photoOf(item.child)} style={styles.avatar} />
              </Pressable>
            )}
          />
        </Animated.View>
      )}

      <Modal
        visible={shown}
        transparent
        animationType="none"
        statusBarTranslucent={false}
        onRequestClose={closePicker}>
        <SafeAreaView style={styles.modalRoot} edges={['top']}>
          <View style={styles.stage}>
            <Pressable style={styles.backdropHit} onPress={closePicker}>
              <Animated.View style={[styles.dim, {opacity: dim}]} />
            </Pressable>
            <View style={styles.drawerSlot} pointerEvents="box-none">
              <Animated.View
                style={[
                  styles.drawer,
                  {
                    paddingTop: 12,
                    paddingBottom: Math.max(insets.bottom, 16),
                    transform: [{translateX: drawerX}],
                  },
                ]}>
                <View style={styles.drawerHead}>
                  <Text style={styles.cardTitle}>
                    {list.length ? 'Children' : 'No children linked'}
                  </Text>
                  <TouchableOpacity
                    onPress={closePicker}
                    style={styles.closeBtn}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    accessibilityRole="button"
                    accessibilityLabel="Close">
                    <Ionicons name="close" size={22} color={NAVY} />
                  </TouchableOpacity>
                </View>
                {list.length ? (
                  <ScrollView
                    style={styles.list}
                    showsVerticalScrollIndicator={false}>
                    {list.map(child => {
                      const selectedRow = child._id === active?._id;
                      const klass = classLabel(child.classroom);
                      return (
                        <TouchableOpacity
                          key={child._id}
                          style={[
                            styles.row,
                            selectedRow && styles.rowSelected,
                          ]}
                          onPress={() => choose(child)}
                          activeOpacity={0.8}>
                          <Image
                            source={photoOf(child)}
                            style={styles.rowPhoto}
                          />
                          <View style={styles.rowCopy}>
                            <Text style={styles.rowName} numberOfLines={1}>
                              {childName(child)}
                            </Text>
                            {klass ? (
                              <Text style={styles.rowMeta} numberOfLines={1}>
                                {klass}
                              </Text>
                            ) : null}
                          </View>
                          {selectedRow ? (
                            <View style={styles.check}>
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#FFFFFF"
                              />
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyCopy}>
                    Link a child to personalize Home, attendance and homework.
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={addMore}
                  activeOpacity={0.85}>
                  <View style={styles.addIcon}>
                    <Ionicons name="add" size={18} color={PRIMARY} />
                  </View>
                  <Text style={styles.addLabel}>Add child</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pagerShell: {
    width: SIZE,
    height: SIZE,
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
  },
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  backdropHit: {
    ...StyleSheet.absoluteFillObject,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  drawerSlot: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: DRAWER_W,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  drawerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6FB',
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 20,
    color: NAVY,
  },
  list: {
    flex: 1,
  },
  emptyCopy: {
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 14,
  },
  rowSelected: {
    backgroundColor: '#F3F6FB',
  },
  rowPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEF5',
  },
  rowCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  rowName: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  rowMeta: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginHorizontal: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    marginLeft: 12,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: PRIMARY,
  },
});

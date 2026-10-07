import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, {Path} from 'react-native-svg';
import {useDispatch} from 'react-redux';
import fonts from '../../Assets/fonts';
import profile_icon from '../../Assets/images/profile_bg.png';
import {HILL_H, raisedBarPath} from '../../Components/AppFooter/shape';
import {getImagePath} from '../../Service/axios';
import {HEIGHT, WIDTH} from '../../theme/units';
import {useAppSelector} from '../../Stores/hooks';
import {selectChildren} from '../../Stores/slices/class.slice';
import {
  asyncMarkChildDayLeave,
  asyncMarkChildPickup,
  asyncMarkChildPresent,
} from '../../Stores/actions/user.action';
import {attendanceDotColor, attendanceStatusLabel} from './status';

const NAVY = '#0F1F4B';
const PRIMARY = '#035392';
const SHEET_MAX = Math.round(HEIGHT * 0.78);
const LEAVE_REASONS = ['Sick', 'Family', 'Appointment', 'Others'];
const PICKUP_REASONS = ['Appointment', 'Family', 'Unwell'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function easeLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

function photoOf(child) {
  return child?.image ? {uri: getImagePath(child.image)} : profile_icon;
}

function classLabel(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  const name = classroom.classroomName || classroom.classroomId || '';
  const grade = classroom.classroomGrade;
  if (name && grade) {
    return `${name} · Grade ${grade}`;
  }
  return name || (grade ? `Grade ${grade}` : '');
}

function heldLabel(kind) {
  if (kind === 'leave') {
    return 'On leave';
  }
  if (kind === 'pickup') {
    return 'Picked up';
  }
  return 'Checked in';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Karachi',
  });
}

function LeavePanel({children}) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const play = Animated.spring(enter, {
      toValue: 1,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    });
    play.start();
    return () => play.stop();
  }, [enter]);

  return (
    <Animated.View
      style={[
        styles.reasonBox,
        {
          opacity: enter,
          transform: [
            {
              translateY: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

function MarkCard({celebrate, children}) {
  const pop = useRef(new Animated.Value(0)).current;
  const kind =
    celebrate?.kind === 'leave' ? 'leave' : celebrate?.kind === 'pickup' ? 'pickup' : 'present';

  useEffect(() => {
    if (!celebrate) {
      return undefined;
    }
    pop.setValue(0);
    const play = Animated.sequence([
      Animated.spring(pop, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.delay(420),
      Animated.timing(pop, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);
    play.start();
    return () => play.stop();
  }, [celebrate, pop]);

  const scale = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={styles.card}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burst,
          kind === 'leave' ? styles.burstLeave : kind === 'pickup' ? styles.burstPickup : styles.burstPresent,
          {opacity: pop, transform: [{scale}]},
        ]}>
        <Ionicons
          name={kind === 'leave' ? 'calendar' : kind === 'pickup' ? 'walk' : 'checkmark-circle'}
          size={28}
          color={kind === 'leave' ? '#1D4ED8' : kind === 'pickup' ? PRIMARY : '#15803D'}
        />
      </Animated.View>
    </View>
  );
}

export default function DailyAttendance() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const [busyId, setBusyId] = useState('');
  const [leaveFor, setLeaveFor] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [pickupFor, setPickupFor] = useState('');
  const [pickupReason, setPickupReason] = useState('');
  const optionalHold = useRef(!!route.params?.optional);
  const [celebrate, setCelebrate] = useState(null);
  const [marking, setMarking] = useState(null);
  const childrenRef = useRef(children);
  const [holdClose, setHoldClose] = useState(false);
  const [closeAsk, setCloseAsk] = useState(0);
  const holdTimer = useRef(null);
  const [barWidth, setBarWidth] = useState(WIDTH);
  const [bodyH, setBodyH] = useState(360);
  const slide = useRef(new Animated.Value(SHEET_MAX)).current;
  const dim = useRef(new Animated.Value(0)).current;

  childrenRef.current = children;
  const checkInPending = children.filter(child => child.todayPrompt === 'CHECKIN');
  const pickupPending = children.filter(child => child.todayPrompt === 'PICKUP');
  const sessionKind = useRef(
    checkInPending.length ? 'checkin' : pickupPending.length ? 'pickup' : 'optional',
  );
  if (sessionKind.current !== 'pickup' && checkInPending.length) {
    sessionKind.current = 'checkin';
  }
  const showPickup = sessionKind.current === 'pickup';
  const sample = children.find(child => child.schoolStartLabel) || children[0];
  const sessionPending =
    sessionKind.current === 'pickup' ? pickupPending : checkInPending;
  const pending = sessionPending;
  const required = sessionKind.current === 'checkin' && checkInPending.length > 0;
  const sheetH = Math.min(SHEET_MAX, bodyH + HILL_H);
  const ordered = [...children].sort((a, b) => {
    const rank = child =>
      child.todayPrompt === 'CHECKIN' ? 0 : child.todayPrompt === 'PICKUP' && showPickup ? 1 : 2;
    return rank(a) - rank(b);
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(dim, {toValue: 1, duration: 180, useNativeDriver: true}),
      Animated.spring(slide, {toValue: 0, useNativeDriver: true, bounciness: 4}),
    ]).start();
  }, [dim, slide]);

  useEffect(() => {
    if (required) {
      optionalHold.current = false;
    }
  }, [required]);

  const requestClose = () => {
    if (required) {
      return;
    }
    optionalHold.current = false;
    setCloseAsk(value => value + 1);
  };

  useEffect(() => {
    if (
      !children.length ||
      pending.length > 0 ||
      optionalHold.current ||
      holdClose
    ) {
      return undefined;
    }
    const close = Animated.parallel([
      Animated.timing(dim, {toValue: 0, duration: 160, useNativeDriver: true}),
      Animated.timing(slide, {toValue: SHEET_MAX, duration: 180, useNativeDriver: true}),
    ]);
    const timer = setTimeout(() => {
      close.start(({finished}) => {
        if (finished && navigation.canGoBack()) {
          navigation.goBack();
        }
      });
    }, 160);
    return () => {
      clearTimeout(timer);
      close.stop();
    };
  }, [children.length, closeAsk, dim, holdClose, navigation, pending.length, slide]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (required) {
        return true;
      }
      requestClose();
      return true;
    });
    return () => sub.remove();
  }, [required]);

  const run = async (childId, action, kind) => {
    setBusyId(childId);
    if (kind) {
      setMarking({id: childId, kind});
      setHoldClose(true);
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
      }
    }
    try {
      const result = await dispatch(action);
      if (!result?.payload || result.payload.status === false) {
        if (kind) {
          setMarking(null);
          setHoldClose(false);
        }
        return;
      }
      if (kind) {
        optionalHold.current = false;
        setCelebrate({id: childId, kind, tick: Date.now()});
        holdTimer.current = setTimeout(() => {
          const others = childrenRef.current.some(child => {
            if (child._id === childId) {
              return false;
            }
            if (sessionKind.current === 'pickup') {
              return child.todayPrompt === 'PICKUP';
            }
            return child.todayPrompt === 'CHECKIN';
          });
          if (others) {
            easeLayout();
            setMarking(null);
          }
          setHoldClose(false);
        }, 780);
      }
      if (leaveFor === childId || pickupFor === childId) {
        easeLayout();
        setLeaveFor('');
        setLeaveReason('');
        setPickupFor('');
        setPickupReason('');
      }
    } finally {
      setBusyId('');
    }
  };

  const openLeave = childId => {
    easeLayout();
    setPickupFor('');
    setPickupReason('');
    setLeaveFor(current => (current === childId ? '' : childId));
    setLeaveReason('');
  };

  const openPickup = childId => {
    easeLayout();
    setLeaveFor('');
    setLeaveReason('');
    setPickupFor(current => (current === childId ? '' : childId));
    setPickupReason('');
  };

  const hint = (() => {
    if (showPickup && children.some(child => child.todayPrompt === 'PICKUP')) {
      return `Pickup is open from ${sample?.pickupOpensLabel || '1:00 PM'}. Earlier than that needs a reason.`;
    }
    if (children.some(child => child.checkInLate && child.todayPrompt === 'CHECKIN')) {
      return `After ${sample?.onTimeUntilLabel || '8:00 AM'} this day is absent. You can still check in, and that check-in is marked late.`;
    }
    if (children.some(child => child.todayPrompt === 'CHECKIN')) {
      return `On-time check-in is ${sample?.checkInOpensLabel || '6:00 AM'} to ${sample?.onTimeUntilLabel || '8:00 AM'}. School starts at ${sample?.schoolStartLabel || '7:00 AM'}.`;
    }
    if (children.some(child => child.canLeave)) {
      return `Check-in opens at ${sample?.checkInOpensLabel || '6:00 AM'}. You can mark leave now.`;
    }
    if (showPickup && children.some(child => child.earlyPickup)) {
      return `Early pickup needs a reason until ${sample?.pickupOpensLabel || '1:00 PM'}.`;
    }
    return 'Everyone is marked for today.';
  })();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Animated.View style={[styles.dim, {opacity: dim}]} />
      <Animated.View
        style={[styles.sheetDock, {height: sheetH, transform: [{translateY: slide}]}]}
        onLayout={event => {
          const next = event.nativeEvent.layout.width;
          if (next && Math.abs(next - barWidth) > 1) {
            setBarWidth(next);
          }
        }}>
        <Svg
          pointerEvents="none"
          width={barWidth}
          height={sheetH}
          viewBox={`0 0 ${barWidth} ${sheetH}`}
          style={styles.sheetSvg}>
          <Path d={raisedBarPath(barWidth, Math.max(sheetH - HILL_H, 1))} fill="#FFFFFF" />
        </Svg>
        <View style={styles.humpBar}>
          <TouchableOpacity
            style={styles.humpHit}
            onPress={requestClose}
            disabled={required}
            activeOpacity={required ? 1 : 0.7}>
            <Ionicons name="chevron-down" size={20} color={required ? '#E5E7EB' : '#C3C8D2'} />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.sheetBody,
            {paddingTop: 28, paddingBottom: Math.max(insets.bottom, 16)},
          ]}
          onLayout={event => {
            const next = Math.ceil(event.nativeEvent.layout.height);
            if (next && Math.abs(next - bodyH) > 2) {
              setBodyH(next);
            }
          }}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="checkmark-done" size={18} color={PRIMARY} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Today's check-in</Text>
            <Text style={styles.subtitle}>{todayLabel()}</Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countText}>
              {pending.length > 0
                ? `${pending.length} left`
                : children.some(child => child.canLeave || (showPickup && child.earlyPickup))
                  ? 'Open'
                  : 'Done'}
            </Text>
          </View>
        </View>
        <Text style={styles.hint}>{hint}</Text>
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}>
          {ordered.map(child => {
            const name = `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'Student';
            const busy = busyId === child._id;
            const klass = classLabel(child.classroom);
            const held = marking?.id === child._id ? marking : null;
            const needsCheckIn = child.todayPrompt === 'CHECKIN' && !held;
            const needsPickup = showPickup && child.todayPrompt === 'PICKUP' && !held;
            const showLeave = (needsCheckIn || !!child.canLeave) && !held;
            const showEarlyPickup = showPickup && child.earlyPickup && !held;
            return (
              <MarkCard
                key={child._id}
                celebrate={celebrate?.id === child._id ? celebrate : null}>
                <View style={styles.row}>
                  <View style={styles.photoWrap}>
                    <Image source={photoOf(child)} style={styles.photo} />
                    <View style={[styles.dot, {backgroundColor: attendanceDotColor(child)}]} />
                  </View>
                  <View style={styles.copy}>
                    <Text style={styles.name} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {klass || (held ? heldLabel(held.kind) : attendanceStatusLabel(child))}
                    </Text>
                    {klass ? (
                      <Text style={styles.status} numberOfLines={1}>
                        {held ? heldLabel(held.kind) : attendanceStatusLabel(child)}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {held ? (
                  <View
                    style={[
                      styles.choice,
                      held.kind === 'leave' && styles.leave,
                      held.kind === 'pickup' && styles.pickup,
                      held.kind !== 'leave' && held.kind !== 'pickup' && styles.present,
                    ]}>
                    {busy ? (
                      <ActivityIndicator
                        color={
                          held.kind === 'leave' ? '#1D4ED8' : held.kind === 'pickup' ? PRIMARY : '#15803D'
                        }
                      />
                    ) : (
                      <>
                        <Ionicons
                          name={
                            held.kind === 'leave'
                              ? 'calendar'
                              : held.kind === 'pickup'
                                ? 'walk'
                                : 'checkmark-circle'
                          }
                          size={16}
                          color={
                            held.kind === 'leave' ? '#1D4ED8' : held.kind === 'pickup' ? PRIMARY : '#15803D'
                          }
                        />
                        <Text
                          style={
                            held.kind === 'leave'
                              ? styles.leaveText
                              : held.kind === 'pickup'
                                ? styles.pickupText
                                : styles.presentText
                          }>
                          {heldLabel(held.kind)}
                        </Text>
                      </>
                    )}
                  </View>
                ) : null}
                {showLeave ? (
                  <View style={styles.actions}>
                    {needsCheckIn ? (
                      <TouchableOpacity
                        style={[styles.choice, styles.present]}
                        disabled={!!busyId}
                        onPress={() => run(child._id, asyncMarkChildPresent(child._id), 'present')}
                        activeOpacity={0.85}>
                        {busy ? (
                          <ActivityIndicator color="#15803D" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                            <Text style={styles.presentText}>Check in</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.choice, styles.leave, leaveFor === child._id && styles.leaveOn]}
                      disabled={!!busyId}
                      onPress={() => openLeave(child._id)}
                      activeOpacity={0.85}>
                      <Ionicons name="calendar" size={15} color="#1D4ED8" />
                      <Text style={styles.leaveText}>Leave</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {showLeave && leaveFor === child._id ? (
                  <LeavePanel>
                    <Text style={styles.reasonLabel}>Reason for leave</Text>
                    <View style={styles.reasonChips}>
                      {LEAVE_REASONS.map(reason => {
                        const selected = leaveReason === reason;
                        return (
                          <TouchableOpacity
                            key={reason}
                            style={[styles.reasonChip, selected && styles.reasonChipOn]}
                            onPress={() => setLeaveReason(reason)}
                            activeOpacity={0.85}>
                            <Text style={[styles.reasonChipText, selected && styles.reasonChipTextOn]}>
                              {reason}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <TextInput
                      value={LEAVE_REASONS.includes(leaveReason) ? '' : leaveReason}
                      onChangeText={setLeaveReason}
                      placeholder="Or write a reason"
                      placeholderTextColor="#9AA3B5"
                      style={styles.reasonInput}
                    />
                    <TouchableOpacity
                      style={[styles.reasonSave, !leaveReason.trim() && styles.reasonSaveOff]}
                      disabled={!!busyId || !leaveReason.trim()}
                      onPress={() =>
                        run(
                          child._id,
                          asyncMarkChildDayLeave({
                            childId: child._id,
                            leaveReason: leaveReason.trim(),
                          }),
                          'leave',
                        )
                      }
                      activeOpacity={0.85}>
                      {busy ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.reasonSaveText}>Save leave</Text>
                      )}
                    </TouchableOpacity>
                  </LeavePanel>
                ) : null}
                {showEarlyPickup ? (
                  <TouchableOpacity
                    style={[styles.pickup, pickupFor === child._id && styles.leaveOn]}
                    disabled={!!busyId}
                    onPress={() => openPickup(child._id)}
                    activeOpacity={0.85}>
                    <Ionicons name="walk" size={16} color={PRIMARY} />
                    <Text style={styles.pickupText}>Early pickup</Text>
                  </TouchableOpacity>
                ) : null}
                {showEarlyPickup && pickupFor === child._id ? (
                  <LeavePanel>
                    <Text style={styles.reasonLabel}>Reason for early pickup</Text>
                    <View style={styles.reasonChips}>
                      {PICKUP_REASONS.map(reason => {
                        const selected = pickupReason === reason;
                        return (
                          <TouchableOpacity
                            key={reason}
                            style={[styles.reasonChip, selected && styles.reasonChipOn]}
                            onPress={() => setPickupReason(reason)}
                            activeOpacity={0.85}>
                            <Text style={[styles.reasonChipText, selected && styles.reasonChipTextOn]}>
                              {reason}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <TextInput
                      value={PICKUP_REASONS.includes(pickupReason) ? '' : pickupReason}
                      onChangeText={setPickupReason}
                      placeholder="Or write a reason"
                      placeholderTextColor="#9AA3B5"
                      style={styles.reasonInput}
                    />
                    <TouchableOpacity
                      style={[styles.reasonSave, !pickupReason.trim() && styles.reasonSaveOff]}
                      disabled={!!busyId || !pickupReason.trim()}
                      onPress={() =>
                        run(
                          child._id,
                          asyncMarkChildPickup({
                            childId: child._id,
                            pickupReason: pickupReason.trim(),
                          }),
                          'pickup',
                        )
                      }
                      activeOpacity={0.85}>
                      {busy ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.reasonSaveText}>Confirm early pickup</Text>
                      )}
                    </TouchableOpacity>
                  </LeavePanel>
                ) : null}
                {needsPickup ? (
                  <TouchableOpacity
                    style={[styles.pickup, styles.pickupRequired]}
                    disabled={!!busyId}
                    onPress={() => run(child._id, asyncMarkChildPickup(child._id), 'pickup')}
                    activeOpacity={0.85}>
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="walk" size={16} color="#fff" />
                        <Text style={[styles.pickupText, styles.pickupTextOn]}>Mark pickup</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}
              </MarkCard>
            );
          })}
        </ScrollView>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 31, 75, 0.46)',
  },
  sheetDock: {
    width: '100%',
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
    backgroundColor: 'transparent',
  },
  humpHit: {
    height: HILL_H,
    width: 64,
    paddingTop: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sheetBody: {
    paddingHorizontal: 16,
    maxHeight: SHEET_MAX - HILL_H,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E8F1F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {flex: 1, minWidth: 0},
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: '#8B93A7',
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F6FB',
  },
  countText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    color: PRIMARY,
  },
  hint: {
    marginTop: 10,
    marginBottom: 12,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  list: {flexGrow: 0},
  listContent: {gap: 10, paddingBottom: 4},
  card: {
    backgroundColor: '#F7F8FB',
    borderRadius: 18,
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  cardPresent: {
    backgroundColor: '#ECFDF3',
  },
  cardPickup: {
    backgroundColor: '#E8F1F8',
  },
  cardLeave: {
    backgroundColor: '#EEF4FF',
  },
  burst: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstPresent: {
    backgroundColor: '#DCFCE7',
  },
  burstPickup: {
    backgroundColor: '#E8F1F8',
  },
  burstLeave: {
    backgroundColor: '#DBEAFE',
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  photoWrap: {width: 48, height: 48},
  photo: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8EEF5'},
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#F7F8FB',
  },
  copy: {flex: 1, minWidth: 0},
  name: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 15, color: NAVY},
  meta: {marginTop: 2, fontFamily: fonts.euclidCircularA.regular, fontSize: 12, color: '#8B93A7'},
  status: {marginTop: 2, fontFamily: fonts.euclidCircularA.medium, fontSize: 12, color: '#374151'},
  actions: {flexDirection: 'row', gap: 8},
  choice: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  present: {backgroundColor: '#DCFCE7'},
  leave: {backgroundColor: '#E0ECFF'},
  presentText: {color: '#15803D', fontFamily: fonts.euclidCircularA.semiBold, fontSize: 14},
  leaveText: {color: '#1D4ED8', fontFamily: fonts.euclidCircularA.semiBold, fontSize: 14},
  leaveOn: {borderWidth: 1, borderColor: '#1D4ED8'},
  reasonBox: {gap: 8},
  reasonLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: '#374151',
  },
  reasonChips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E2F2',
  },
  reasonChipOn: {backgroundColor: '#E0ECFF', borderColor: '#1D4ED8'},
  reasonChipText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#374151',
  },
  reasonChipTextOn: {color: '#1D4ED8'},
  reasonInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E2F2',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: NAVY,
  },
  reasonSave: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonSaveOff: {opacity: 0.45},
  reasonSaveText: {color: '#FFFFFF', fontFamily: fonts.euclidCircularA.semiBold, fontSize: 14},
  pickup: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E2F2',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pickupRequired: {backgroundColor: PRIMARY, borderColor: PRIMARY},
  pickupText: {color: PRIMARY, fontFamily: fonts.euclidCircularA.semiBold, fontSize: 14},
  pickupTextOn: {color: '#FFFFFF'},
});

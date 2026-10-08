import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, {Path} from 'react-native-svg';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import {HILL_H, raisedBarPath} from '../../Components/AppFooter/shape';
import Portrait from '../../Components/Portrait';
import StudentSheetBody from '../../Components/StudentSheetBody';
import routes from '../../Navigation/routes';
import {asyncGetAllMyChildren} from '../../Stores/actions/user.action';
import {attendanceDotColor, attendanceStatusLabel} from '../DailyAttendance/status';
import {useAppSelector} from '../../Stores/hooks';
import {
  selectChildren,
  selectSelectedChild,
  setSelectedChild,
} from '../../Stores/slices/class.slice';
import {HEIGHT, WIDTH} from '../../theme/units';

const BLUE = '#2F5BEA';
const SHEET = '#FFFFFF';

function classroomLabel(classroom) {
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

function childName(child) {
  return `${child?.firstName || ''} ${child?.lastName || ''}`.trim() || 'Child';
}

function teacherName(classroom) {
  const teacher = classroom?.teacher;
  if (!teacher || typeof teacher === 'string') {
    return '';
  }
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function listText(value) {
  const items = asList(value);
  return items.length ? items.join(', ') : '';
}

function InfoRow({label, value, last}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export default function Children() {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const active = selectedChild || children[0];
  const [expanded, setExpanded] = useState(false);
  const [barWidth, setBarWidth] = useState(WIDTH);

  const topPad = Math.max(insets.top, 10) + 8;
  const safeBottom = Math.max(insets.bottom, 0);
  const sheetHeight = Math.round(HEIGHT * 0.4);
  const maxSlide = Math.max(sheetHeight - HILL_H, 0);

  const slide = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(0);
  const startY = useRef(0);
  const expandedRef = useRef(expanded);
  const atEndRef = useRef(false);
  const sheetAtTopRef = useRef(true);

  useEffect(() => {
    const id = slide.addListener(({value}) => {
      slideRef.current = value;
    });
    return () => slide.removeListener(id);
  }, [slide]);

  useEffect(() => {
    dispatch(asyncGetAllMyChildren());
  }, [dispatch]);

  const snapTo = useCallback(
    openFull => {
      const toValue = openFull ? maxSlide : 0;
      expandedRef.current = openFull;
      Animated.spring(slide, {
        toValue,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
        mass: 0.8,
        overshootClamping: true,
        restDisplacementThreshold: 0.2,
        restSpeedThreshold: 0.2,
      }).start(({finished}) => {
        if (finished) {
          setExpanded(openFull);
        }
      });
    },
    [maxSlide, slide],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx) * 1.1,
        onMoveShouldSetPanResponderCapture: (_, g) => {
          const vertical =
            Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx) * 1.2;
          if (!vertical) {
            return false;
          }
          // Drawer open: swipe down from top of list closes it
          if (!expandedRef.current && sheetAtTopRef.current && g.dy > 8) {
            return true;
          }
          // Drawer tucked: allow drag on remaining sheet
          if (expandedRef.current) {
            return true;
          }
          return false;
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startY.current = slideRef.current;
          slide.stopAnimation(value => {
            startY.current = value;
            slideRef.current = value;
          });
        },
        onPanResponderMove: (_, g) => {
          let next = startY.current + g.dy;
          if (next < 0) {
            next = next * 0.28;
          } else if (next > maxSlide) {
            next = maxSlide + (next - maxSlide) * 0.28;
          }
          slide.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const current = Math.min(maxSlide, Math.max(0, slideRef.current));
          let openFull = current > maxSlide * 0.38;
          if (g.vy > 0.65) {
            openFull = true;
          } else if (g.vy < -0.65) {
            openFull = false;
          }
          snapTo(openFull);
        },
        onPanResponderTerminate: () => {
          snapTo(slideRef.current > maxSlide * 0.38);
        },
      }),
    [maxSlide, slide, snapTo],
  );

  const pagePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, g) =>
          expandedRef.current &&
          atEndRef.current &&
          g.dy < -12 &&
          Math.abs(g.dy) > Math.abs(g.dx) * 1.4,
        onMoveShouldSetPanResponder: (_, g) =>
          expandedRef.current &&
          atEndRef.current &&
          g.dy < -12 &&
          Math.abs(g.dy) > Math.abs(g.dx) * 1.4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startY.current = slideRef.current;
          slide.stopAnimation(value => {
            startY.current = value;
            slideRef.current = value;
          });
        },
        onPanResponderMove: (_, g) => {
          let next = startY.current + g.dy;
          if (next < 0) {
            next = next * 0.28;
          } else if (next > maxSlide) {
            next = maxSlide + (next - maxSlide) * 0.28;
          }
          slide.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const current = Math.min(maxSlide, Math.max(0, slideRef.current));
          let openFull = current > maxSlide * 0.38;
          if (g.vy > 0.65) {
            openFull = true;
          } else if (g.vy < -0.65) {
            openFull = false;
          }
          snapTo(openFull);
        },
        onPanResponderTerminate: () => {
          snapTo(slideRef.current > maxSlide * 0.38);
        },
      }),
    [maxSlide, slide, snapTo],
  );

  const selectChild = child => {
    dispatch(setSelectedChild(child));
    snapTo(false);
  };

  const activeClass = classroomLabel(active?.classroom);
  const teacher = teacherName(active?.classroom);
  const dob = active?.birthday
    ? moment(active.birthday).format('D MMM YYYY')
    : '';
  const age =
    active?.age ||
    (active?.birthday ? moment().diff(moment(active.birthday), 'years') : '');
  const ageLabel = age ? `${age} years` : '';
  const openEdit = () => {
    if (!active?._id) {
      navigation.navigate(routes.screens.addChild);
      return;
    }
    navigation.navigate(routes.screens.editChild, {childId: active._id});
  };
  const scrollPad = (expanded ? HILL_H : sheetHeight) + safeBottom + 28;

  const chevronRotate = slide.interpolate({
    inputRange: [0, Math.max(maxSlide, 1)],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp',
  });

  const onProfileScroll = useCallback(event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    atEndRef.current =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 36;
  }, []);

  const onSheetScroll = useCallback(event => {
    sheetAtTopRef.current = event.nativeEvent.contentOffset.y <= 2;
  }, []);

  return (
    <View style={styles.screen}>
      {focused ? (
        <StatusBar barStyle="light-content" backgroundColor={BLUE} />
      ) : null}

      <View
        style={[styles.blueHeader, {paddingTop: topPad}]}
        {...pagePanResponder.panHandlers}>
        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Children</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={openEdit}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Edit child">
            <Feather name="edit-2" size={15} color={BLUE} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.heroScrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          scrollEventThrottle={16}
          onScroll={onProfileScroll}
          contentContainerStyle={[styles.heroScroll, {paddingBottom: scrollPad}]}>
          {active ? (
            <View style={styles.hero}>
              <View style={styles.heroPhotoWrap}>
                <Portrait file={active?.image} style={styles.heroPhoto} />
                <View
                  style={[
                    styles.onlineDot,
                    {backgroundColor: attendanceDotColor(active)},
                  ]}
                />
              </View>
              <Text style={styles.heroName} numberOfLines={2}>
                {childName(active)}
              </Text>
              <Text style={styles.heroMeta} numberOfLines={1}>
                {activeClass || 'Class not assigned'}
              </Text>
              <Text style={styles.heroStatus}>
                {attendanceStatusLabel(active)}
              </Text>

              <Text style={styles.sectionLabel}>School</Text>
              <View style={styles.card}>
                <InfoRow label="Roll number" value={active?.rollNumber} />
                <InfoRow label="Term" value={active?.term} />
                <InfoRow label="Birthday" value={dob} />
                <InfoRow label="Age" value={ageLabel} />
                <InfoRow label="Teacher" value={teacher} last />
              </View>

              <Text style={styles.sectionLabel}>Health</Text>
              <View style={styles.card}>
                <InfoRow label="Allergies" value={listText(active?.allergies)} />
                <InfoRow
                  label="Conditions"
                  value={listText(active?.conditions)}
                />
                <InfoRow label="Fears" value={listText(active?.fears)} />
                <InfoRow label="Notes" value={listText(active?.summary)} last />
              </View>
            </View>
          ) : (
            <View style={styles.heroEmpty}>
              <View style={styles.heroEmptyIcon}>
                <Ionicons name="people-outline" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.heroName}>No children yet</Text>
              <Text style={styles.heroMeta}>
                Use the plus in the drawer to link a child
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.sheetClip, {bottom: safeBottom}]}>
        <Animated.View
          style={[
            styles.sheetDock,
            {
              height: sheetHeight,
              bottom: 0,
              transform: [{translateY: slide}],
            },
          ]}
          onLayout={event => {
            const next = event.nativeEvent.layout.width;
            if (next && Math.abs(next - barWidth) > 1) {
              setBarWidth(next);
            }
          }}
          {...panResponder.panHandlers}>
        <Svg
          pointerEvents="none"
          width={barWidth}
          height={sheetHeight}
          viewBox={`0 0 ${barWidth} ${sheetHeight}`}
          style={styles.sheetSvg}>
          <Path
            d={raisedBarPath(barWidth, sheetHeight - HILL_H)}
            fill={SHEET}
          />
        </Svg>
        <View style={styles.humpBar}>
          <TouchableOpacity
            style={styles.humpHit}
            activeOpacity={0.75}
            onPress={() => snapTo(!expandedRef.current)}
            accessibilityRole="button"
            accessibilityLabel={
              expanded ? 'Show child list' : 'Hide child list'
            }>
            <Animated.View style={{transform: [{rotate: chevronRotate}]}}>
              <Ionicons name="chevron-down" size={20} color="#C3C8D2" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <StudentSheetBody
          title="Linked children"
          subtitle={
            children.length
              ? 'Selected child is used across the app'
              : 'Link a child to get started'
          }
          childList={children}
          activeId={active?._id}
          onSelectChild={selectChild}
          onAdd={() => navigation.navigate(routes.screens.addChild)}
          showAddButton={false}
          scrollEnabled={!expanded}
          onScroll={onSheetScroll}
          style={{paddingBottom: HILL_H + 16}}
        />
        </Animated.View>
      </View>

      <View
        pointerEvents="none"
        style={[styles.navBarFill, {height: safeBottom}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  blueHeader: {
    flex: 1,
    backgroundColor: BLUE,
    paddingHorizontal: 20,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    zIndex: 2,
    backgroundColor: BLUE,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 4,
    width: '100%',
  },
  heroEmpty: {
    alignItems: 'center',
    paddingTop: 24,
  },
  heroEmptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroPhotoWrap: {
    width: 96,
    height: 96,
    marginBottom: 14,
  },
  heroPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
  },
  editBtnText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: BLUE,
  },
  onlineDot: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: BLUE,
  },
  onlineDotOff: {
    backgroundColor: '#94A3B8',
  },
  heroName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  heroMeta: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.86)',
    textAlign: 'center',
  },
  heroStatus: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  heroScrollView: {
    flex: 1,
  },
  heroScroll: {
    paddingBottom: 28,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    marginTop: 22,
    marginBottom: 8,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  infoLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.68)',
  },
  infoValue: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'right',
  },
  sheetClip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sheetDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'visible',
  },
  navBarFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 20,
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

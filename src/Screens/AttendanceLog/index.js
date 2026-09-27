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
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, {Path} from 'react-native-svg';
import fonts from '../../Assets/fonts';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import {BAR_H, HILL_H, raisedBarPath} from '../../Components/AppFooter/shape';
import {setDrawerOpener} from '../../Utils/openPageDrawer';
import {asyncGetAllChildAttendance, asyncGetAllHolidays} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectSelectedChild} from '../../Stores/slices/class.slice';
import {selectHolidays, selectUserAttendance} from '../../Stores/slices/user.slice';
import {calendarDayKey} from '../../Utils/calendarDay';
import {HEIGHT, WIDTH} from '../../theme/units';

const BLUE = '#2F5BEA';
const BLUE_SOFT = '#6B8CFF';
const SHEET = '#FFFFFF';
const CARD = '#F4F5F8';
const INK = '#0F1F4B';
const MUTED = '#8B93A7';
// Match react-native-calendar-picker dayButton: 30 * min(w,h) / 375
const CAL_WIDTH = WIDTH - 20;
const DAY_SCALER = Math.min(CAL_WIDTH, HEIGHT) / 375;
const DAY_SIZE = 30 * DAY_SCALER;
const dayCircle = {
  width: DAY_SIZE,
  height: DAY_SIZE,
  borderRadius: DAY_SIZE / 2,
  alignSelf: 'center',
  justifyContent: 'center',
  alignItems: 'center',
};

const MARKS = {
  PRESENT: {bg: 'rgba(134,201,146,0.95)', text: '#FFFFFF', icon: 'checkmark', tint: '#2E7A3D'},
  LATE: {bg: 'rgba(232,149,74,0.95)', text: '#FFFFFF', icon: 'time-outline', tint: '#C56A1A'},
  ABSENT: {bg: 'rgba(224,122,124,0.95)', text: '#FFFFFF', icon: 'close', tint: '#C44548'},
  LEAVE: {bg: 'rgba(224,184,58,0.95)', text: '#FFFFFF', icon: 'calendar-outline', tint: '#A68512'},
  HOLIDAY: {bg: 'rgba(255,255,255,0.18)', text: '#FFFFFF', icon: 'sunny-outline', tint: '#2F5BEA'},
};

function dayKey(value) {
  const date = moment(value);
  return date.isValid() ? date.format('YYYY-MM-DD') : '';
}

function describeRecord(record) {
  if (!record) {
    return {key: 'NONE', label: 'Not marked', detail: 'No attendance saved for this day.'};
  }
  const status = String(record.status || '').toUpperCase();
  const arrived = record.checkIn ? moment(record.checkIn).format('h:mm A') : '';
  const left = record.checkOut ? moment(record.checkOut).format('h:mm A') : '';
  if (status === 'LEAVE') {
    return {
      key: 'LEAVE',
      label: 'On leave',
      detail: record.leaveReason || 'Marked away from school',
    };
  }
  if (status === 'ABSENT') {
    return {key: 'ABSENT', label: 'Absent', detail: 'Not in school'};
  }
  if (status === 'HOLIDAY') {
    return {key: 'HOLIDAY', label: 'Holiday', detail: 'School holiday'};
  }
  if (status === 'PRESENT' && record.earlyPickup) {
    return {
      key: 'LATE',
      label: 'Early pickup',
      detail: [left && `Picked up ${left}`, record.pickupReason].filter(Boolean).join(' · ') || 'Left early',
    };
  }
  if (status === 'PRESENT' && record.late) {
    return {key: 'LATE', label: 'Late', detail: arrived ? `Checked in ${arrived}` : 'Arrived after 8:00 AM'};
  }
  if (status === 'PRESENT' && left) {
    return {key: 'PRESENT', label: 'Picked up', detail: `In ${arrived || '—'} · Out ${left}`};
  }
  if (status === 'PRESENT') {
    return {key: 'PRESENT', label: 'Present', detail: arrived ? `Checked in ${arrived}` : 'In school'};
  }
  return {key: 'NONE', label: 'Not marked', detail: 'No attendance saved for this day.'};
}

function NavChevron({name, onPress}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
      style={styles.navHit}>
      <Ionicons name={name} size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function AttendanceLog() {
  const focused = useIsFocused();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const selectedChild = useAppSelector(selectSelectedChild);
  const attendance = useAppSelector(selectUserAttendance);
  const holidaysByMonth = useAppSelector(selectHolidays);
  const childId = selectedChild?._id;
  const [monthCursor, setMonthCursor] = useState(() => moment());
  const [selectedDay, setSelectedDay] = useState(() => moment().format('YYYY-MM-DD'));
  const [expanded, setExpanded] = useState(false);
  const [barWidth, setBarWidth] = useState(WIDTH);

  const topPad = Math.max(insets.top, 10) + 18;
  const tabBarH = BAR_H + insets.bottom;
  const sheetHeight = Math.round(HEIGHT * 0.42);
  const maxSlide = Math.max(sheetHeight - HILL_H, 0);
  const calBlockH = 430;
  const closedBlueH = HEIGHT - HILL_H - tabBarH;
  const centerOffset = Math.max(0, (closedBlueH - calBlockH) / 2 - topPad * 0.35);

  const slide = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(0);
  const startY = useRef(0);
  const expandedRef = useRef(expanded);

  useEffect(() => {
    const id = slide.addListener(({value}) => {
      slideRef.current = value;
    });
    return () => slide.removeListener(id);
  }, [slide]);

  useEffect(() => {
    dispatch(asyncGetAllHolidays({silent: true}));
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

  useFocusEffect(
    useCallback(() => {
      snapTo(false);
      if (childId) {
        dispatch(asyncGetAllChildAttendance({childId, silent: true}));
      }
    }, [childId, dispatch, snapTo]),
  );

  useEffect(() => {
    return setDrawerOpener('attendance', () => snapTo(false));
  }, [snapTo]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx) * 1.1,
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
            next *= 0.28;
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
          expandedRef.current && g.dy < -10 && Math.abs(g.dy) > Math.abs(g.dx) * 1.2,
        onMoveShouldSetPanResponder: (_, g) =>
          expandedRef.current && g.dy < -10 && Math.abs(g.dy) > Math.abs(g.dx) * 1.2,
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
            next *= 0.28;
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

  const calTranslateY = slide.interpolate({
    inputRange: [0, maxSlide],
    outputRange: [0, centerOffset],
    extrapolate: 'clamp',
  });

  const hintOpacity = slide.interpolate({
    inputRange: [maxSlide * 0.55, maxSlide],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const records = useMemo(() => {
    const list = attendance?.attendance;
    return Array.isArray(list) ? list : [];
  }, [attendance]);

  const byDay = useMemo(() => {
    const map = {};
    records.forEach(item => {
      const key = dayKey(item.checkIn || item.createdAt);
      if (key) {
        map[key] = item;
      }
    });
    return map;
  }, [records]);

  const holidayDays = useMemo(() => {
    const map = {};
    Object.values(holidaysByMonth || {}).forEach(monthMap => {
      Object.values(monthMap || {}).forEach(holiday => {
        if (String(holiday.audience || 'BOTH').toUpperCase() === 'TEACHER') {
          return;
        }
        const startKey = calendarDayKey(holiday.date);
        if (!startKey) {
          return;
        }
        const endKey = calendarDayKey(holiday.endDate) || startKey;
        const cursor = moment(startKey, 'YYYY-MM-DD');
        const end = moment(endKey, 'YYYY-MM-DD');
        const last = end.isValid() ? end : cursor.clone();
        while (cursor.isValid() && cursor.isSameOrBefore(last, 'day')) {
          map[cursor.format('YYYY-MM-DD')] = holiday;
          cursor.add(1, 'day');
        }
      });
    });
    return map;
  }, [holidaysByMonth]);

  const monthKey = monthCursor.format('YYYY-MM');
  const monthRecords = useMemo(
    () =>
      records
        .filter(item => dayKey(item.checkIn || item.createdAt).startsWith(monthKey))
        .sort((a, b) => moment(b.checkIn || b.createdAt).valueOf() - moment(a.checkIn || a.createdAt).valueOf()),
    [monthKey, records],
  );

  const counts = useMemo(() => {
    const tally = {PRESENT: 0, ABSENT: 0, LEAVE: 0, LATE: 0};
    monthRecords.forEach(item => {
      const info = describeRecord(item);
      if (info.label === 'Late') tally.LATE += 1;
      else if (info.key === 'ABSENT') tally.ABSENT += 1;
      else if (info.key === 'LEAVE') tally.LEAVE += 1;
      else if (info.key === 'PRESENT' || info.key === 'LATE') tally.PRESENT += 1;
    });
    return tally;
  }, [monthRecords]);

  const selectedRecord = byDay[selectedDay];
  const selectedHoliday = holidayDays[selectedDay];
  const selectedInfo = selectedRecord
    ? describeRecord(selectedRecord)
    : selectedHoliday
      ? {key: 'HOLIDAY', label: 'Holiday', detail: selectedHoliday.name || selectedHoliday.title || 'School holiday'}
      : describeRecord(null);

  const childName = [selectedChild?.firstName, selectedChild?.lastName].filter(Boolean).join(' ');
  const todayKey = moment().format('YYYY-MM-DD');
  const todayIsSelected = selectedDay === todayKey;
  const monthCount = counts.PRESENT + counts.ABSENT + counts.LEAVE + counts.LATE;

  const customDatesStyles = useCallback(
    date => {
      const key = moment(date).format('YYYY-MM-DD');
      const record = byDay[key];
      const holiday = holidayDays[key];
      const kind = record ? describeRecord(record).key : holiday ? 'HOLIDAY' : '';
      const mark = MARKS[kind];
      const isSelected = key === selectedDay;
      const isToday = key === todayKey;

      if (isSelected) {
        return {style: styles.selectedDay, textStyle: styles.selectedDayText};
      }
      if (mark) {
        return {
          style: {...dayCircle, backgroundColor: mark.bg},
          textStyle: {
            color: mark.text,
            fontWeight: '700',
            fontFamily: fonts.euclidCircularA.semiBold,
          },
        };
      }
      if (isToday) {
        return {
          style: {
            ...dayCircle,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.22)',
          },
          textStyle: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontFamily: fonts.euclidCircularA.semiBold,
          },
        };
      }
      return {
        style: dayCircle,
        textStyle: {
          color: 'rgba(255,255,255,0.92)',
          fontFamily: fonts.euclidCircularA.medium,
        },
      };
    },
    [byDay, holidayDays, selectedDay, todayKey],
  );

  const goToday = () => {
    const now = moment();
    setMonthCursor(now.clone());
    setSelectedDay(now.format('YYYY-MM-DD'));
    snapTo(false);
  };

  const shiftMonth = delta => {
    setMonthCursor(prev => prev.clone().add(delta, 'month'));
  };

  return (
    <View style={styles.screen}>
      {focused ? <StatusBar barStyle="light-content" backgroundColor={BLUE} /> : null}

      <View style={[styles.blueHeader, {paddingTop: topPad}]} {...pagePanResponder.panHandlers}>
        <View style={styles.headerNav}>
          <Text style={styles.headerTitle}>Attendance</Text>
          <TouchableOpacity style={styles.todayChip} onPress={goToday} activeOpacity={0.85}>
            <Ionicons name="today-outline" size={16} color={BLUE} />
            <Text style={styles.todayChipText}>Today</Text>
          </TouchableOpacity>
        </View>

        {monthCount > 0 ? (
          <Animated.View pointerEvents="none" style={[styles.heroBadges, {opacity: hintOpacity}]}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {`${counts.PRESENT} present · ${counts.ABSENT} absent`}
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View style={[styles.calBlock, {transform: [{translateY: calTranslateY}]}]}>
          <View style={styles.monthNav}>
            <NavChevron name="chevron-back" onPress={() => shiftMonth(-1)} />
            <Text style={styles.monthTitle}>{monthCursor.format('MMMM YYYY')}</Text>
            <NavChevron name="chevron-forward" onPress={() => shiftMonth(1)} />
          </View>

          <CalendarPickerComponent
            key={monthKey}
            width={CAL_WIDTH}
            scaleFactor={375}
            dayShape="circle"
            startFromMonday={false}
            selectedStartDate={moment(selectedDay).toDate()}
            initialDate={monthCursor.toDate()}
            onDateChange={date => {
              if (!date) return;
              setSelectedDay(moment(date).format('YYYY-MM-DD'));
              if (expanded) snapTo(false);
            }}
            onMonthChange={date => {
              if (date) setMonthCursor(moment(date));
            }}
            customDatesStyles={customDatesStyles}
            todayBackgroundColor="rgba(255,255,255,0.22)"
            todayTextStyle={todayIsSelected ? styles.todaySelectedText : styles.todayText}
            selectedDayColor="#FFFFFF"
            selectedDayTextColor={BLUE}
            selectedDayStyle={styles.selectedDay}
            textStyle={styles.calDayText}
            dayLabelsWrapper={styles.dayLabels}
            monthTitleStyle={styles.hiddenHeader}
            yearTitleStyle={styles.hiddenHeader}
            previousComponent={<View />}
            nextComponent={<View />}
            headerWrapperStyle={styles.hiddenHeaderWrap}
            monthYearHeaderWrapperStyle={styles.hiddenHeaderWrap}
            customDayHeaderStyles={() => ({
              textStyle: styles.weekdayLabel,
            })}
          />

          <Animated.Text style={[styles.fullHint, {opacity: hintOpacity}]}>
            Slide up for attendance
          </Animated.Text>
        </Animated.View>
      </View>

      <View pointerEvents="box-none" style={[styles.sheetClip, {bottom: tabBarH}]}>
        <Animated.View
          style={[
            styles.sheetDock,
            {height: sheetHeight, transform: [{translateY: slide}]},
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
            <Path d={raisedBarPath(barWidth, sheetHeight - HILL_H)} fill={SHEET} />
          </Svg>
          <View style={styles.humpBar}>
            <TouchableOpacity
              style={styles.humpHit}
              activeOpacity={0.75}
              onPress={() => snapTo(!expandedRef.current)}>
              <Ionicons name="chevron-down" size={20} color="#C3C8D2" />
            </TouchableOpacity>
          </View>

          <View style={[styles.sheetBody, {paddingBottom: 12}]}>
            <Text style={styles.sheetTitle}>{moment(selectedDay).format('dddd, D MMMM')}</Text>
            <Text style={styles.sheetSub}>{childName || 'Select a child'}</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              scrollEnabled={!expanded}
              contentContainerStyle={styles.sheetScroll}>
              <View style={styles.stats}>
                {[
                  {label: 'Present', count: counts.PRESENT, tint: '#D7F0DC'},
                  {label: 'Absent', count: counts.ABSENT, tint: '#F8D8D8'},
                  {label: 'Leave', count: counts.LEAVE, tint: '#FBF3D0'},
                  {label: 'Late', count: counts.LATE, tint: '#FBE4D0'},
                ].map(item => (
                  <View key={item.label} style={[styles.stat, {backgroundColor: item.tint}]}>
                    <Text style={styles.statCount}>{item.count}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.dayCard}>
                <View style={[styles.dayIcon, {backgroundColor: MARKS[selectedInfo.key]?.tint || BLUE}]}>
                  <Ionicons
                    name={MARKS[selectedInfo.key]?.icon || 'ellipse-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.dayCopy}>
                  <Text style={styles.dayLabel}>{selectedInfo.label}</Text>
                  <Text style={styles.dayDetail}>{selectedInfo.detail}</Text>
                </View>
              </View>

              <Text style={styles.listHeading}>This month</Text>
              {monthRecords.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.dayLabel}>No marks yet</Text>
                  <Text style={styles.dayDetail}>Attendance for this month will show up here.</Text>
                </View>
              ) : (
                monthRecords.map(item => {
                  const key = dayKey(item.checkIn || item.createdAt);
                  const info = describeRecord(item);
                  const day = moment(key);
                  return (
                    <TouchableOpacity
                      key={item._id || key}
                      style={styles.row}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedDay(key);
                        setMonthCursor(day.clone());
                        snapTo(false);
                      }}>
                      <View style={styles.timeCol}>
                        <Text style={styles.timeText}>{day.format('DD')}</Text>
                        <Text style={styles.timeMon}>{day.format('MMM')}</Text>
                      </View>
                      <View style={styles.rowCard}>
                        <View style={[styles.dot, {backgroundColor: MARKS[info.key]?.tint || BLUE}]} />
                        <View style={styles.dayCopy}>
                          <Text style={styles.dayLabel}>{info.label}</Text>
                          <Text style={styles.dayDetail} numberOfLines={1}>
                            {info.detail}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: BLUE},
  blueHeader: {flex: 1, backgroundColor: BLUE, paddingHorizontal: 12},
  calBlock: {width: '100%'},
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerSide: {flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0},
  backBtn: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  todayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  todayChipText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 13,
    color: BLUE,
  },
  heroBadges: {
    alignItems: 'center',
    minHeight: 28,
    marginBottom: 6,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  navHit: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  monthTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  fullHint: {
    marginTop: 14,
    textAlign: 'center',
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  hiddenHeader: {height: 1, opacity: 0, fontSize: 1, color: 'transparent'},
  hiddenHeaderWrap: {height: 0, opacity: 0, overflow: 'hidden'},
  calDayText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  todayText: {
    color: '#FFFFFF',
    fontFamily: fonts.euclidCircularA.semiBold,
  },
  todaySelectedText: {
    color: BLUE,
    fontFamily: fonts.euclidCircularA.semiBold,
  },
  selectedDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedDayText: {
    color: BLUE,
    fontFamily: fonts.euclidCircularA.semiBold,
  },
  dayLabels: {borderTopWidth: 0, borderBottomWidth: 0},
  weekdayLabel: {
    color: BLUE_SOFT,
    fontSize: 11,
    fontFamily: fonts.euclidCircularA.semiBold,
    letterSpacing: 0.6,
  },
  sheetClip: {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden'},
  sheetDock: {position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'visible'},
  sheetSvg: {position: 'absolute', left: 0, top: 0},
  humpBar: {height: HILL_H, alignItems: 'center', justifyContent: 'flex-start'},
  humpHit: {height: HILL_H, width: 64, paddingTop: 8, alignItems: 'center'},
  sheetBody: {flex: 1, paddingHorizontal: 18, paddingTop: 12},
  sheetTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: INK,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sheetSub: {
    marginTop: 2,
    marginBottom: 10,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
  },
  sheetScroll: {paddingBottom: 8},
  stats: {flexDirection: 'row', gap: 8, marginBottom: 12},
  stat: {flex: 1, borderRadius: 14, paddingVertical: 8, alignItems: 'center'},
  statCount: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: INK,
  },
  statLabel: {
    marginTop: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: INK,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  dayIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  dayLabel: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: INK,
  },
  dayDetail: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  listHeading: {
    marginBottom: 8,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: INK,
  },
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
  },
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  timeCol: {width: 40, alignItems: 'center', marginRight: 8},
  timeText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: INK,
  },
  timeMon: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: MUTED,
    textTransform: 'uppercase',
  },
  rowCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dot: {width: 10, height: 10, borderRadius: 5},
});

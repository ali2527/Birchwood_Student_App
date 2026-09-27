import React, {useCallback, useMemo, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import {asyncGetAllHolidays} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectHolidays} from '../../Stores/slices/user.slice';
import {WIDTH} from '../../theme/units';
import {calendarDayKey} from '../../Utils/calendarDay';

const BLUE = '#035392';
const BLUE_BRIGHT = '#2F5BEA';
const BLUE_SOFT = '#E8F1FA';
const BLUE_MARK = '#C5DCF0';
const BLUE_EVENT = '#DCE8F7';
const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE = '#F2F5FA';

function holidayTitle(holiday) {
  return holiday.title || holiday.name || 'Holiday';
}

function holidayKind(holiday) {
  return String(holiday.type || 'HOLIDAY').toUpperCase() === 'EVENT'
    ? 'Event'
    : 'Holiday';
}

function isEvent(holiday) {
  return holidayKind(holiday) === 'Event';
}

function visibleToParents(holiday) {
  return String(holiday.audience || 'BOTH').toUpperCase() !== 'TEACHER';
}

function rangeOf(holiday) {
  const startKey = calendarDayKey(holiday?.date);
  if (!startKey) {
    return null;
  }
  const endKey = calendarDayKey(holiday?.endDate) || startKey;
  const start = moment(startKey, 'YYYY-MM-DD');
  const end = moment(endKey, 'YYYY-MM-DD');
  if (!start.isValid()) {
    return null;
  }
  return {
    start,
    end: end.isValid() && !end.isBefore(start, 'day') ? end : start.clone(),
  };
}

function rangeLabel(holiday) {
  const range = rangeOf(holiday);
  if (!range) {
    return '';
  }
  if (range.start.isSame(range.end, 'day')) {
    return range.start.format('ddd, D MMM');
  }
  return `${range.start.format('D MMM')} – ${range.end.format('D MMM')}`;
}

function buildDayMap(holidaysByMonth) {
  const map = {};
  Object.values(holidaysByMonth || {}).forEach(monthMap => {
    Object.values(monthMap || {}).forEach(holiday => {
      if (!visibleToParents(holiday)) {
        return;
      }
      const range = rangeOf(holiday);
      if (!range) {
        return;
      }
      const cursor = range.start.clone();
      while (cursor.isSameOrBefore(range.end, 'day')) {
        const key = cursor.format('YYYY-MM-DD');
        if (!map[key]) {
          map[key] = [];
        }
        if (!map[key].some(item => item._id === holiday._id)) {
          map[key].push(holiday);
        }
        cursor.add(1, 'day');
      }
    });
  });
  return map;
}

export default function SchoolCalendar() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const holidaysByMonth = useAppSelector(selectHolidays);
  const [monthCursor, setMonthCursor] = useState(() => moment());
  const [selectedDay, setSelectedDay] = useState(() =>
    moment().format('YYYY-MM-DD'),
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(asyncGetAllHolidays({silent: true}));
    }, [dispatch]),
  );

  const dayMap = useMemo(() => buildDayMap(holidaysByMonth), [holidaysByMonth]);
  const monthKey = monthCursor.format('YYYY-MM');
  const todayKey = moment().format('YYYY-MM-DD');
  const todayIsSelected = selectedDay === todayKey;

  const monthItems = useMemo(() => {
    const monthStart = monthCursor.clone().startOf('month');
    const monthEnd = monthCursor.clone().endOf('month');
    const seen = new Set();
    const items = [];
    Object.values(holidaysByMonth || {}).forEach(monthMap => {
      Object.values(monthMap || {}).forEach(holiday => {
        if (!visibleToParents(holiday) || seen.has(holiday._id)) {
          return;
        }
        const range = rangeOf(holiday);
        if (!range) {
          return;
        }
        if (
          range.end.isBefore(monthStart, 'day') ||
          range.start.isAfter(monthEnd, 'day')
        ) {
          return;
        }
        seen.add(holiday._id);
        items.push(holiday);
      });
    });
    return items.sort(
      (a, b) => rangeOf(a).start.valueOf() - rangeOf(b).start.valueOf(),
    );
  }, [holidaysByMonth, monthCursor]);

  const selectedItems = dayMap[selectedDay] || [];
  const upcoming = useMemo(() => {
    const today = moment().startOf('day');
    const shown = new Set(monthItems.map(item => item._id));
    const seen = new Set();
    const items = [];
    Object.values(holidaysByMonth || {}).forEach(monthMap => {
      Object.values(monthMap || {}).forEach(holiday => {
        if (
          !visibleToParents(holiday) ||
          seen.has(holiday._id) ||
          shown.has(holiday._id)
        ) {
          return;
        }
        const range = rangeOf(holiday);
        if (!range || range.end.isBefore(today, 'day')) {
          return;
        }
        seen.add(holiday._id);
        items.push(holiday);
      });
    });
    return items
      .sort((a, b) => rangeOf(a).start.valueOf() - rangeOf(b).start.valueOf())
      .slice(0, 8);
  }, [holidaysByMonth, monthItems]);

  const customDatesStyles = useCallback(
    date => {
      const key = moment(date).format('YYYY-MM-DD');
      const marked = (dayMap[key] || []).length > 0;
      const isSelected = key === selectedDay;
      const isToday = key === todayKey;
      if (isSelected) {
        return {
          style: styles.selectedDay,
          textStyle: styles.selectedDayText,
        };
      }
      if (marked) {
        const hasEvent = (dayMap[key] || []).some(isEvent);
        return {
          style: [
            styles.markedDay,
            {backgroundColor: hasEvent ? BLUE_EVENT : BLUE_MARK},
          ],
          textStyle: styles.markedDayText,
        };
      }
      if (isToday) {
        return {
          style: styles.todayRing,
          textStyle: styles.todayText,
        };
      }
      return {textStyle: styles.calDayText};
    },
    [dayMap, selectedDay, todayKey],
  );

  const goToday = () => {
    const now = moment();
    setMonthCursor(now.clone());
    setSelectedDay(now.format('YYYY-MM-DD'));
  };

  const openHoliday = holiday => {
    const range = rangeOf(holiday);
    if (!range) {
      return;
    }
    setSelectedDay(range.start.format('YYYY-MM-DD'));
    setMonthCursor(range.start.clone());
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 6}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>School</Text>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>
        <TouchableOpacity
          style={styles.todayChip}
          onPress={goToday}
          activeOpacity={0.85}>
          <Text style={styles.todayChipText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() =>
                setMonthCursor(prev => prev.clone().subtract(1, 'month'))
              }
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={styles.navHit}>
              <Ionicons name="chevron-back" size={18} color={BLUE} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthCursor.format('MMMM YYYY')}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setMonthCursor(prev => prev.clone().add(1, 'month'))
              }
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={styles.navHit}>
              <Ionicons name="chevron-forward" size={18} color={BLUE} />
            </TouchableOpacity>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: BLUE_MARK}]} />
              <Text style={styles.legendText}>Holiday</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: BLUE_EVENT}]} />
              <Text style={styles.legendText}>Event</Text>
            </View>
          </View>

          <CalendarPickerComponent
            key={`${monthKey}-${Object.keys(dayMap).length}`}
            width={WIDTH - 56}
            startFromMonday={false}
            selectedStartDate={moment(selectedDay).toDate()}
            initialDate={monthCursor.toDate()}
            onDateChange={date => {
              if (date) {
                setSelectedDay(moment(date).format('YYYY-MM-DD'));
              }
            }}
            onMonthChange={date => {
              if (date) {
                setMonthCursor(moment(date));
              }
            }}
            customDatesStyles={customDatesStyles}
            todayBackgroundColor="transparent"
            todayTextStyle={
              todayIsSelected ? styles.selectedDayText : styles.todayText
            }
            selectedDayColor={BLUE}
            selectedDayTextColor="#FFFFFF"
            selectedDayStyle={styles.selectedDay}
            textStyle={styles.calDayText}
            dayLabelsWrapper={styles.dayLabels}
            monthTitleStyle={styles.hiddenHeader}
            yearTitleStyle={styles.hiddenHeader}
            previousComponent={<View />}
            nextComponent={<View />}
            headerWrapperStyle={styles.hiddenHeaderWrap}
            monthYearHeaderWrapperStyle={styles.hiddenHeaderWrap}
            customDayHeaderStyles={() => ({textStyle: styles.weekdayLabel})}
          />
        </View>

        <Text style={styles.section}>
          {moment(selectedDay).format('dddd, D MMMM')}
        </Text>
        {selectedItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Nothing on this day</Text>
              <Text style={styles.emptyBody}>
                Holidays and events from school show up here.
              </Text>
            </View>
          </View>
        ) : (
          selectedItems.map(item => (
            <EventCard key={`${item._id}-${selectedDay}`} item={item} />
          ))
        )}

        <Text style={styles.section}>This month</Text>
        {monthItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>No events this month</Text>
              <Text style={styles.emptyBody}>
                {monthCursor.format('MMMM')} has no holidays or events yet.
              </Text>
            </View>
          </View>
        ) : (
          monthItems.map(item => (
            <EventCard
              key={item._id}
              item={item}
              onPress={() => openHoliday(item)}
            />
          ))
        )}

        {upcoming.length > 0 ? (
          <>
            <Text style={styles.section}>Coming up</Text>
            {upcoming.map(item => (
              <EventCard
                key={item._id}
                item={item}
                onPress={() => openHoliday(item)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function EventCard({item, onPress}) {
  const day = rangeOf(item)?.start || moment(item.date);
  const event = isEvent(item);
  const body = (
    <View style={styles.eventRow}>
      <View
        style={[
          styles.dateBox,
          {backgroundColor: event ? BLUE_EVENT : BLUE_MARK},
        ]}>
        <Text style={styles.dateDay}>{day.format('D')}</Text>
        <Text style={styles.dateMonth}>{day.format('MMM')}</Text>
      </View>
      <View style={styles.eventCopy}>
        <View style={styles.kindPill}>
          <Text style={styles.eventKind}>{holidayKind(item)}</Text>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {holidayTitle(item)}
        </Text>
        <Text style={styles.eventWhen}>{rangeLabel(item)}</Text>
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={MUTED} />
      ) : null}
    </View>
  );
  if (!onPress) {
    return <View style={styles.eventCard}>{body}</View>;
  }
  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={onPress}
      activeOpacity={0.85}>
      {body}
    </TouchableOpacity>
  );
}

const DAY_SIZE = 34;

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: PAGE},
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
    paddingRight: 18,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {flex: 1, minWidth: 0, paddingTop: 2},
  eyebrow: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: BLUE,
  },
  headerTitle: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    letterSpacing: -0.3,
    color: NAVY,
  },
  todayChip: {
    marginTop: 8,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayChipText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  scroll: {paddingHorizontal: 16, paddingBottom: 32},
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingTop: 6,
    paddingBottom: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2EAF3',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  navHit: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE_SOFT,
  },
  monthTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
    letterSpacing: -0.2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: MUTED,
  },
  hiddenHeader: {height: 1, opacity: 0, fontSize: 1, color: 'transparent'},
  hiddenHeaderWrap: {height: 0, opacity: 0, overflow: 'hidden'},
  calDayText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: NAVY,
  },
  weekdayLabel: {
    color: BLUE,
    fontSize: 10,
    fontFamily: fonts.euclidCircularA.semiBold,
    letterSpacing: 0.5,
  },
  dayLabels: {borderTopWidth: 0, borderBottomWidth: 0},
  selectedDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    backgroundColor: BLUE,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
  },
  markedDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markedDayText: {
    color: BLUE,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
  },
  todayRing: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    borderWidth: 1.5,
    borderColor: BLUE_BRIGHT,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayText: {
    color: BLUE_BRIGHT,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
  },
  section: {
    marginTop: 14,
    marginBottom: 8,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    letterSpacing: -0.2,
    color: NAVY,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateBox: {
    width: 44,
    borderRadius: 12,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  dateDay: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    letterSpacing: -0.3,
    color: BLUE,
  },
  dateMonth: {
    marginTop: -1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    color: BLUE,
  },
  eventCopy: {flex: 1, minWidth: 0},
  kindPill: {
    alignSelf: 'flex-start',
    backgroundColor: BLUE_SOFT,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  eventKind: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: BLUE,
  },
  eventTitle: {
    marginTop: 3,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
    color: NAVY,
  },
  eventWhen: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
  },
  emptyCopy: {flex: 1, minWidth: 0},
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: NAVY,
  },
  emptyBody: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    lineHeight: 16,
    color: MUTED,
  },
});

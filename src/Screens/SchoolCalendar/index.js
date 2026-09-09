import React, {useEffect, useMemo} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import {asyncGetAllHolidays} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectHolidays} from '../../Stores/slices/user.slice';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';

function holidayTitle(holiday) {
  return holiday.title || holiday.name || 'Holiday';
}

function holidayKind(holiday) {
  const type = String(holiday.type || '').toLowerCase();
  if (type.includes('event')) {
    return 'School event';
  }
  if (holiday.type) {
    return holiday.type;
  }
  return 'Holiday';
}

function dateLabel(holiday) {
  const start = moment(holiday.date);
  if (!start.isValid()) {
    return '';
  }
  const end = holiday.endDate ? moment(holiday.endDate) : null;
  if (end && end.isValid() && !end.isSame(start, 'day')) {
    return `${start.format('D MMM')} – ${end.format('D MMM YYYY')}`;
  }
  return start.format('ddd, D MMM YYYY');
}

export default function SchoolCalendar() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const holidaysByMonth = useAppSelector(selectHolidays);

  useEffect(() => {
    dispatch(asyncGetAllHolidays());
  }, [dispatch]);

  const groups = useMemo(() => {
    const current = moment().format('YYYY-MM');
    const entries = Object.entries(holidaysByMonth || {}).map(
      ([month, map]) => ({
        month,
        items: Object.values(map || {}).sort(
          (a, b) => moment(a.date).valueOf() - moment(b.date).valueOf(),
        ),
      }),
    );

    const currentGroup = entries.filter(g => g.month === current);
    const future = entries
      .filter(g => g.month > current)
      .sort((a, b) => a.month.localeCompare(b.month));
    const past = entries
      .filter(g => g.month < current)
      .sort((a, b) => b.month.localeCompare(a.month));

    const ordered = [...currentGroup, ...future, ...past].filter(
      g => g.items.length > 0,
    );

    if (currentGroup.length === 0) {
      ordered.unshift({month: current, items: []});
    }
    return ordered;
  }, [holidaysByMonth]);

  const hasAny = groups.some(g => g.items.length > 0);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 12) + 10,
            paddingBottom: 100 + insets.bottom,
            paddingHorizontal: 18,
            flexGrow: 1,
          }}>
          <Text style={styles.title}>School calendar</Text>
          <Text style={styles.subtitle}>Holidays and school events</Text>

          {!hasAny ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No holidays or events yet</Text>
            </View>
          ) : (
            groups.map(group => (
              <View key={group.month} style={styles.monthBlock}>
                <Text style={styles.month}>
                  {moment(group.month, 'YYYY-MM').format('MMMM YYYY')}
                </Text>
                {group.items.length === 0 ? (
                  <Text style={styles.emptyMonth}>No holidays this month</Text>
                ) : (
                  group.items.map(item => (
                    <View key={item._id} style={styles.card}>
                      <View style={styles.kindPill}>
                        <Text style={styles.kindText}>{holidayKind(item)}</Text>
                      </View>
                      <Text style={styles.eventTitle}>{holidayTitle(item)}</Text>
                      <Text style={styles.eventDate}>{dateLabel(item)}</Text>
                    </View>
                  ))
                )}
              </View>
            ))
          )}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 24,
    color: NAVY,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  monthBlock: {
    marginBottom: 18,
  },
  month: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
    marginBottom: 8,
  },
  emptyMonth: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  kindPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF3FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  kindText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: '#035392',
  },
  eventTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  eventDate: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: MUTED,
  },
});

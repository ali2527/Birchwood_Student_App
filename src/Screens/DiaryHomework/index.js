import React, {useCallback, useMemo, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import ChildSwitcher from '../../Components/ChildSwitcher';
import routes from '../../Navigation/routes';
import {asyncGetAllChildHomeWorks} from '../../Stores/actions/diary.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectChildren, selectSelectedChild, setSelectedChild} from '../../Stores/slices/class.slice';
import {selectHomeWorks} from '../../Stores/slices/diary.slice';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';

const LOGO = [
  {bg: '#E4D4F2'},
  {bg: '#F8D5E8'},
  {bg: '#D3E6F6'},
  {bg: '#D7F0DC'},
  {bg: '#FBF3D0'},
  {bg: '#FBE4D0'},
  {bg: '#F8D8D8'},
];

const FILTERS = [
  {key: 'ALL', label: 'All', bg: '#D3E6F6'},
  {key: 'UPCOMING', label: 'Upcoming', bg: '#D7F0DC'},
  {key: 'OVERDUE', label: 'Overdue', bg: '#F8D8D8'},
  {key: 'WEEK', label: 'This week', bg: '#FBF3D0'},
];

function logoFor(title) {
  const text = String(title || 'Homework');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return LOGO[hash % LOGO.length];
}

function dueMoment(value) {
  const date = moment(value);
  return date.isValid() ? date : null;
}

function isPastDue(item) {
  const due = dueMoment(item.dueDate);
  return !!due && due.isBefore(moment().startOf('day'));
}

/** Monday through Sunday of the current week, plus tomorrow when that falls on the next Monday. */
function isDueThisWeek(due) {
  if (!due) {
    return false;
  }
  const day = due.clone().startOf('day');
  const today = moment().startOf('day');
  const weekStart = today.clone().startOf('isoWeek');
  const weekEnd = today.clone().endOf('isoWeek').startOf('day');
  const tomorrow = today.clone().add(1, 'day');
  return day.isBetween(weekStart, weekEnd, 'day', '[]') || day.isSame(tomorrow, 'day');
}

function dueLabel(item) {
  const due = dueMoment(item.dueDate);
  if (!due) {
    return 'No due date';
  }
  const today = moment().startOf('day');
  if (due.isBefore(today)) {
    return `Overdue · ${due.format('ddd, D MMM')}`;
  }
  if (due.isSame(today, 'day')) {
    return 'Due today';
  }
  if (due.isSame(today.clone().add(1, 'day'), 'day')) {
    return 'Due tomorrow';
  }
  return `Due ${due.format('dddd, D MMM')}`;
}

function teacherOf(item) {
  if (item.teacherName) {
    return item.teacherName;
  }
  const teacher = item.teacherDoc;
  if (!teacher) {
    return '';
  }
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
}

export default function DiaryHomework() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const homeworks = useAppSelector(selectHomeWorks);
  const childId = selectedChild?._id;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  useFocusEffect(
    useCallback(() => {
      if (childId) {
        dispatch(asyncGetAllChildHomeWorks({childId, silent: true}));
      }
    }, [childId, dispatch]),
  );

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (homeworks || [])
      .filter(item => item.type !== 'NOTICE')
      .filter(item => {
        if (needle) {
          const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
          if (!text.includes(needle)) {
            return false;
          }
        }
        const due = dueMoment(item.dueDate);
        if (filter === 'UPCOMING') {
          return !isPastDue(item);
        }
        if (filter === 'OVERDUE') {
          return isPastDue(item);
        }
        if (filter === 'WEEK') {
          return isDueThisWeek(due);
        }
        return true;
      })
      .sort((a, b) => {
        const aPast = isPastDue(a);
        const bPast = isPastDue(b);
        if (aPast !== bPast) {
          return aPast ? 1 : -1;
        }
        return moment(a.dueDate).valueOf() - moment(b.dueDate).valueOf();
      });
  }, [filter, homeworks, query]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 6}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Assignments</Text>
          <Text style={styles.headerTitle}>Homework</Text>
        </View>
        <View style={styles.switcher}>
          <ChildSwitcher
            childList={children}
            selected={selectedChild}
            onSelect={next => dispatch(setSelectedChild(next))}
            onAdd={() => navigation.navigate(routes.screens.addChild)}
          />
        </View>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={16} color={MUTED} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search assignments"
          placeholderTextColor={MUTED}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        style={styles.filterBar}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {FILTERS.map(item => {
          const on = filter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, on && {backgroundColor: item.bg}]}
              onPress={() => setFilter(item.key)}
              activeOpacity={0.85}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}>
        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={22} color={NAVY} />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>
                {query.trim() || filter !== 'ALL' ? 'Nothing here' : 'No homework yet'}
              </Text>
              <Text style={styles.emptyBody}>
                {query.trim()
                  ? 'No assignments match that search.'
                  : filter === 'OVERDUE'
                    ? 'Nothing is past its due date.'
                    : filter === 'UPCOMING'
                      ? 'There is no upcoming homework.'
                      : filter === 'WEEK'
                        ? 'Nothing is due this week.'
                        : 'Assignments from school will show up here.'}
              </Text>
            </View>
          </View>
        ) : (
          items.map(item => {
            const due = dueMoment(item.dueDate);
            const logo = logoFor(item.title);
            const teacher = teacherOf(item);
            return (
              <View key={item._id} style={styles.card}>
                <View style={styles.cardRow}>
                <View style={[styles.dateBox, {backgroundColor: logo.bg}]}>
                  <Text style={styles.dateDay}>{due ? due.format('D') : '—'}</Text>
                  <Text style={styles.dateMonth}>{due ? due.format('MMM') : ''}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.kicker}>
                    {item.type === 'WARNING' ? 'Warning' : 'Homework'}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.due}>{dueLabel(item)}</Text>
                  {teacher ? (
                    <Text style={styles.meta} numberOfLines={1}>
                      {teacher}
                      {item.classroomName ? ` · ${item.classroomName}` : ''}
                    </Text>
                  ) : null}
                  {item.description ? (
                    <Text style={styles.body} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                </View>
              </View>
            );
          })
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
    paddingRight: 18,
    paddingBottom: 12,
  },
  switcher: {
    marginLeft: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 2,
  },
  eyebrow: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: MUTED,
  },
  headerTitle: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: NAVY,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECEEF2',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: NAVY,
    paddingVertical: 0,
  },
  filterBar: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filters: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: NAVY,
  },
  chipTextOn: {
    color: NAVY,
  },
  list: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  dateBox: {
    width: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 8,
  },
  dateDay: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    letterSpacing: -0.4,
    color: NAVY,
  },
  dateMonth: {
    marginTop: -2,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    color: NAVY,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: MUTED,
  },
  cardTitle: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: NAVY,
  },
  due: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 13,
    color: NAVY,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  body: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#3E4658',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D3E6F6',
  },
  emptyCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: NAVY,
  },
  emptyBody: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
});

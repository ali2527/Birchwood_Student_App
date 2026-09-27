import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch} from 'react-redux';
import ChildSwitcher from '../../Components/ChildSwitcher';
import routes from '../../Navigation/routes';
import {asyncGetAllClassTimeTable} from '../../Stores/actions/timeTable.action';
import {asyncGetAllMyChildren} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectChildren, selectSelectedChild, setSelectedChild} from '../../Stores/slices/class.slice';
import {selectTimeTableByDay} from '../../Stores/slices/timeTable.slice';
import {styles} from './style';

const DAYS = [
  {key: 'MON', label: 'Mon'},
  {key: 'TUE', label: 'Tue'},
  {key: 'WED', label: 'Wed'},
  {key: 'THU', label: 'Thu'},
  {key: 'FRI', label: 'Fri'},
];

const DAY_FROM_LABEL = {
  Mon: 'MON',
  Tue: 'TUE',
  Wed: 'WED',
  Thu: 'THU',
  Fri: 'FRI',
};

function schoolWeekday() {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    weekday: 'short',
  }).format(new Date());
  return DAY_FROM_LABEL[label] || 'MON';
}

function schoolMinutes() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const hour = Number(parts.find(part => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find(part => part.type === 'minute')?.value || 0);
  return hour * 60 + minute;
}

function clockMinutes(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatClock(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return value || '';
  }
  const hour24 = Number(match[1]);
  const minute = match[2];
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

function schoolTodayDate() {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function ymd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function slotsForDate(records, dateKey) {
  const list = records || [];
  const dated = list.filter(item => item.onDate === dateKey);
  if (dated.length) {
    return dated;
  }
  return list.filter(item => !item.onDate);
}

function weekOf(todayDate) {
  const monday = new Date(todayDate);
  const weekday = monday.getDay();
  const shift = weekday === 0 ? -6 : 1 - weekday;
  monday.setDate(monday.getDate() + shift);
  return DAYS.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {...day, date, dateNum: String(date.getDate())};
  });
}

function classroomIdOf(child) {
  const classroom = child?.classroom;
  if (!classroom) {
    return '';
  }
  if (typeof classroom === 'string') {
    return classroom;
  }
  return classroom._id || classroom.id || '';
}

function classLabel(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  return classroom.classroomName || classroom.classroomId || '';
}

function teacherName(classroom) {
  const teacher = classroom?.teacher;
  if (!teacher || typeof teacher === 'string') {
    return '';
  }
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
}

const LOGO_COLORS = ['#E4D4F2', '#F8D5E8', '#D3E6F6', '#D7F0DC', '#FBF3D0', '#FBE4D0', '#F8D8D8'];

const SPECIALS = {
  RECESS: {label: 'Recess', icon: 'sunny-outline'},
  LUNCH: {label: 'Lunch', icon: 'restaurant-outline'},
  BREAK: {label: 'Break', icon: 'cafe-outline'},
};

function specialOf(item) {
  const meta = String(item?.meta || '').trim().toUpperCase();
  if (SPECIALS[meta]) {
    return SPECIALS[meta];
  }
  const text = `${item?.subject || ''} ${item?.meta || ''}`.toLowerCase();
  if (/\brecess\b/.test(text)) {
    return SPECIALS.RECESS;
  }
  if (/\blunch\b/.test(text)) {
    return SPECIALS.LUNCH;
  }
  if (/\bbreak\b/.test(text)) {
    return SPECIALS.BREAK;
  }
  return null;
}

function colorForSubject(subject) {
  const text = String(subject || 'Period').trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

export default function TimeTable() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const today = schoolWeekday();
  const todayDate = useMemo(() => schoolTodayDate(), []);
  const week = useMemo(() => weekOf(todayDate), [todayDate]);
  const [selectedDay, setSelectedDay] = useState(today);
  const [loading, setLoading] = useState(false);
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const dayRecords = useAppSelector(selectTimeTableByDay(selectedDay));
  const classroomId = classroomIdOf(selectedChild);
  const klass = classLabel(selectedChild?.classroom);
  const teacher = teacherName(selectedChild?.classroom);
  const selected = week.find(day => day.key === selectedDay) || week[0];
  const periods = useMemo(
    () => slotsForDate(dayRecords, ymd(selected.date)),
    [dayRecords, selected.date],
  );
  const heading =
    selected?.date?.toDateString() === todayDate.toDateString()
      ? 'Today'
      : selected.date.toLocaleDateString('en-GB', {weekday: 'long'});
  const dateLabel = selected.date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    if (!selectedChild?._id) {
      dispatch(asyncGetAllMyChildren());
    }
  }, [dispatch, selectedChild?._id]);

  useEffect(() => {
    if (!classroomId) {
      return undefined;
    }
    let active = true;
    setLoading(true);
    dispatch(asyncGetAllClassTimeTable({silent: true})).finally(() => {
      if (active) {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [classroomId, dispatch]);

  const nowMinutes = schoolMinutes();
  const dayLabel = selected?.label || selectedDay;

  const rows = useMemo(
    () =>
      (periods || []).map(item => {
        const start = clockMinutes(item.startTime);
        const end = clockMinutes(item.endTime);
        const isNow =
          selectedDay === today &&
          start != null &&
          end != null &&
          nowMinutes >= start &&
          nowMinutes < end;
        const note = String(item.description || '').trim();
        const description =
          note && note !== klass && note !== `Class ${klass}` ? note : '';
        const special = specialOf(item);
        return {...item, isNow, special, description, color: colorForSubject(item.subject)};
      }),
    [klass, nowMinutes, periods, selectedDay, today],
  );

  const timeline = useMemo(() => {
    const items = [];
    rows.forEach((item, index) => {
      items.push({kind: item.special ? 'special' : 'period', ...item});
      const next = rows[index + 1];
      const end = clockMinutes(item.endTime);
      const start = next ? clockMinutes(next.startTime) : null;
      if (end != null && start != null && start - end >= 10) {
        items.push({
          kind: 'gap',
          id: `gap-${item._id || index}`,
          minutes: start - end,
        });
      }
    });
    return items;
  }, [rows]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F8" />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 6}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color="#0F1F4B" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.headerTitle}>{heading}</Text>
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

      <View style={styles.days}>
        {week.map(day => {
          const on = selectedDay === day.key;
          return (
            <TouchableOpacity
              key={day.key}
              style={styles.dayBtn}
              onPress={() => setSelectedDay(day.key)}
              activeOpacity={0.85}>
              <Text style={styles.dayText}>{day.label}</Text>
              <View style={[styles.dateCircle, on && styles.dateCircleOn]}>
                <Text style={[styles.dateNum, on && styles.dateNumOn]}>{day.dateNum}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#035392" />
          </View>
        ) : !classroomId ? (
          <View style={styles.emptyCard}>
            <View style={[styles.emptyIcon, {backgroundColor: '#E4D4F2'}]}>
              <Ionicons name="school-outline" size={22} color="#0F1F4B" />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>No class yet</Text>
              <Text style={styles.emptyBody}>
                This child’s timetable appears after a class is assigned.
              </Text>
            </View>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={22} color="#0F1F4B" />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Nothing on {dayLabel}</Text>
              <Text style={styles.emptyBody}>This day has no periods yet.</Text>
            </View>
          </View>
        ) : (
          timeline.map((item, index) =>
            item.kind === 'gap' ? (
              <View key={item.id} style={styles.breakRow}>
                <View style={styles.timeCol} />
                <View style={styles.track}>
                  <View style={styles.line} />
                </View>
                <View style={styles.breakPill}>
                  <Ionicons name="ellipsis-horizontal" size={14} color="#8B93A7" />
                  <Text style={styles.breakText}>Free · {item.minutes} min</Text>
                </View>
              </View>
            ) : item.kind === 'special' ? (
              <View key={item._id || `${item.startTime}-${index}`} style={styles.periodRow}>
                <View style={styles.timeCol}>
                  <Text style={[styles.startTime, item.isNow && styles.startTimeNow]}>
                    {formatClock(item.startTime)}
                  </Text>
                  <Text style={styles.endTime}>{formatClock(item.endTime)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.dot, item.isNow && styles.dotNow]} />
                  <View style={styles.line} />
                </View>
                <View style={styles.specialCard}>
                  <View style={styles.specialTitleRow}>
                    <Ionicons name={item.special.icon} size={16} color="#035392" />
                    <Text style={styles.specialTitle}>{item.special.label}</Text>
                  </View>
                  {item.description ? (
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <View key={item._id || `${item.startTime}-${index}`} style={styles.periodRow}>
                <View style={styles.timeCol}>
                  <Text style={[styles.startTime, item.isNow && styles.startTimeNow]}>
                    {formatClock(item.startTime)}
                  </Text>
                  <Text style={styles.endTime}>{formatClock(item.endTime)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.dot, item.isNow && styles.dotNow]} />
                  <View style={styles.line} />
                </View>
                <View style={[styles.card, {backgroundColor: item.color}]}>
                  <Text style={styles.subject} numberOfLines={2}>
                    {item.subject || 'Period'}
                  </Text>
                  {item.description ? (
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  {teacher || klass ? (
                    <View style={styles.personRow}>
                      <Ionicons name="person" size={12} color="#5C6578" />
                      <Text style={styles.person} numberOfLines={1}>
                        {teacher || klass}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ),
          )
        )}
      </ScrollView>
    </View>
  );
}

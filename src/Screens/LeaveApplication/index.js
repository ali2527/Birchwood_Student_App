import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import ChildSwitcher from '../../Components/ChildSwitcher';
import routes from '../../Navigation/routes';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import {
  asyncGetAllChildAttendance,
  asyncUserLeave,
} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectChildren, selectSelectedChild, setSelectedChild} from '../../Stores/slices/class.slice';
import {selectUserAttendance} from '../../Stores/slices/user.slice';
import {styles} from './style';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const BLUE = '#035392';

const REASONS = ['Sick', 'Family', 'Appointment', 'Travel', 'Religious', 'Others'];

const CALENDAR_WIDTH = Dimensions.get('window').width - 60;

function reasonParts(value) {
  const text = String(value || '').trim();
  if (!text) {
    return {kind: 'Leave', note: ''};
  }
  const [kind, ...rest] = text.split('·').map(part => part.trim());
  return {kind: kind || 'Leave', note: rest.filter(Boolean).join(' · ')};
}

function rangeLabel(start, end) {
  if (!start) {
    return 'Choose the days';
  }
  const from = moment(start);
  const to = end ? moment(end) : from;
  if (!from.isValid()) {
    return 'Choose the days';
  }
  if (!to.isValid() || from.isSame(to, 'day')) {
    return from.format('dddd, D MMM');
  }
  if (from.isSame(to, 'month')) {
    return `${from.format('D')} – ${to.format('D MMM')}`;
  }
  return `${from.format('D MMM')} – ${to.format('D MMM')}`;
}

function groupLeaves(records) {
  const days = (records || [])
    .filter(item => item.status === 'LEAVE')
    .map(item => ({
      ...item,
      day: moment(item.checkIn || item.createdAt),
    }))
    .filter(item => item.day.isValid())
    .sort((a, b) => b.day.valueOf() - a.day.valueOf());

  const groups = [];
  days.forEach(item => {
    const last = groups[groups.length - 1];
    const touches =
      last &&
      last.reason === (item.leaveReason || '') &&
      last.from.clone().subtract(1, 'day').isSame(item.day, 'day');
    if (touches) {
      last.from = item.day.clone();
      return;
    }
    groups.push({
      id: item._id,
      reason: item.leaveReason || '',
      from: item.day.clone(),
      to: item.day.clone(),
    });
  });
  return groups;
}

export default function LeaveApplication() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const attendance = useAppSelector(selectUserAttendance);
  const childId = selectedChild?._id;
  const [tab, setTab] = useState('request');
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!childId) {
        return undefined;
      }
      let active = true;
      setLoading(true);
      dispatch(asyncGetAllChildAttendance({childId, silent: true})).finally(() => {
        if (active) {
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }, [childId, dispatch]),
  );

  const childName = [selectedChild?.firstName, selectedChild?.lastName].filter(Boolean).join(' ');
  const leaves = useMemo(() => groupLeaves(attendance?.attendance), [attendance]);
  const daysAway = useMemo(() => {
    if (!startDate) {
      return 0;
    }
    const from = moment(startDate).startOf('day');
    const to = endDate ? moment(endDate).startOf('day') : from;
    if (!from.isValid() || !to.isValid()) {
      return 0;
    }
    return Math.abs(to.diff(from, 'days')) + 1;
  }, [endDate, startDate]);

  const onDateChange = (date, type) => {
    if (type === 'END_DATE') {
      setEndDate(date ?? null);
      return;
    }
    if (date != null) {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const submitLeave = () => {
    if (!childId) {
      Alert.alert('Leave', 'Select a child first.');
      return;
    }
    if (!startDate) {
      Alert.alert('Leave', 'Choose the days on the calendar.');
      return;
    }
    const startM = moment(startDate);
    const endM = endDate ? moment(endDate) : startM;
    if (!startM.isValid() || !endM.isValid()) {
      Alert.alert('Leave', 'Choose a valid date range.');
      return;
    }

    dispatch(
      asyncUserLeave({
        children: childId,
        leaveType: reason,
        reason: note,
        startDate: startM.format('YYYY-MM-DD'),
        endDate: endM.format('YYYY-MM-DD'),
      }),
    ).then(res => {
      if (res?.payload?.status) {
        setNote('');
        setStartDate(null);
        setEndDate(null);
        setReason(REASONS[0]);
        setTab('past');
        dispatch(asyncGetAllChildAttendance({childId, silent: true}));
      }
    });
  };

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
          <Text style={styles.eyebrow}>{childName || 'Attendance'}</Text>
          <Text style={styles.headerTitle}>Leaves</Text>
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

      <View style={styles.tabs}>
        {[
          {key: 'request', label: 'Request'},
          {key: 'past', label: 'Past leaves'},
        ].map(item => {
          const on = tab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.tab, on && styles.tabOn]}
              onPress={() => setTab(item.key)}
              activeOpacity={0.85}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}>
          {tab === 'request' ? (
            <>
              <LinearGradient
                colors={['#0E4F9C', '#1B6FCB']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.hero}>
                <Text style={styles.heroKicker}>Away from school</Text>
                <Text style={styles.heroTitle}>{rangeLabel(startDate, endDate)}</Text>
                <Text style={styles.heroMeta}>
                  {daysAway ? `${daysAway} day${daysAway === 1 ? '' : 's'} · ${reason}` : reason}
                </Text>
              </LinearGradient>

              <View style={styles.card}>
                <Text style={styles.kicker}>Days</Text>
                <CalendarPickerComponent
                  allowRangeSelection
                  width={CALENDAR_WIDTH}
                  minDate={new Date()}
                  onDateChange={onDateChange}
                  selectedStartDate={startDate || undefined}
                  selectedEndDate={endDate || undefined}
                  selectedDayColor={BLUE}
                  selectedDayTextColor="#FFFFFF"
                  selectedRangeStyle={styles.rangeDay}
                  todayBackgroundColor="transparent"
                  todayTextStyle={styles.todayText}
                  textStyle={styles.dayText}
                  monthTitleStyle={styles.monthTitle}
                  yearTitleStyle={styles.monthTitle}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.kicker}>Reason</Text>
                <View style={styles.chips}>
                  {REASONS.map(label => {
                    const on = reason === label;
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.chip, on && styles.chipOn]}
                        onPress={() => setReason(label)}
                        activeOpacity={0.85}>
                        <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note for school"
                  placeholderTextColor={MUTED}
                  multiline
                  style={styles.note}
                />
              </View>

              <TouchableOpacity style={styles.submit} onPress={submitLeave} activeOpacity={0.88}>
                <Text style={styles.submitText}>Submit leave</Text>
              </TouchableOpacity>
            </>
          ) : loading && leaves.length === 0 ? (
            <ActivityIndicator color={BLUE} style={styles.loader} />
          ) : leaves.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>No leave yet</Text>
                <Text style={styles.emptyBody}>
                  Days marked away from school will show up here.
                </Text>
              </View>
            </View>
          ) : (
            leaves.map(item => {
              const parts = reasonParts(item.reason);
              const span = item.from.isSame(item.to, 'day')
                ? item.from.format('dddd, D MMM')
                : `${item.from.format('D MMM')} – ${item.to.format('D MMM')}`;
              return (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateDay}>{item.from.format('D')}</Text>
                      <Text style={styles.dateMonth}>{item.from.format('MMM')}</Text>
                    </View>
                    <View style={styles.historyBody}>
                      <Text style={styles.historyKicker}>On leave</Text>
                      <Text style={styles.historyTitle}>{parts.kind}</Text>
                      <Text style={styles.historyWhen}>{span}</Text>
                      {parts.note ? (
                        <Text style={styles.historyNote} numberOfLines={2}>
                          {parts.note}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

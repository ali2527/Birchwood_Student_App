import {
  Text,
  View,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../../Stores/hooks';
import { selectUserAttendance } from '../../Stores/slices/user.slice';
import { selectSelectedChild } from '../../Stores/slices/class.slice';
import { asyncGetAllChildAttendance, asyncGetAllHolidays } from '../../Stores/actions/user.action';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import GradientComponent from '../../Components/Gradient';
import ToggleButton from '../../Components/ToggleButton';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import moment from 'moment';
import { colors } from '../../theme/colors';
import BottomLogo from '../../Components/BottomLogo';
import { vh } from '../../theme/units';
import { styles } from './style';

const attendanceDayKey = item =>
  moment(item.checkIn || item.createdAt).format('YYYY-MM-DD');

const AttendanceLog = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const attendance = useAppSelector(selectUserAttendance);
  const selectedChild = useAppSelector(selectSelectedChild);
  const childId = selectedChild?._id;

  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());

  const [btn, setBtn] = useState({
    left: 'Attendance',
    right: 'Holiday',
    selected: 'Attendance',
  });

  const allHolidays = useAppSelector(state => state.user.holidays);
  const monthStr = useMemo(
    () => `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
    [currentYear, currentMonth]
  );
  const holidays = useMemo(
    () => Object.values(allHolidays?.[monthStr] || {}),
    [allHolidays, monthStr]
  );

  const allRecords = attendance?.attendance || [];

  const monthRecords = useMemo(() => {
    return allRecords.filter(item => {
      const d = moment(item.checkIn || item.createdAt);
      return d.month() + 1 === currentMonth && d.year() === currentYear;
    });
  }, [allRecords, currentMonth, currentYear]);

  const monthlyStats = useMemo(() => {
    const stats = { PRESENT: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: holidays.length };
    monthRecords.forEach(r => {
      const s = (r.status || '').toUpperCase();
      if (s === 'PRESENT') stats.PRESENT += 1;
      else if (s === 'ABSENT') stats.ABSENT += 1;
      else if (s === 'LEAVE') stats.LEAVE += 1;
    });
    return stats;
  }, [monthRecords, holidays.length]);

  useEffect(() => {
    dispatch(asyncGetAllHolidays());
  }, [dispatch]);

  useEffect(() => {
    if (childId) {
      dispatch(asyncGetAllChildAttendance(childId));
    }
  }, [dispatch, childId]);

  const handlePress = (value, title) => {
    setBtn({
      ...btn,
      selected: title,
    });
  };

  const customDatesStylesCallback = useCallback(
    date => {
      const formattedDate = moment(date).format('YYYY-MM-DD');

      const dayAttendance = allRecords.find(
        item => attendanceDayKey(item) === formattedDate
      );

      if (dayAttendance) {
        const st = (dayAttendance.status || '').toUpperCase();
        let bgColor = 'transparent';
        if (st === 'PRESENT') bgColor = '#4CAF50';
        else if (st === 'ABSENT') bgColor = '#F44336';
        else if (st === 'LEAVE') bgColor = '#FFB300';

        return {
          style: { backgroundColor: bgColor },
          textStyle: { color: colors.theme.white, fontWeight: 'bold' },
        };
      }

      const isHoliday = holidays.find(
        h => moment(h.date).format('YYYY-MM-DD') === formattedDate
      );
      if (isHoliday) {
        return {
          style: { backgroundColor: '#E8F5E9' },
          textStyle: { color: '#2E7D32', fontWeight: 'bold' },
        };
      }

      const weekendDate = moment(date).isoWeekday();
      if (weekendDate === 7 || weekendDate === 6) {
        return {
          style: { backgroundColor: '#F5F5F5' },
        };
      }
    },
    [allRecords, holidays]
  );

  const handleDate = date => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const dayAttendance = allRecords.find(
      item => attendanceDayKey(item) === formattedDate
    );

    if (dayAttendance) {
      setSelectedDateDetails({
        ...dayAttendance,
        date: formattedDate,
      });
    } else {
      const isHoliday = holidays.find(
        h => moment(h.date).format('YYYY-MM-DD') === formattedDate
      );
      if (isHoliday) {
        setSelectedDateDetails({
          status: 'HOLIDAY',
          title: isHoliday.name,
          date: formattedDate,
        });
      } else {
        setSelectedDateDetails({ status: 'No Record', date: formattedDate });
      }
    }
  };

  const handleMonthChange = date => {
    setCurrentMonth(moment(date).month() + 1);
    setCurrentYear(moment(date).year());
    setSelectedDateDetails(null);
  };

  const renderAttendanceStats = () => {
    if (btn.selected !== 'Attendance') return null;

    const stats = monthlyStats;
    const statsData = [
      { id: 1, title: 'Present', count: stats.PRESENT, color: '#4CAF50' },
      { id: 2, title: 'Absent', count: stats.ABSENT, color: '#F44336' },
      { id: 3, title: 'Leave', count: stats.LEAVE, color: '#FFB300' },
      { id: 4, title: 'Holiday', count: stats.HOLIDAY, color: '#2196F3' },
    ];

    return (
      <View style={styles.statsContainer}>
        {statsData.map(item => (
          <View
            key={item.id}
            style={[styles.statBox, { borderColor: item.color + '40' }]}>
            <View
              style={[styles.statIndicator, { backgroundColor: item.color }]}
            />
            <View style={styles.statTextContainer}>
              <Text style={styles.statTitle}>{item.title}</Text>
              <Text style={[styles.statCount, { color: item.color }]}>
                {item.count}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSelectedDateInfo = () => {
    if (!selectedDateDetails) return null;

    const displayDate = moment(
      selectedDateDetails.date ||
        selectedDateDetails.checkIn ||
        selectedDateDetails.createdAt
    );

    return (
      <View style={styles.detailsCard}>
        <GlroyBold
          text={displayDate.format('MMMM Do, YYYY')}
          _style={styles.detailsDate}
        />
        <View style={styles.detailRow}>
          <GrayMediumText text="Status: " />
          <Text
            style={[
              styles.detailValue,
              {
                color:
                  selectedDateDetails.status === 'PRESENT'
                    ? '#4CAF50'
                    : selectedDateDetails.status === 'ABSENT'
                      ? '#F44336'
                      : selectedDateDetails.status === 'LEAVE'
                        ? '#FFB300'
                        : selectedDateDetails.status === 'HOLIDAY'
                          ? '#2196F3'
                          : colors.text.grey,
              },
            ]}>
            {selectedDateDetails.status}
          </Text>
        </View>

        {selectedDateDetails.markedBy ? (
          <View style={styles.detailRow}>
            <GrayMediumText text="Marked by: " />
            <Text style={styles.detailValue}>{selectedDateDetails.markedBy}</Text>
          </View>
        ) : null}

        {selectedDateDetails.title && (
          <View style={styles.detailRow}>
            <GrayMediumText text="Event: " />
            <Text style={styles.detailValue}>{selectedDateDetails.title}</Text>
          </View>
        )}

        {selectedDateDetails.checkIn && (
          <View style={styles.detailRow}>
            <GrayMediumText text="Check-in: " />
            <Text style={styles.detailValue}>
              {moment(selectedDateDetails.checkIn).format('hh:mm A')}
            </Text>
          </View>
        )}
        {selectedDateDetails.checkOut && (
          <View style={styles.detailRow}>
            <GrayMediumText text="Check-out: " />
            <Text style={styles.detailValue}>
              {moment(selectedDateDetails.checkOut).format('hh:mm A')}
            </Text>
          </View>
        )}
        {selectedDateDetails.leaveReason ? (
          <View style={styles.detailRow}>
            <GrayMediumText text="Notes: " />
            <Text style={styles.detailValue}>
              {selectedDateDetails.leaveReason}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderHolidayList = () => {
    if (btn.selected !== 'Holiday') return null;

    return (
      <View style={styles.statsContainer}>
        {holidays.length > 0 ? (
          holidays.map((h, index) => (
            <View
              key={index}
              style={[styles.statBox, { borderColor: '#E0E0E0' }]}>
              <View
                style={[styles.statIndicator, { backgroundColor: '#2196F3' }]}
              />
              <View style={styles.statTextContainer}>
                <Text style={styles.statTitle}>{h.name}</Text>
                <Text
                  style={[styles.statCount, { color: colors.text.grey, fontSize: 14 }]}>
                  {moment(h.date).format('Do MMM')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: colors.text.grey }}>
              No holidays for this month
            </Text>
          </View>
        )}
      </View>
    );
  };

  const headerPaddingTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight || 0) + vh * 2
      : vh * 6;

  return (
    <>
      <StatusBar translucent barStyle="light-content" />
      <GradientComponent
        style={{
          paddingTop: headerPaddingTop,
          paddingBottom: 14,
          minHeight: vh * 17,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ paddingVertical: 8, paddingHorizontal: 10 }}>
            <Ionicons
              name="chevron-back-outline"
              size={28}
              color={colors.theme.white}
            />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ToggleButton btn={btn} handlePress={handlePress} />
          </View>
          <View style={{ width: 48 }} />
        </View>
      </GradientComponent>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {!childId ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: colors.text.grey, textAlign: 'center' }}>
                  Select a child from the home screen to view attendance.
                </Text>
              </View>
            ) : (
              <>
                {selectedChild?.firstName ? (
                  <View style={{ paddingHorizontal: 15, paddingTop: 8 }}>
                    <GrayMediumText
                      text={`${selectedChild.firstName} ${selectedChild.lastName || ''}`.trim()}
                      _style={{ fontSize: 14, color: colors.theme.primary }}
                    />
                  </View>
                ) : null}
                <View style={{ padding: 15 }}>
                  <CalendarPickerComponent
                    onDateChange={handleDate}
                    onMonthChange={handleMonthChange}
                    customDatesStyles={customDatesStylesCallback}
                  />
                </View>

                {renderSelectedDateInfo()}
                {renderAttendanceStats()}
                {renderHolidayList()}
              </>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
        <BottomLogo />
      </SafeAreaView>
    </>
  );
};

export default AttendanceLog;

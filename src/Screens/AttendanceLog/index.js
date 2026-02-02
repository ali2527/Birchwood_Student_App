import {
  Text,
  View,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../Stores/hooks';
import { selectUserAttendance } from '../../Stores/slices/user.slice';
import { asyncUserMonthlyAttendance, asyncGetAllHolidays } from '../../Stores/actions/user.action';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import { SecondaryHeader } from '../../Components/SecondaryHeader';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import moment from 'moment';
import { colors } from '../../theme/colors';
import BottomLogo from '../../Components/BottomLogo';
import { vh } from '../../theme/units';
import { styles } from './style';

const AttendanceLog = () => {
  const dispatch = useDispatch();
  const attendance = useAppSelector(selectUserAttendance);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());

  const [btn, setBtn] = useState({
    left: 'Attendance',
    right: 'Holiday',
    selected: 'Attendance',
  });

  const allHolidays = useAppSelector(state => state.user.holidays);
  const monthStr = React.useMemo(() => `${currentYear}-${String(currentMonth).padStart(2, '0')}`, [currentYear, currentMonth]);
  const holidays = React.useMemo(() => Object.values(allHolidays?.[monthStr] || {}), [allHolidays, monthStr]);

  useEffect(() => {
    dispatch(asyncUserMonthlyAttendance({ month: currentMonth, year: currentYear }));
    dispatch(asyncGetAllHolidays());
  }, [dispatch, currentMonth, currentYear]);

  const handlePress = (value, title) => {
    setBtn({
      ...btn,
      selected: title,
    });
  };

  const customDatesStylesCallback = date => {
    const formattedDate = moment(date).format('YYYY-MM-DD');

    // Check for attendance records first
    const dayAttendance = attendance?.attendance?.find(
      item => moment(item.createdAt).format('YYYY-MM-DD') === formattedDate
    );

    if (dayAttendance) {
      let bgColor = 'transparent';
      if (dayAttendance.status === 'PRESENT') bgColor = '#4CAF50';
      else if (dayAttendance.status === 'ABSENT') bgColor = '#F44336';
      else if (dayAttendance.status === 'LEAVE') bgColor = '#FFB300';

      return {
        style: { backgroundColor: bgColor },
        textStyle: { color: colors.theme.white, fontWeight: 'bold' },
      };
    }

    // Check if it's a holiday
    const isHoliday = holidays.find(h => moment(h.date).format('YYYY-MM-DD') === formattedDate);
    if (isHoliday) {
      return {
        style: { backgroundColor: '#E8F5E9' }, // Light green for holidays
        textStyle: { color: '#2E7D32', fontWeight: 'bold' },
      };
    }

    const weekendDate = moment(date).isoWeekday();
    if (weekendDate === 7 || weekendDate === 6) {
      return {
        style: { backgroundColor: '#F5F5F5' },
      };
    }
  };

  const handleDate = date => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const dayAttendance = attendance?.attendance?.find(
      item => moment(item.createdAt).format('YYYY-MM-DD') === formattedDate
    );

    if (dayAttendance) {
      setSelectedDateDetails(dayAttendance);
    } else {
      const isHoliday = holidays.find(h => moment(h.date).format('YYYY-MM-DD') === formattedDate);
      if (isHoliday) {
        setSelectedDateDetails({
          status: 'HOLIDAY',
          title: isHoliday.name,
          date: formattedDate
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

    const stats = attendance?.stats || { PRESENT: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: 0 };
    const statsData = [
      { id: 1, title: 'Present', count: stats.PRESENT, color: '#4CAF50' },
      { id: 2, title: 'Absent', count: stats.ABSENT, color: '#F44336' },
      { id: 3, title: 'Leave', count: stats.LEAVE, color: '#FFB300' },
      { id: 4, title: 'Holiday', count: stats.HOLIDAY, color: '#2196F3' },
    ];

    return (
      <View style={styles.statsContainer}>
        {statsData.map(item => (
          <View key={item.id} style={[styles.statBox, { borderColor: item.color + '40' }]}>
            <View style={[styles.statIndicator, { backgroundColor: item.color }]} />
            <View style={styles.statTextContainer}>
              <Text style={styles.statTitle}>{item.title}</Text>
              <Text style={[styles.statCount, { color: item.color }]}>{item.count}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSelectedDateInfo = () => {
    if (!selectedDateDetails) return null;

    const isRecord = selectedDateDetails.status !== 'No Record';

    return (
      <View style={styles.detailsCard}>
        <GlroyBold text={moment(selectedDateDetails.date || selectedDateDetails.createdAt).format('MMMM Do, YYYY')} _style={styles.detailsDate} />
        <View style={styles.detailRow}>
          <GrayMediumText text="Status: " />
          <Text style={[styles.detailValue, {
            color: selectedDateDetails.status === 'PRESENT' ? '#4CAF50' :
              selectedDateDetails.status === 'ABSENT' ? '#F44336' :
                selectedDateDetails.status === 'LEAVE' ? '#FFB300' :
                  selectedDateDetails.status === 'HOLIDAY' ? '#2196F3' : colors.text.grey
          }]}>
            {selectedDateDetails.status}
          </Text>
        </View>

        {selectedDateDetails.title && (
          <View style={styles.detailRow}>
            <GrayMediumText text="Event: " />
            <Text style={styles.detailValue}>{selectedDateDetails.title}</Text>
          </View>
        )}

        {selectedDateDetails.checkIn && (
          <View style={styles.detailRow}>
            <GrayMediumText text="Check-in: " />
            <Text style={styles.detailValue}>{moment(selectedDateDetails.checkIn).format('hh:mm A')}</Text>
          </View>
        )}
        {selectedDateDetails.checkOut && (
          <View style={styles.detailRow}>
            <GrayMediumText text="Check-out: " />
            <Text style={styles.detailValue}>{moment(selectedDateDetails.checkOut).format('hh:mm A')}</Text>
          </View>
        )}
        {selectedDateDetails.leaveReason && (
          <View style={styles.detailRow}>
            <GrayMediumText text="Notes: " />
            <Text style={styles.detailValue}>{selectedDateDetails.leaveReason}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderHolidayList = () => {
    if (btn.selected !== 'Holiday') return null;

    return (
      <View style={styles.statsContainer}>
        {holidays.length > 0 ? (
          holidays.map((h, index) => (
            <View key={index} style={[styles.statBox, { borderColor: '#E0E0E0' }]}>
              <View style={[styles.statIndicator, { backgroundColor: '#2196F3' }]} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statTitle}>{h.name}</Text>
                <Text style={[styles.statCount, { color: colors.text.grey, fontSize: 14 }]}>
                  {moment(h.date).format('Do MMM')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: colors.text.grey }}>No holidays for this month</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar translucent barStyle="light-content" />
      <SecondaryHeader
        btn={btn}
        handlePress={handlePress}
        iconName="chevron-back-outline"
        headerHeight={vh * 17}

      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
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

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
        <BottomLogo />
      </SafeAreaView>
    </>
  );
};

export default AttendanceLog;

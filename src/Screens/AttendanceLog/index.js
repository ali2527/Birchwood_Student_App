import {
  Text,
  View,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import {SecondaryHeader} from '../../Components/SecondaryHeader';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import moment from 'moment';
import {colors} from '../../theme/colors';
import BottomLogo from '../../Components/BottomLogo';
import {AttendanceItems} from '../../Components/AttendanceItems';
import {HolidayItems} from '../../Components/HolidayItems';
import {vh} from '../../theme/units';

const AttendanceLog = () => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [btn, setBtn] = useState({
    left: 'Attendance',
    right: 'Holiday',
    selected: 'Attendance',
  });

  const attendanceData = [
    {
      id: 1,
      title: 'Absent',
      data: '03',
    },
    {
      id: 2,
      title: 'Festival & Holiday',
      data: '05',
    },
  ];

  const holidaysData = [
    {
      id: 1,
      title: 'Easter',
      date: '11th november',
    },
    {
      id: 2,
      title: 'Good Friday',
      date: '14th november',
    },
    {
      id: 3,
      title: 'Chritsmas',
      date: '25th november',
    },
  ];

  const handlePress = (value, title) => {
    setBtn({
      ...btn,
      [value]: title,
    });
  };

  const customDatesStylesCallback = date => {
    const day = moment(date).date();
    const weekendDate = moment(date).isoWeekday();
    // console.log('weekendDate >>>', weekendDate);
    // return;
    switch (day) {
      case 7:
        return {
          style: {
            backgroundColor: colors.theme.red,
          },
          textStyle: {
            color: colors.theme.white,
            fontWeight: 'bold',
          },
        };
      case 13:
        return {
          style: {
            backgroundColor: colors.background.date,
          },
          textStyle: {
            color: colors.theme.white,
            fontWeight: 'bold',
          },
        };
      case 14:
        return {
          style: {
            backgroundColor: colors.background.date,
          },
          textStyle: {
            color: colors.theme.white,
            fontWeight: 'bold',
          },
        };
      case 15:
        return {
          style: {
            backgroundColor: colors.background.date,
          },
          textStyle: {
            color: colors.theme.white,
            fontWeight: 'bold',
          },
        };
      case 19:
        return {
          style: {
            backgroundColor: colors.theme.red,
          },
          textStyle: {
            color: colors.theme.white,
            fontWeight: 'bold',
          },
        };
      case 22:
        return {
          style: {
            backgroundColor: colors.theme.red,
          },
          textStyle: {
            color: colors.theme.white,
            fontWeight: 'bold',
          },
        };
      default:
        // Check if the day is a weekend (Saturday or Sunday)
        if (weekendDate === 7) {
          return {
            style: {
              backgroundColor: colors.theme.weekendClr,
            },
          };
        }
    }
  };

  const handleDate = date => {
    console.log('Date date >>>', date);
  };

  const renderItems = ({item, index}) => {
    if (btn.selected === 'Attendance') {
      return <AttendanceItems item={item} />;
    } else {
      return <HolidayItems item={item} index={index} />;
    }
  };

  const HeaderComponent = () => {
    return (
      <View style={{padding: 15}}>
        <CalendarPickerComponent
          onDateChange={handleDate}
          customDatesStyles={customDatesStylesCallback}
        />
      </View>
    );
  };

  return (
    <>
      <StatusBar
        translucent
        // backgroundColor="#035392"
        barStyle="light-content"
      />
      <SecondaryHeader
        btn={btn}
        handlePress={handlePress}
        iconName="chevron-back-outline"
        headerHeight={vh * 17}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* <ScrollView contentContainerStyle={{flexGrow: 1}}> */}

          {/* </ScrollView> */}
          <FlatList
            data={btn.selected === 'Attendance' ? attendanceData : holidaysData}
            renderItem={renderItems}
            ListHeaderComponent={() => <HeaderComponent />}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <View style={{margin: 10}} />}
          />
        </View>
        {/* Bottom View */}
        <BottomLogo />
      </SafeAreaView>
    </>
  );
};

export default AttendanceLog;

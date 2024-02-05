import {
  Text,
  View,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ImageBackground,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import {SecondaryHeader} from '../../Components/SecondaryHeader';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import moment from 'moment';
import {colors} from '../../theme/colors';
import BottomLogo from '../../Components/BottomLogo';

const AttendanceLog = () => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  let today = moment();
  let day = today.clone().startOf('month');
  let customDatesStyles = [];

  // let dates = [12, 13, 14];
  // dates.map(item => {
  //   customDatesStyles.push({
  //     date: item,
  //     style: {
  //       backgroundColor: '#000',
  //     },
  //     textStyle: {color: '#fff'},
  //     containerStyle: [],
  //     allowDisabled: true,
  //   });
  // });

  while (day.isSameOrBefore(today.endOf('month'), 'day')) {
    customDatesStyles.push({
      date: day.clone(),
      style: {
        backgroundColor:
          '#' +
          ('00000' + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6),
      },
      textStyle: {color: 'black'},
      containerStyle: [],
      allowDisabled: true,
    });

    day.add(1, 'day');
  }

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

  return (
    <>
      <StatusBar
        translucent
        // backgroundColor="#035392"
        barStyle="light-content"
      />
      <SecondaryHeader />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={{padding: 15}}>
              <CalendarPickerComponent
                onDateChange={handleDate}
                customDatesStyles={customDatesStylesCallback}
              />
            </View>
          </ScrollView>
        </View>
        {/* Bottom View */}
        <BottomLogo />
      </SafeAreaView>
    </>
  );
};

export default AttendanceLog;

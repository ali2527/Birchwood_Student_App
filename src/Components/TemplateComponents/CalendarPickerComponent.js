import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CalendarPicker from 'react-native-calendar-picker';
import VectorIcon from '../VectorIcons';
import {colors} from '../../theme/colors';

const CalendarPickerComponent = ({onDateChange, customDatesStyles}) => {
  return (
    <CalendarPicker
      onDateChange={onDateChange}
      //   showDayStragglers={true}
      previousComponent={
        <VectorIcon type={'Ionicons'} name={'chevron-back-outline'} size={20} />
      }
      nextComponent={
        <VectorIcon
          type={'Ionicons'}
          name={'chevron-forward-outline'}
          size={20}
        />
      }
      customDatesStyles={customDatesStyles}
      monthTitleStyle={styles.calendarHeaderStyle}
      yearTitleStyle={styles.calendarHeaderStyle}
      dayLabelsWrapper={styles.containerHeader}
      todayBackgroundColor={colors.theme.primary}
    />
  );
};

export default CalendarPickerComponent;

const styles = StyleSheet.create({
  calendarHeaderStyle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  containerHeader: {
    // backgroundColor: 'blue',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
});

import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './style';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import {colors} from '../../theme/colors';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import moment from 'moment';
import CustomTextInput from '../../Components/InputField';
import CustomButton from '../../Components/Button';

const LeaveApplication = () => {
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
  });

  function handleChange(name, value) {
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  const customDatesStylesCallback = date => {
    const day = moment(date).date();
    const weekendDate = moment(date).isoWeekday();
    // console.log('weekendDate >>>', weekendDate);
    // return;
    switch (day) {
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
    <ScreenWrapperContainer title="Leave Application">
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <CalendarPickerComponent
            onDateChange={handleDate}
            customDatesStyles={customDatesStylesCallback}
          />
          <CustomTextInput
            label="Select Date"
            name={'date'}
            onChangeText={(name, value) => handleChange(name, value)}
            placeholder={'dd/mm/yyyy'}
            value={formData.date}
            required
            _inputStyle={styles.inputStyle}
            labelStyle={{color: colors.theme.black}}
            placeholderClr={colors.theme.grey}
          />
          <CustomTextInput
            label="Reason"
            name={'reason'}
            onChangeText={(name, value) => handleChange(name, value)}
            placeholder={'Type your reason'}
            value={formData.reason}
            required
            multiple={true}
            _inputStyle={styles.inputStyle}
            labelStyle={{color: colors.theme.black}}
            placeholderClr={colors.theme.grey}
          />
          <View style={{alignItems: 'center'}}>
            <CustomButton title={'Done'} isFocused={true} />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapperContainer>
  );
};

export default LeaveApplication;

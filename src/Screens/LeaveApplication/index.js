import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { styles } from './style';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import { colors } from '../../theme/colors';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import moment from 'moment';
import CustomTextInput from '../../Components/InputField';
import CustomButton from '../../Components/Button';
import DropDown from '../../Components/DropDown';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../Stores/hooks';
import { selectSelectedChild } from '../../Stores/slices/class.slice';
import { asyncUserLeave, asyncUserMonthlyAttendance } from '../../Stores/actions/user.action';
import GlroyBold from '../../Components/GlroyBoldText';
import { selectUserAttendance } from '../../Stores/slices/user.slice';

const leaveTypesList = [
  { label: 'Sick Leave', value: 'SICK' },
  { label: 'Casual Leave', value: 'CASUAL' },
  { label: 'Emergency', value: 'EMERGENCY' },
  { label: 'Medical Appointment', value: 'MEDICAL_APPOINTMENT' },
  { label: 'Family Event', value: 'FAMILY_EVENT' },
  { label: 'Religious Holiday', value: 'RELIGIOUS' },
  { label: 'Bereavement', value: 'BEREAVEMENT' },
  { label: 'Travel', value: 'TRAVEL' },
];

const LeaveApplication = () => {
  const dispatch = useDispatch();
  const selectedChild = useAppSelector(selectSelectedChild);
  const attendance = useAppSelector(selectUserAttendance);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(leaveTypesList);
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    reason: '',
    leaveType: 'SICK',
  });

  const leaveRequests = React.useMemo(() => {
    return attendance?.attendance?.filter(item => item.status === 'LEAVE' || item.leaveType) || [];
  }, [attendance]);

  function handleChange(name, value) {
    setFormData(prev => ({
      ...prev,
      [name]: typeof value === 'function' ? value(prev[name]) : value,
    }));
  }

  const handleDateChange = (date, type) => {
    if (type === 'END_DATE') {
      setFormData(prev => ({ ...prev, endDate: date }));
    } else {
      setFormData(prev => ({ ...prev, startDate: date, endDate: null }));
    }
  };

  const submitLeave = () => {
    if (!formData.startDate || !formData.reason) {
      Alert.alert('Error', 'Please select a date and provide a reason.');
      return;
    }

    const payload = {
      leaveFrom: formData.startDate.toISOString(),
      leaveTo: (formData.endDate || formData.startDate).toISOString(),
      leaveType: formData.leaveType,
      leaveReason: formData.reason,
    };

    dispatch(asyncUserLeave(payload)).then((res) => {
      if (res.payload?.status) {
        setFormData({ startDate: null, endDate: null, reason: '', leaveType: 'SICK' });
        dispatch(asyncUserMonthlyAttendance({ month: moment().month() + 1, year: moment().year() }));
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#FFB300';
      case 'APPROVED': case 'LEAVE': return '#4CAF50';
      case 'REJECTED': return '#F44336';
      default: return colors.theme.grey;
    }
  };

  return (
    <ScreenWrapperContainer title="Leave Request">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.container}>
          <View style={styles.childBadge}>
            <Text style={styles.childLabel}>Child: </Text>
            <GlroyBold text={selectedChild?.firstName + ' ' + selectedChild?.lastName} _style={styles.childName} />
          </View>

          <View style={styles.calendarContainer}>
            <CalendarPickerComponent
              allowRangeSelection={true}
              onDateChange={handleDateChange}
              selectedDayColor={colors.theme.primary}
              selectedDayTextColor={colors.theme.white}
              minDate={new Date()}
            />
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
              <Text style={styles.label}>Leave Type</Text>
              <DropDown
                list={items}
                value={formData.leaveType}
                onChange={(val) => handleChange('leaveType', val)}
                open={open}
                setOpen={setOpen}
                setItems={setItems}
                multiple={false}
                mode="SIMPLE"
                listMode="SCROLLVIEW"
                placeholder="Select Leave Type"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <CustomTextInput
              label="Reason"
              name={'reason'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'Type your reason'}
              value={formData.reason}
              required
              multiple={true}
              _inputStyle={styles.reasonInput}
              labelStyle={{ color: colors.theme.black }}
              placeholderClr={colors.theme.grey}
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                title={'Submit Leave Request'}
                isFocused={true}
                onPress={submitLeave}
              />
            </View>
          </View>

          {leaveRequests.length > 0 && (
            <View style={styles.historyContainer}>
              <GlroyBold text="Recent Leave Requests" _style={styles.historyTitle} />
              {leaveRequests.map((item, index) => (
                <View key={index} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {moment(item.createdAt || item.date).format('DD MMM')} - {item.leaveType || 'Leave'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.subStatus || item.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(item.subStatus || item.status) }]}>
                        {item.subStatus || item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyReason} numberOfLines={2}>{item.leaveReason || 'No reason provided'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapperContainer>
  );
};

export default LeaveApplication;

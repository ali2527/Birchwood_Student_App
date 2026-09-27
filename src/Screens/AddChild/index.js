import React, {useMemo, useState} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AuthField from '../../Components/Auth/AuthField';
import CalendarPickerComponent from '../../Components/TemplateComponents/CalendarPickerComponent';
import fonts from '../../Assets/fonts';
import {asyncAssignChild} from '../../Stores/actions/user.action';
import {useAppDispatch} from '../../Stores/hooks';
import {colors} from '../../theme/colors';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;
const SCREEN_W = Dimensions.get('window').width;

export default function AddChild() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [rollNumber, setRollNumber] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const birthdayLabel = useMemo(
    () => (birthday ? birthday.format('D MMM YYYY') : ''),
    [birthday],
  );

  const onSubmit = async () => {
    setError('');
    const roll = rollNumber.trim();
    if (!roll) {
      setError('Enter the child’s roll number from school.');
      return;
    }
    if (!birthday?.isValid()) {
      setError('Choose the child’s date of birth.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await dispatch(
        asyncAssignChild({
          rollNumber: roll,
          birthday: birthday.format('YYYY-MM-DD'),
        }),
      );
      const payload = result?.payload;
      if (payload?.status) {
        navigation.goBack();
        return;
      }
      setError(payload?.message || 'Could not link this child. Check the details and try again.');
    } catch {
      setError('Could not link this child. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 8}]}>
        <Text style={styles.headerTitle}>Link child</Text>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.copy}>
              Use the roll number and date of birth from the school records to
              link your child to this parent account.
            </Text>
          </View>

          <AuthField
            label="Roll number"
            placeholder="e.g. S000001"
            leftIcon="grid"
            autoCapitalize="characters"
            autoCorrect={false}
            value={rollNumber}
            onChangeText={setRollNumber}
          />

          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setDateOpen(true)}
            activeOpacity={0.85}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#9CA3AF"
              style={styles.dateIcon}
            />
            <Text
              style={[styles.dateValue, !birthdayLabel && styles.datePlaceholder]}>
              {birthdayLabel || 'Select date of birth'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submit, submitting && styles.submitDisabled]}
            onPress={onSubmit}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.submitText}>
              {submitting ? 'Linking…' : 'Link child'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={dateOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDateOpen(false)}>
        <View style={styles.calRoot}>
          <Pressable style={styles.calDim} onPress={() => setDateOpen(false)} />
          <View style={styles.calCard}>
            <Text style={styles.calTitle}>Date of birth</Text>
            <CalendarPickerComponent
              width={SCREEN_W - 64}
              selectedStartDate={birthday ? birthday.toDate() : null}
              maxDate={new Date()}
              minDate={new Date(1995, 0, 1)}
              onDateChange={date => {
                if (!date) {
                  return;
                }
                setBirthday(moment(date).startOf('day'));
                setDateOpen(false);
              }}
              selectedDayColor={PRIMARY}
              selectedDayTextColor="#FFFFFF"
              todayBackgroundColor="#E8F1F8"
              todayTextStyle={{color: PRIMARY}}
              textStyle={styles.calDay}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: NAVY,
    letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  copy: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
  },
  label: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 18,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateValue: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: '#111827',
  },
  datePlaceholder: {
    color: '#9CA3AF',
  },
  error: {
    marginTop: -6,
    marginBottom: 12,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: '#E11D48',
  },
  submit: {
    marginTop: 4,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  calRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  calDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  calCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  calTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
    marginBottom: 10,
  },
  calDay: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: NAVY,
  },
});

import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AuthField from '../../Components/Auth/AuthField';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {useAppSelector} from '../../Stores/hooks';
import {selectChildren} from '../../Stores/slices/class.slice';
import {colors} from '../../theme/colors';
import {CATEGORIES} from './helpers';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

function childName(child) {
  return `${child?.firstName || ''} ${child?.lastName || ''}`.trim() || 'Student';
}

export default function CreateTicket() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [childId, setChildId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const title = subject.trim();
    const body = message.trim();
    if (!title) {
      setError('Add a short subject.');
      return;
    }
    if (!body) {
      setError('Write a message for the office.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await callApi({
        method: 'POST',
        path: allApiPaths.getPath('createSupportTicket'),
        body: {
          subject: title,
          message: body,
          category,
          relatedChild: childId || undefined,
        },
      });
      const ticket = res?.data?.ticket;
      if (!res?.status || !ticket?._id) {
        setError(res?.message || 'Could not open this ticket.');
        return;
      }
      navigation.replace(routes.screens.supportTicket, {ticketId: ticket._id});
    } catch {
      setError('Could not open this ticket. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 8}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New ticket</Text>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <AuthField
            label="Subject"
            placeholder="What do you need help with?"
            leftIcon="type"
            value={subject}
            onChangeText={setSubject}
          />
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(item => {
              const active = item.value === category;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(item.value)}
                  activeOpacity={0.85}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {children.length ? (
            <>
              <Text style={styles.label}>Student</Text>
              <View style={styles.chips}>
                <TouchableOpacity
                  style={[styles.chip, !childId && styles.chipActive]}
                  onPress={() => setChildId('')}
                  activeOpacity={0.85}>
                  <Text style={[styles.chipText, !childId && styles.chipTextActive]}>
                    None
                  </Text>
                </TouchableOpacity>
                {children.map(child => {
                  const active = childId === child._id;
                  return (
                    <TouchableOpacity
                      key={child._id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setChildId(child._id)}
                      activeOpacity={0.85}>
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}>
                        {childName(child)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          <AuthField
            label="Message"
            placeholder="Tell the office what happened"
            leftIcon="message-square"
            multiline
            value={message}
            onChangeText={setMessage}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submit, submitting && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={submitting}
            activeOpacity={0.85}>
            <Text style={styles.submitText}>
              {submitting ? 'Opening…' : 'Open ticket'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: NAVY,
    letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  label: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: NAVY,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  error: {
    marginTop: -6,
    marginBottom: 12,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: '#E11D48',
  },
  submit: {
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
});

import React, {useEffect, useState} from 'react';
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
import ParentPhotoPickers, {
  appendParentPhoto,
  pickParentPhoto,
} from '../../Components/Auth/ParentPhotoPickers';
import {
  DEFAULT_PHONE_COUNTRY,
  parsePhone,
  toPhonePayload,
} from '../../Components/Auth/phoneMask';
import fonts from '../../Assets/fonts';
import {getImagePath} from '../../Service/axios';
import {asyncUpdateProfile} from '../../Stores/actions/user.action';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {colors} from '../../theme/colors';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

function isLocalPhoto(photo) {
  const uri = photo?.uri || '';
  return Boolean(uri) && !/^https?:\/\//i.test(uri);
}

export default function ProfileForm() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const profile = useAppSelector(selectUserProfile);

  const [formData, setFormData] = useState({
    fatherFirstName: '',
    fatherLastName: '',
    motherFirstName: '',
    motherLastName: '',
    email: '',
    phone: '',
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    address: '',
    city: '',
    state: '',
  });
  const [fatherPhoto, setFatherPhoto] = useState(null);
  const [motherPhoto, setMotherPhoto] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?._id) {
      return;
    }
    const parsed = parsePhone(profile?.phone || '');
    setFormData({
      fatherFirstName: profile?.fatherFirstName || '',
      fatherLastName: profile?.fatherLastName || '',
      motherFirstName: profile?.motherFirstName || '',
      motherLastName: profile?.motherLastName || '',
      email: profile?.email || '',
      phone: parsed.local,
      phoneCountry: parsed.iso || DEFAULT_PHONE_COUNTRY,
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
    });
    const fatherUri = getImagePath(profile?.fatherImage || profile?.image);
    const motherUri = getImagePath(profile?.motherImage);
    setFatherPhoto(fatherUri ? {uri: fatherUri} : null);
    setMotherPhoto(motherUri ? {uri: motherUri} : null);
  }, [profile]);

  const setField = (name, value) => {
    setFormData(prev => ({...prev, [name]: value}));
  };

  const onSubmit = async () => {
    setError('');
    const fatherFirst = formData.fatherFirstName.trim();
    const motherFirst = formData.motherFirstName.trim();
    if (fatherFirst.length < 3) {
      setError('Father first name must be at least 3 letters.');
      return;
    }
    if (motherFirst.length < 3) {
      setError('Mother first name must be at least 3 letters.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Enter a phone number so the school can reach you.');
      return;
    }

    const payload = {
      fatherFirstName: fatherFirst,
      fatherLastName: formData.fatherLastName.trim(),
      motherFirstName: motherFirst,
      motherLastName: formData.motherLastName.trim(),
      phone: toPhonePayload(formData.phone, formData.phoneCountry),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
    };

    const fatherPicked = isLocalPhoto(fatherPhoto);
    const motherPicked = isLocalPhoto(motherPhoto);
    let body = payload;
    if (fatherPicked || motherPicked) {
      const data = new FormData();
      Object.keys(payload).forEach(key => {
        data.append(key, payload[key] ?? '');
      });
      if (fatherPicked) {
        appendParentPhoto(data, 'fatherImage', fatherPhoto);
      }
      if (motherPicked) {
        appendParentPhoto(data, 'motherImage', motherPhoto);
      }
      body = data;
    }

    setSubmitting(true);
    try {
      const result = await dispatch(asyncUpdateProfile(body));
      if (result.type === 'updateProfile/fulfilled' && result.payload?.status) {
        navigation.goBack();
        return;
      }
      setError(result.payload?.message || 'Could not update profile.');
    } catch {
      setError('Could not update profile. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 12) + 6}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <ParentPhotoPickers
            fatherUri={fatherPhoto?.uri}
            motherUri={motherPhoto?.uri}
            onPickFather={async () => {
              const photo = await pickParentPhoto();
              if (photo) {
                setFatherPhoto(photo);
              }
            }}
            onPickMother={async () => {
              const photo = await pickParentPhoto();
              if (photo) {
                setMotherPhoto(photo);
              }
            }}
          />

          <AuthField
            label="Father first name"
            placeholder="Father first name"
            leftIcon="user"
            value={formData.fatherFirstName}
            onChangeText={value => setField('fatherFirstName', value)}
          />
          <AuthField
            label="Father last name"
            placeholder="Father last name"
            leftIcon="user"
            value={formData.fatherLastName}
            onChangeText={value => setField('fatherLastName', value)}
          />
          <AuthField
            label="Mother first name"
            placeholder="Mother first name"
            leftIcon="user"
            value={formData.motherFirstName}
            onChangeText={value => setField('motherFirstName', value)}
          />
          <AuthField
            label="Mother last name"
            placeholder="Mother last name"
            leftIcon="user"
            value={formData.motherLastName}
            onChangeText={value => setField('motherLastName', value)}
          />
          <AuthField
            label="Email"
            placeholder="Email"
            leftIcon="mail"
            value={formData.email}
            editable={false}
          />
          <AuthField
            label="Phone"
            placeholder="Phone"
            mask="phone"
            value={formData.phone}
            onChangeText={value => setField('phone', value)}
            countryIso={formData.phoneCountry}
            onCountryChange={iso => setField('phoneCountry', iso)}
          />
          <AuthField
            label="Address"
            placeholder="Street address"
            leftIcon="user"
            value={formData.address}
            onChangeText={value => setField('address', value)}
          />
          <AuthField
            label="City"
            placeholder="City"
            leftIcon="user"
            value={formData.city}
            onChangeText={value => setField('city', value)}
          />
          <AuthField
            label="State"
            placeholder="State"
            leftIcon="user"
            value={formData.state}
            onChangeText={value => setField('state', value)}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submit, submitting && styles.submitDisabled]}
            onPress={onSubmit}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.submitText}>
              {submitting ? 'Saving…' : 'Save changes'}
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  error: {
    marginTop: -8,
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
});

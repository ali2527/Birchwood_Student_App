import React, {useMemo, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AuthField from '../../Components/Auth/AuthField';
import {
  appendParentPhoto,
  pickParentPhoto,
} from '../../Components/Auth/ParentPhotoPickers';
import fonts from '../../Assets/fonts';
import profile_icon from '../../Assets/images/profile_bg.png';
import {getImagePath} from '../../Service/axios';
import {asyncUpdateChildHealth} from '../../Stores/actions/user.action';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {
  selectChildren,
  selectSelectedChild,
} from '../../Stores/slices/class.slice';
import {colors} from '../../theme/colors';

const NAVY = '#0F1F4B';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

function joinList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }
  return typeof value === 'string' ? value : '';
}

function joinNotes(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join('\n');
  }
  return typeof value === 'string' ? value : '';
}

function isLocalPhoto(photo) {
  const uri = photo?.uri || '';
  return Boolean(uri) && !/^https?:\/\//i.test(uri);
}

export default function EditChild() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const childId = route?.params?.childId;

  const child = useMemo(() => {
    if (childId) {
      return children.find(item => item._id === childId) || selectedChild;
    }
    return selectedChild || children[0] || null;
  }, [childId, children, selectedChild]);

  const [photo, setPhoto] = useState(() => {
    const uri = child?.image ? getImagePath(child.image) : '';
    return uri ? {uri} : null;
  });
  const [allergies, setAllergies] = useState(() => joinList(child?.allergies));
  const [conditions, setConditions] = useState(() =>
    joinList(child?.conditions),
  );
  const [fears, setFears] = useState(() => joinList(child?.fears));
  const [summary, setSummary] = useState(() => joinNotes(child?.summary));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!child?._id) {
      setError('No child selected.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        childId: child._id,
        allergies,
        conditions,
        fears,
        summary,
      };
      let body = payload;
      if (isLocalPhoto(photo)) {
        const data = new FormData();
        Object.keys(payload).forEach(key => {
          data.append(key, payload[key] ?? '');
        });
        appendParentPhoto(data, 'image', photo);
        body = data;
      }
      const result = await dispatch(asyncUpdateChildHealth(body));
      if (
        result.type === 'updateChildHealth/fulfilled' &&
        result.payload?.status
      ) {
        navigation.goBack();
        return;
      }
      setError(result.payload?.message || 'Could not save these details.');
    } catch {
      setError('Could not save these details. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 8}]}>
        <Text style={styles.headerTitle}>Edit child</Text>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={async () => {
              const next = await pickParentPhoto();
              if (next) {
                setPhoto(next);
              }
            }}
            activeOpacity={0.85}>
            <View style={styles.photoWrap}>
              <Image
                source={photo?.uri ? {uri: photo.uri} : profile_icon}
                style={styles.photo}
              />
              <View style={styles.photoBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.photoHint}>Change photo</Text>
          </TouchableOpacity>

          <AuthField
            label="Allergies"
            placeholder="Peanuts, dairy"
            leftIcon="alert-circle"
            value={allergies}
            onChangeText={setAllergies}
          />
          <AuthField
            label="Medical conditions"
            placeholder="Mild asthma"
            leftIcon="activity"
            value={conditions}
            onChangeText={setConditions}
          />
          <AuthField
            label="Fears"
            placeholder="Loud noises"
            leftIcon="cloud"
            value={fears}
            onChangeText={setFears}
          />
          <AuthField
            label="Notes"
            placeholder="One note per line"
            leftIcon="file-text"
            multiline
            value={summary}
            onChangeText={setSummary}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submit, submitting && styles.submitDisabled]}
            onPress={onSubmit}
            activeOpacity={0.85}
            disabled={submitting}>
            <Text style={styles.submitText}>
              {submitting ? 'Saving…' : 'Save'}
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
  photoBtn: {
    alignItems: 'center',
    marginBottom: 18,
  },
  photoWrap: {
    width: 96,
    height: 96,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8EDF5',
  },
  photoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    marginTop: 10,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: PRIMARY,
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
});

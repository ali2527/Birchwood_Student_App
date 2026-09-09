import React, {useMemo} from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import profile_icon from '../../Assets/images/profile_bg.png';
import {getImagePath} from '../../Service/axios';
import {useAppSelector} from '../../Stores/hooks';
import {
  selectChildren,
  selectSelectedChild,
} from '../../Stores/slices/class.slice';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';

function teacherName(classroom) {
  const teacher = classroom?.teacher;
  if (!teacher || typeof teacher === 'string') {
    return '';
  }
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
}

function classroomLabel(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  const name = classroom.classroomName || classroom.classroomId || '';
  const grade = classroom.classroomGrade;
  if (name && grade) {
    return `${name} • Grade ${grade}`;
  }
  return name || (grade ? `Grade ${grade}` : '');
}

function listOrNone(value) {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(Boolean).join(', ');
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return 'None recorded';
}

export default function ChildProfile() {
  const navigation = useNavigation();
  const route = useRoute();
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

  const name = child
    ? `${child.firstName || ''} ${child.lastName || ''}`.trim()
    : '';
  const photo = child?.image
    ? {uri: getImagePath(child.image)}
    : profile_icon;
  const dob = child?.birthday
    ? moment(child.birthday).format('D MMM YYYY')
    : '';
  const age =
    child?.age ||
    (child?.birthday ? moment().diff(moment(child.birthday), 'years') : '');

  const rows = [
    {label: 'Name', value: name || '—'},
    {label: 'Roll number', value: child?.rollNumber || '—'},
    {label: 'Date of birth', value: dob || '—'},
    {label: 'Age', value: age ? String(age) : '—'},
  ];

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
        <Text style={styles.headerTitle}>Child profile</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={['#1A73C7', '#035392']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}>
          <Image source={photo} style={styles.photo} />
          <Text style={styles.name}>{name || 'Child'}</Text>
          {classroomLabel(child?.classroom) ? (
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {classroomLabel(child?.classroom)}
              </Text>
            </View>
          ) : null}
          {teacherName(child?.classroom) ? (
            <Text style={styles.heroMeta}>
              Teacher: {teacherName(child?.classroom)}
            </Text>
          ) : null}
        </LinearGradient>

        <Text style={styles.section}>Basic information</Text>
        <View style={styles.card}>
          {rows.map(row => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Classroom</Text>
        <View style={styles.card}>
          <Text style={styles.value}>
            {classroomLabel(child?.classroom) || 'None recorded'}
          </Text>
        </View>

        <Text style={styles.section}>Teacher</Text>
        <View style={styles.card}>
          <Text style={styles.value}>
            {teacherName(child?.classroom) || 'None recorded'}
          </Text>
        </View>

        <Text style={styles.section}>Allergies</Text>
        <View style={styles.card}>
          <Text style={styles.value}>{listOrNone(child?.allergies)}</Text>
        </View>

        <Text style={styles.section}>Medical conditions</Text>
        <View style={styles.card}>
          <Text style={styles.value}>{listOrNone(child?.conditions)}</Text>
        </View>

        <Text style={styles.section}>Fears</Text>
        <View style={styles.card}>
          <Text style={styles.value}>{listOrNone(child?.fears)}</Text>
        </View>

        <Text style={styles.section}>Health summary</Text>
        <View style={styles.card}>
          <Text style={styles.value}>{listOrNone(child?.summary)}</Text>
        </View>
      </ScrollView>
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
  hero: {
    alignItems: 'center',
    marginBottom: 18,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  heroPill: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroPillText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  heroMeta: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
  },
  section: {
    marginTop: 14,
    marginBottom: 8,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: MUTED,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: MUTED,
    marginBottom: 3,
  },
  value: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
});

import React, {useEffect} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {WIDTH} from '../../theme/units';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {getImagePath} from '../../Service/axios';
import {
  asyncGetAllMyChildren,
  asyncGetUserProfile,
} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {
  selectChildren,
  selectSelectedChild,
  setSelectedChild,
} from '../../Stores/slices/class.slice';
import profile_icon from '../../Assets/images/profile_bg.png';
import ChildSwitcher from '../../Components/ChildSwitcher';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const GRID_GAP = 12;
const GRID_PAD = 18;
const CARD_W = (WIDTH - GRID_PAD * 2 - GRID_GAP) / 2;

const LOGO = {
  purple: {bg: '#C4A6DE', blob: '#7A3B9B'},
  pink: {bg: '#E889BC', blob: '#C23A8C'},
  blue: {bg: '#6BA3D6', blob: '#035392'},
  green: {bg: '#86C992', blob: '#2E7A3D'},
  yellow: {bg: '#E0B83A', blob: '#F3D97A'},
  orange: {bg: '#E8954A', blob: '#F5C49A'},
  red: {bg: '#E07A7C', blob: '#C44548'},
};

const MODULES = [
  {
    key: 'activities',
    title: 'Activities',
    icon: 'camera-outline',
    bg: LOGO.purple.bg,
    blob: LOGO.purple.blob,
    screen: routes.screens.activityScreen,
  },
  {
    key: 'leave',
    title: 'Leave',
    icon: 'document-text-outline',
    bg: LOGO.pink.bg,
    blob: LOGO.pink.blob,
    screen: routes.screens.leaveApplication,
  },
  {
    key: 'results',
    title: 'Results',
    icon: 'trophy-outline',
    bg: LOGO.blue.bg,
    blob: LOGO.blue.blob,
    screen: routes.screens.result,
  },
  {
    key: 'gallery',
    title: 'Gallery',
    icon: 'images-outline',
    bg: LOGO.green.bg,
    blob: LOGO.green.blob,
    screen: routes.screens.schoolAlbums,
  },
  {
    key: 'diary',
    title: 'Diary',
    icon: 'reader-outline',
    bg: LOGO.yellow.bg,
    blob: LOGO.yellow.blob,
    screen: routes.screens.diaryHomework,
  },
  {
    key: 'notices',
    title: 'Notices',
    icon: 'notifications-outline',
    bg: LOGO.orange.bg,
    blob: LOGO.orange.blob,
    screen: routes.screens.notices,
  },
  {
    key: 'fees',
    title: 'Fees',
    icon: 'card-outline',
    bg: LOGO.red.bg,
    blob: LOGO.red.blob,
    screen: routes.screens.feesDue,
  },
  {
    key: 'attendance',
    title: 'Attendance',
    icon: 'checkmark-done-outline',
    bg: LOGO.purple.bg,
    blob: LOGO.purple.blob,
    screen: routes.screens.attendanceLog,
  },
];

function greetingWord() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function teacherName(classroom) {
  const teacher = classroom?.teacher;
  if (!teacher || typeof teacher === 'string') {
    return '';
  }
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
}

function classBadge(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  const name = classroom.classroomName || classroom.classroomId || '';
  const grade = classroom.classroomGrade;
  if (name && grade) {
    return `${name} (Grade ${grade})`;
  }
  return name || (grade ? `Grade ${grade}` : '');
}

function academicYearLabel() {
  const now = new Date();
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start} – ${String(start + 1).slice(-2)}`;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const userProfile = useAppSelector(selectUserProfile);
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);

  const parentFirst =
    userProfile?.fatherFirstName || userProfile?.firstName || 'there';
  const child = selectedChild || children[0];
  const hasChildren = children.length > 0;

  useEffect(() => {
    dispatch(asyncGetUserProfile());
    dispatch(asyncGetAllMyChildren());
  }, [dispatch]);

  const childPhoto = child?.image
    ? {uri: getImagePath(child.image)}
    : profile_icon;
  const classMeta = classBadge(child?.classroom);
  const teacher = teacherName(child?.classroom);
  const childFullName = child
    ? `${child.firstName || ''} ${child.lastName || ''}`.trim()
    : '';
  const yearLabel = child?.term || academicYearLabel();

  const go = screen => navigation.navigate(screen);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 10) + 6,
            paddingBottom: 100 + insets.bottom,
            flexGrow: 1,
          }}>
          <View style={styles.topRow}>
            <View style={styles.helloWrap}>
              <Text style={styles.hello} numberOfLines={1}>
                {greetingWord()}, {parentFirst} 👋
              </Text>
              <Text style={styles.helloSub} numberOfLines={1}>
                A quick look at today.
              </Text>
            </View>
            <ChildSwitcher
              childList={children}
              selected={child}
              onSelect={next => dispatch(setSelectedChild(next))}
              onAdd={() => go(routes.screens.addChild)}
            />
          </View>

          <LinearGradient
            colors={['#0E4F9C', '#1B6FCB']}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
            style={styles.blueCard}>
            <TouchableOpacity
              style={styles.studentMain}
              onPress={() => {
                if (!hasChildren) {
                  go(routes.screens.addChild);
                  return;
                }
                if (child?._id) {
                  navigation.navigate(routes.screens.childProfile, {
                    childId: child._id,
                  });
                }
              }}
              activeOpacity={0.9}>
              <View style={styles.photoWrap}>
                <Image source={childPhoto} style={styles.studentPhoto} />
                <View
                  style={[
                    styles.onlineDot,
                    !child?.checkIn && styles.onlineDotOff,
                  ]}
                />
              </View>
              <View style={styles.studentCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {hasChildren ? childFullName : 'No child linked'}
                  </Text>
                </View>
                {hasChildren && classMeta ? (
                  <View style={styles.classPill}>
                    <Ionicons name="checkmark-circle" size={12} color="#7DD3FC" />
                    <Text style={styles.classPillText}>{classMeta}</Text>
                  </View>
                ) : null}
                <Text style={styles.metaText} numberOfLines={1}>
                  {hasChildren
                    ? teacher
                      ? `Teacher: ${teacher}`
                      : 'Teacher not assigned'
                    : 'Link a child to get started'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.yearDivider} />
            <View style={styles.yearCol}>
              <View style={styles.yearIcon}>
                <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.yearLabel}>Academic Year</Text>
              <Text style={styles.yearValue}>{yearLabel}</Text>
            </View>
          </LinearGradient>

          <View style={styles.gridWrap}>
            <View style={styles.grid}>
              {MODULES.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.moduleWrap}
                  onPress={() => go(item.screen)}
                  activeOpacity={0.9}>
                  <View style={[styles.module, {backgroundColor: item.bg}]}>
                    <View style={[styles.blob, {backgroundColor: item.blob}]}>
                      <Feather name="arrow-up-right" size={16} color="#FFFFFF" />
                    </View>
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color="#FFFFFF"
                      style={styles.moduleIcon}
                    />
                    <Text style={styles.moduleTitle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID_PAD,
    marginBottom: 14,
  },
  helloWrap: {
    flex: 1,
    marginRight: 12,
  },
  hello: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  helloSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  blueCard: {
    marginHorizontal: GRID_PAD,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#035392',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.22,
        shadowRadius: 16,
      },
      android: {elevation: 6},
    }),
  },
  studentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  photoWrap: {
    width: 62,
    height: 62,
  },
  studentPhoto: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDotOff: {
    backgroundColor: '#94A3B8',
  },
  studentCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studentName: {
    flexShrink: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  classPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: 'rgba(125, 211, 252, 0.22)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  classPillText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: '#E0F2FE',
  },
  metaText: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
  },
  yearDivider: {
    width: 1,
    height: 62,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 12,
  },
  yearCol: {
    width: 86,
    alignItems: 'center',
  },
  yearIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  yearLabel: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  yearValue: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  gridWrap: {
    paddingHorizontal: GRID_PAD,
    paddingTop: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GRID_GAP / 2,
  },
  moduleWrap: {
    width: CARD_W,
    marginHorizontal: GRID_GAP / 2,
    marginBottom: GRID_GAP,
    ...Platform.select({
      ios: {
        shadowColor: '#1F2937',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {elevation: 4},
    }),
  },
  module: {
    height: 140,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  blob: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  moduleIcon: {
    marginTop: 2,
    zIndex: 1,
  },
  moduleTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: '#FFFFFF',
    zIndex: 1,
  },
});

import React, {useEffect, useState} from 'react';
import {
  Image,
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {WIDTH} from '../../theme/units';
import {colors} from '../../theme/colors';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {getImagePath} from '../../Service/axios';
import {
  asyncGetAllMyChildren,
  asyncGetUserProfile,
  asyncSignOut,
} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {
  selectChildren,
  selectSelectedChild,
  setSelectedChild,
} from '../../Stores/slices/class.slice';
import profile_icon from '../../Assets/images/profile_bg.png';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;
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
    screen: routes.screens.activityScreen,
  },
  {
    key: 'notices',
    title: 'Notices',
    icon: 'notifications-outline',
    bg: LOGO.orange.bg,
    blob: LOGO.orange.blob,
    screen: routes.screens.schoolAlbums,
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

const FOOTER_TABS = [
  {
    key: 'home',
    label: 'Home',
    screen: null,
  },
  {
    key: 'children',
    label: 'Children',
    screen: routes.screens.profile,
  },
  {
    key: 'apps',
    fab: true,
    screen: routes.screens.activityScreen,
  },
  {
    key: 'calendar',
    label: 'Calendar',
    screen: routes.screens.timeTable,
  },
  {
    key: 'more',
    label: 'More',
    screen: routes.screens.settings,
  },
];

function OutlineApps({size = 20, color = '#FFFFFF'}) {
  const gap = 4;
  const stroke = 1.8;
  const cell = (size - gap) / 2;
  const box = {
    width: cell,
    height: cell,
    borderRadius: 2.5,
    borderWidth: stroke,
    borderColor: color,
    backgroundColor: 'transparent',
  };
  return (
    <View style={{width: size, height: size, justifyContent: 'space-between'}}>
      <View style={styles.appsRow}>
        <View style={box} />
        <View style={box} />
      </View>
      <View style={styles.appsRow}>
        <View style={box} />
        <View style={box} />
      </View>
    </View>
  );
}

function TabGlyph({name, selected}) {
  const color = selected ? PRIMARY : MUTED;
  const iconProps = {
    size: 22,
    color,
    allowFontScaling: false,
  };
  if (name === 'home') {
    return <Feather name="home" {...iconProps} />;
  }
  if (name === 'children') {
    return <Feather name="users" {...iconProps} />;
  }
  if (name === 'calendar') {
    return <Feather name="calendar" {...iconProps} />;
  }
  return <Feather name="more-horizontal" {...iconProps} />;
}

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

function academicYearLabel() {
  const now = moment();
  const start = now.month() >= 6 ? now.year() : now.year() - 1;
  return `${start} – ${String(start + 1).slice(-2)}`;
}

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
    return `${name} (Grade ${grade})`;
  }
  return name || (grade ? `Grade ${grade}` : '');
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const userProfile = useAppSelector(selectUserProfile);
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const [childPicker, setChildPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const parentFirst =
    userProfile?.fatherFirstName || userProfile?.firstName || 'there';

  useEffect(() => {
    dispatch(asyncGetUserProfile());
    dispatch(asyncGetAllMyChildren());
  }, [dispatch]);

  const childPhoto = selectedChild?.image
    ? {uri: getImagePath(selectedChild.image)}
    : profile_icon;
  const parentPhoto =
    userProfile?.fatherImage || userProfile?.image
      ? {uri: getImagePath(userProfile.fatherImage || userProfile.image)}
      : null;

  const classMeta = classroomLabel(selectedChild?.classroom);
  const teacher = teacherName(selectedChild?.classroom);
  const childFullName = selectedChild
    ? `${selectedChild.firstName || ''} ${selectedChild.lastName || ''}`.trim()
    : 'No child linked';

  const go = screen => navigation.navigate(screen);

  const switchChild = child => {
    dispatch(setSelectedChild(child));
    setChildPicker(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: Math.max(insets.top, 12) + 6, paddingBottom: 118 + insets.bottom},
        ]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.8}>
            <Ionicons name="menu" size={20} color={NAVY} />
          </TouchableOpacity>
          <View style={styles.helloWrap}>
            <Text style={styles.hello}>
              {greetingWord()}, {parentFirst}
            </Text>
            <Text style={styles.helloSub}>Here’s what’s happening with</Text>
          </View>
          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnGap]}
            onPress={() => go(routes.screens.schoolAlbums)}
            activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color={NAVY} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnGap]}
            onPress={() => go(routes.screens.profile)}
            activeOpacity={0.8}>
            {parentPhoto ? (
              <Image source={parentPhoto} style={styles.headerAvatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={22} color={NAVY} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.studentRow}>
          <TouchableOpacity
            style={styles.studentCard}
            onPress={() => children.length > 1 && setChildPicker(true)}
            activeOpacity={children.length > 1 ? 0.8 : 1}>
            <View style={styles.photoWrap}>
              <Image source={childPhoto} style={styles.studentPhoto} />
              {selectedChild?.checkIn ? <View style={styles.onlineDot} /> : null}
            </View>
            <View style={styles.studentCopy}>
              <View style={styles.nameRow}>
                <Text style={styles.studentName} numberOfLines={1}>
                  {childFullName}
                </Text>
                {children.length > 1 ? (
                  <Ionicons name="chevron-down" size={16} color={NAVY} />
                ) : null}
              </View>
              {classMeta ? (
                <View style={styles.classPill}>
                  <View style={styles.classDot} />
                  <Text style={styles.classPillText}>{classMeta}</Text>
                </View>
              ) : (
                <Text style={styles.teacherText}>Link a child to get started</Text>
              )}
              {teacher ? (
                <Text style={styles.teacherText}>Teacher: {teacher}</Text>
              ) : null}
            </View>
          </TouchableOpacity>

          <View style={styles.yearCard}>
            <View style={styles.yearIcon}>
              <Ionicons name="calendar" size={16} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.yearLabel}>Academic Year</Text>
              <Text style={styles.yearValue}>
                {selectedChild?.term || academicYearLabel()}
              </Text>
            </View>
          </View>
        </View>

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
      </ScrollView>

      <View style={[styles.tabBar, {paddingBottom: Math.max(insets.bottom, 10)}]}>
        {FOOTER_TABS.map(tab => {
          const selected = tab.key === 'home';
          if (tab.fab) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                activeOpacity={0.85}
                onPress={() => go(tab.screen)}>
                <View style={styles.fab}>
                  <OutlineApps size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={selected ? 1 : 0.8}
              onPress={tab.screen ? () => go(tab.screen) : undefined}>
              <TabGlyph name={tab.key} selected={selected} />
              <Text
                style={[styles.tabLabel, selected && styles.tabLabelActive]}
                allowFontScaling={false}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={childPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setChildPicker(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setChildPicker(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Switch child</Text>
            {children.map(child => (
              <TouchableOpacity
                key={child._id}
                style={styles.childRow}
                onPress={() => switchChild(child)}>
                <Image
                  source={
                    child.image
                      ? {uri: getImagePath(child.image)}
                      : profile_icon
                  }
                  style={styles.childRowPhoto}
                />
                <Text style={styles.childRowName}>
                  {`${child.firstName || ''} ${child.lastName || ''}`.trim()}
                </Text>
                {selectedChild?._id === child._id ? (
                  <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Menu</Text>
            {[
              {label: 'My profile', icon: 'person-outline', screen: routes.screens.profile},
              {label: 'Settings', icon: 'settings-outline', screen: routes.screens.settings},
              {label: 'Link child', icon: 'person-add-outline', screen: routes.screens.addChild},
            ].map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuRow}
                onPress={() => {
                  setMenuOpen(false);
                  go(item.screen);
                }}>
                <Ionicons name={item.icon} size={18} color={NAVY} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                setMenuOpen(false);
                dispatch(asyncSignOut());
              }}>
              <Ionicons name="log-out-outline" size={18} color="#E11D48" />
              <Text style={[styles.menuLabel, {color: '#E11D48'}]}>Logout</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scroll: {
    paddingHorizontal: GRID_PAD,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnGap: {
    marginLeft: 8,
  },
  helloWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  hello: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 20,
    color: NAVY,
  },
  helloSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  headerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
    gap: 10,
  },
  studentCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  studentPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  photoWrap: {
    width: 52,
    height: 52,
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  studentCopy: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studentName: {
    flexShrink: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  classPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  classDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  classPillText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: '#3B6BFF',
  },
  teacherText: {
    marginTop: 5,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  yearCard: {
    width: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  yearIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  yearLabel: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 11,
    color: MUTED,
  },
  yearValue: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: NAVY,
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
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 6,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#0F1F4B',
        shadowOffset: {width: 0, height: -6},
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {elevation: 16},
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    includeFontPadding: false,
    fontFamily: fonts.euclidCircularA.medium,
    color: MUTED,
  },
  tabLabelActive: {
    color: PRIMARY,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  sheetTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: NAVY,
    marginBottom: 12,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  childRowPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  childRowName: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
});

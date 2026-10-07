import React, {useCallback, useEffect, useState} from 'react';
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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {WIDTH} from '../../theme/units';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {getImagePath} from '../../Service/axios';
import {
  asyncGetAllMyChildren,
  asyncGetUserProfile,
} from '../../Stores/actions/user.action';
import {asyncGetAppModules} from '../../Stores/actions/modules.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {selectModules} from '../../Stores/slices/modules.slice';
import {
  selectChildren,
  selectSelectedChild,
  setSelectedChild,
} from '../../Stores/slices/class.slice';
import {selectUnreadNoticeCount} from '../../Stores/slices/notification.slice';
import profile_icon from '../../Assets/images/profile_bg.png';
import ChildSwitcher from '../../Components/ChildSwitcher';
import AdSlider from '../../Components/AdSlider';
import {BAR_H} from '../../Components/AppFooter/shape';
import {attendanceDotColor, attendanceStatusLabel} from '../DailyAttendance/status';
import {schoolGreeting} from '../../Utils/schoolTime';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const GRID_GAP = 12;
const GRID_PAD = 18;
const CARD_W = (WIDTH - GRID_PAD * 2 - GRID_GAP) / 2;
const CARD_FULL_W = WIDTH - GRID_PAD * 2 - GRID_GAP;

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
    key: 'diary',
    title: 'Diary',
    icon: 'book-outline',
    bg: LOGO.yellow.bg,
    blob: LOGO.yellow.blob,
    screen: routes.screens.diaryHomework,
    needsChild: true,
  },
  {
    key: 'timetable',
    title: 'Timetable',
    icon: 'time-outline',
    bg: LOGO.blue.bg,
    blob: LOGO.blue.blob,
    screen: routes.screens.timeTable,
    needsChild: true,
  },
  {
    key: 'calendar',
    title: 'Calendar',
    icon: 'calendar-outline',
    bg: LOGO.green.bg,
    blob: LOGO.green.blob,
    screen: routes.screens.schoolCalendar,
  },
  {
    key: 'leave',
    title: 'Leaves',
    icon: 'calendar-outline',
    bg: LOGO.pink.bg,
    blob: LOGO.pink.blob,
    screen: routes.screens.leaveApplication,
    needsChild: true,
  },
  {
    key: 'fees',
    title: 'Fees',
    icon: 'wallet-outline',
    bg: LOGO.red.bg,
    blob: LOGO.red.blob,
    screen: routes.screens.feesDue,
    needsChild: true,
    module: 'fees',
  },
  {
    key: 'results',
    title: 'Results',
    icon: 'ribbon-outline',
    bg: LOGO.purple.bg,
    blob: LOGO.purple.blob,
    screen: routes.screens.result,
    needsChild: true,
    module: 'results',
  },
  {
    key: 'tests',
    title: 'Tests',
    icon: 'clipboard-outline',
    bg: LOGO.orange.bg,
    blob: LOGO.orange.blob,
    screen: routes.screens.assessments,
    needsChild: true,
    module: 'assessments',
  },
  {
    key: 'notices',
    title: 'Notices',
    icon: 'megaphone-outline',
    bg: LOGO.orange.bg,
    blob: LOGO.orange.blob,
    screen: routes.screens.notices,
  },
];

function useSchoolGreeting() {
  const [greeting, setGreeting] = useState(schoolGreeting);
  useFocusEffect(
    useCallback(() => {
      setGreeting(schoolGreeting());
      const timer = setInterval(() => setGreeting(schoolGreeting()), 60 * 1000);
      return () => clearInterval(timer);
    }, []),
  );
  return greeting;
}

function className(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  return classroom.classroomName || classroom.classroomId || '';
}

function gradeLabel(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  const grade = classroom.classroomGrade;
  return grade ? `Grade ${grade}` : '';
}

function attendanceCardCopy(child) {
  if (!child) {
    return {title: 'Today', detail: ''};
  }
  if (child.todayStatus === 'LATE') {
    return {title: 'Late', detail: ''};
  }
  const full = attendanceStatusLabel(child);
  const [title, detail] = full.split(' · ');
  return {title, detail: detail || ''};
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const userProfile = useAppSelector(selectUserProfile);
  const modules = useAppSelector(selectModules);
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const unreadNotices = useAppSelector(selectUnreadNoticeCount);

  const greeting = useSchoolGreeting();
  const parentFirst =
    userProfile?.fatherFirstName || userProfile?.firstName || 'there';
  const child = selectedChild || children[0];
  const hasChildren = children.length > 0;
  const visibleModules = MODULES.filter(
    item => !item.module || modules[item.module] !== false,
  );

  useEffect(() => {
    dispatch(asyncGetUserProfile());
    dispatch(asyncGetAppModules());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(asyncGetAllMyChildren({ silent: true }));
    }, [dispatch]),
  );

  useEffect(() => {
    if (!children.some(item => item.todayPrompt === 'CHECKIN')) {
      return;
    }
    navigation.navigate(routes.screens.dailyAttendance);
  }, [children, navigation]);

  const childPhoto = child?.image
    ? {uri: getImagePath(child.image)}
    : profile_icon;
  const classMeta = className(child?.classroom);
  const grade = gradeLabel(child?.classroom);
  const childFullName = child
    ? `${child.firstName || ''} ${child.lastName || ''}`.trim()
    : '';
  const attendance = attendanceCardCopy(hasChildren ? child : null);

  const go = screen => navigation.navigate(screen);

  const openModule = item => {
    if (item.needsChild && !child?._id) {
      go(routes.screens.addChild);
      return;
    }
    go(item.screen);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View
        style={[
          styles.topRow,
          {paddingTop: Math.max(insets.top, 10) + 6},
        ]}>
        <View style={styles.helloWrap}>
          <Text style={styles.hello} numberOfLines={2}>
            {greeting}, Mr & Mrs {parentFirst}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{
          paddingBottom: BAR_H + insets.bottom + 12,
        }}>
        <View style={styles.blueCardShadow}>
          <LinearGradient
            colors={['#0A3F84', '#1565C0', '#1E88E5']}
            locations={[0, 0.55, 1]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.blueCard}>
            <View style={styles.blueCardInner}>
              <TouchableOpacity
                style={styles.studentMain}
                onPress={() => {
                  if (!hasChildren) {
                    go(routes.screens.addChild);
                    return;
                  }
                  go(routes.screens.children);
                }}
                activeOpacity={0.9}>
                <View style={styles.photoWrap}>
                  <Image source={childPhoto} style={styles.studentPhoto} />
                  <View
                    style={[
                      styles.onlineDot,
                      {backgroundColor: attendanceDotColor(child)},
                    ]}
                  />
                </View>
                <View style={styles.studentCopy}>
                  <Text style={styles.cardKicker}>
                    {hasChildren ? 'Student' : 'Get started'}
                  </Text>
                  <Text
                    style={styles.studentName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}>
                    {hasChildren ? childFullName : 'No child linked'}
                  </Text>
                  {hasChildren && (classMeta || grade) ? (
                    <View style={styles.classPill}>
                      <Ionicons
                        name="school-outline"
                        size={11}
                        color="#BFDBFE"
                      />
                      <Text style={styles.classPillText} numberOfLines={1}>
                        {classMeta &&
                        grade &&
                        !classMeta
                          .toLowerCase()
                          .includes(String(grade).toLowerCase())
                          ? `${classMeta} · ${grade}`
                          : classMeta || grade}
                      </Text>
                    </View>
                  ) : null}
                  {!hasChildren ? (
                    <Text style={styles.metaText} numberOfLines={2}>
                      Tap to link a child
                    </Text>
                  ) : null}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.55)"
                  style={styles.studentChevron}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.todayPanel}
                activeOpacity={0.85}
                onPress={() => {
                  if (!hasChildren) {
                    go(routes.screens.addChild);
                    return;
                  }
                  if (
                    child?.todayPrompt ||
                    child?.canLeave ||
                    child?.earlyPickup
                  ) {
                    navigation.navigate(routes.screens.dailyAttendance, {
                      optional: !child.todayPrompt,
                    });
                    return;
                  }
                  go(routes.screens.attendanceLog);
                }}>
                <View style={styles.todayTop}>
                  <View
                    style={[
                      styles.todayDot,
                      {backgroundColor: attendanceDotColor(child)},
                    ]}
                  />
                  <Text style={styles.yearLabel}>Today</Text>
                </View>
                <Text
                  style={styles.yearValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}>
                  {attendance.title}
                </Text>
                {attendance.detail ? (
                  <Text
                    style={styles.yearTime}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}>
                    {attendance.detail}
                  </Text>
                ) : (
                  <Text style={styles.yearHint} numberOfLines={1}>
                    Attendance
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

          {modules.ads !== false ? <AdSlider /> : null}

          <View style={styles.gridWrap}>
            <View style={styles.grid}>
              {visibleModules.map((item, index) => {
                const aloneOnLastRow =
                  visibleModules.length % 2 === 1 &&
                  index === visibleModules.length - 1;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.moduleWrap,
                      aloneOnLastRow && styles.moduleWrapFull,
                    ]}
                    onPress={() => openModule(item)}
                    activeOpacity={0.9}>
                    <View style={[styles.module, {backgroundColor: item.bg}]}>
                      <View
                        style={[styles.blob, {backgroundColor: item.blob}]}>
                        <Feather
                          name="arrow-up-right"
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                      {item.key === 'notices' && unreadNotices > 0 ? (
                        <View style={styles.moduleBadge}>
                          <Text style={styles.moduleBadgeText}>
                            {unreadNotices > 9 ? '9+' : unreadNotices}
                          </Text>
                        </View>
                      ) : null}
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color="#FFFFFF"
                        style={styles.moduleIcon}
                      />
                      <Text style={styles.moduleTitle}>{item.title}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
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
    marginBottom: 16,
  },
  helloWrap: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  hello: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: NAVY,
  },
  helloSub: {
    marginTop: 3,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 17,
    color: MUTED,
  },
  blueCardShadow: {
    marginHorizontal: GRID_PAD,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#035392',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.28,
        shadowRadius: 20,
      },
      android: {elevation: 8},
    }),
  },
  blueCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blueCardInner: {
    minHeight: 104,
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  studentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  photoWrap: {
    width: 60,
    height: 60,
  },
  studentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#0A3F84',
  },
  onlineDotOff: {
    backgroundColor: '#94A3B8',
  },
  studentCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
    justifyContent: 'center',
  },
  cardKicker: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.68)',
    marginBottom: 2,
  },
  studentName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  studentChevron: {
    marginLeft: 2,
  },
  classPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  classPillText: {
    flexShrink: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: '#E8F2FF',
  },
  metaText: {
    marginTop: 5,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  todayPanel: {
    flexShrink: 0,
    width: Platform.OS === 'ios' ? 98 : 92,
    minHeight: 84,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  todayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  todayDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  yearLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
  },
  yearValue: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.2,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },
  yearTime: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    width: '100%',
  },
  yearHint: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  gridWrap: {
    paddingHorizontal: GRID_PAD,
    paddingTop: 18,
    paddingBottom: 4,
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
  moduleWrapFull: {
    width: CARD_FULL_W,
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
  moduleBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  moduleBadgeText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 10,
    color: '#FFFFFF',
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

import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  StatusBar,
  Image,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { vh, vw } from '../../theme/units';
import main_bg_img from '../../Assets/images/animated_bg.png';
import GlroyBold from '../../Components/GlroyBoldText';
import profile_icon from '../../Assets/images/profile_bg.png';
import { colors } from '../../theme/colors';
import UserProfileCircle from '../../Components/ProfileCircle';
import { featureIcons } from '../../Assets';
import { useNavigation } from '@react-navigation/native';
import routes from '../../Navigation/routes';
import { useDispatch } from 'react-redux';
import {
  asyncSignOut,
  asyncGetUserProfile,
  asyncGetAllMyChildren,
} from '../../Stores/actions/user.action';
import { useAppSelector } from '../../Stores/hooks';
import { selectUserProfile } from '../../Stores/slices/user.slice';
import {
  selectChildren,
  selectSelectedChild,
  setSelectedChild,
} from '../../Stores/slices/class.slice';
import DropDown from '../../Components/DropDown';

const PRIMARY = colors.theme.primary;
const PRIMARY_SOFT = 'rgba(3, 83, 146, 0.12)';
const BORDER_SUBTLE = 'rgba(3, 83, 146, 0.09)';

const menuItems = [
  { id: 1, title: 'Today’s Activities' },
  { id: 2, title: 'Attendance' },
  { id: 3, title: 'Diary / Chat' },
  { id: 4, title: 'Timetable' },
  { id: 5, title: 'Leave Request' },
  { id: 6, title: 'Notices' },
  { id: 7, title: 'Account & Settings' },
];

const iconAccentTints = [
  PRIMARY_SOFT,
  'rgba(102, 136, 202, 0.2)',
  'rgba(3, 83, 146, 0.08)',
  'rgba(1, 193, 144, 0.12)',
  'rgba(3, 83, 146, 0.15)',
  'rgba(102, 136, 202, 0.14)',
  'rgba(2, 41, 59, 0.08)',
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const userProfile = useAppSelector(selectUserProfile);
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const [open, setOpen] = useState(false);

  const [profile, setProfile] = useState({
    name:
      `${userProfile?.fatherFirstName || userProfile?.firstName || ''} ${userProfile?.fatherLastName || userProfile?.lastName || ''}`.trim() ||
      'User',
    year: '2023 - 2024',
    photo: '',
  });

  React.useEffect(() => {
    dispatch(asyncGetUserProfile());
    dispatch(asyncGetAllMyChildren());
  }, [dispatch]);

  React.useEffect(() => {
    if (selectedChild) {
      setProfile({
        name: `${selectedChild.firstName} ${selectedChild.lastName}`.trim() || 'Child',
        year: '2023 - 2024',
        photo: selectedChild.image,
      });
    } else if (userProfile) {
      setProfile({
        name:
          `${userProfile?.fatherFirstName || userProfile?.firstName || ''} ${userProfile?.fatherLastName || userProfile?.lastName || ''}`.trim() ||
          'User',
        year: '2023 - 2024',
        photo: userProfile?.image,
      });
    }
  }, [userProfile, selectedChild]);

  const childrenList =
    children?.map(child => ({
      label: `${child.firstName} ${child.lastName}`,
      value: child._id,
      icon: () => (
        <Image
          source={child.image ? { uri: child.image } : profile_icon}
          style={styles.childListAvatar}
        />
      ),
      child: child,
    })) || [];

  const handleNavigate = (value, id) => {
    if (id === 7) navigation.navigate(routes.screens.settings);
    else if (id === 1) navigation.navigate(routes.screens.activityScreen);
    else if (id === 4) navigation.navigate(routes.screens.timeTable);
    else if (id === 2) navigation.navigate(routes.screens.attendanceLog);
    else if (id === 3) navigation.navigate(routes.screens.attendanceLog);
    else if (id === 5) navigation.navigate(routes.screens.leaveApplication);
    else if (id === 6) navigation.navigate(routes.screens.schoolAlbums);
    else if (value === 'Logout') {
      dispatch(asyncSignOut());
    }
  };

  const renderItem = ({ item, index }) => {
    const isLastThree = index >= menuItems.length - 3;
    const iconSource =
      item.id === 1
        ? featureIcons.activity
        : item.id === 2
          ? featureIcons.attendance
          : item.id === 3
            ? featureIcons.ask_doubts
            : item.id === 4
              ? featureIcons.time_table
              : item.id === 5
                ? featureIcons.leave_application
                : item.id === 6
                  ? featureIcons.events
                  : item.id === 7
                    ? featureIcons.profile
                    : featureIcons.profile;

    return (
      <TouchableOpacity
        style={[isLastThree ? styles.smallCard : styles.card, styles.cardElevated]}
        onPress={() => handleNavigate(item.title, item.id)}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityLabel={item.title}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: iconAccentTints[index] || iconAccentTints[0] },
          ]}>
          <View style={styles.iconContainer}>
            <Image source={iconSource} style={styles.featureIcons} />
          </View>
        </View>
        <View style={styles.textContainer}>
          <GlroyBold
            text={item.title}
            numberOfLines={2}
            _style={[
              styles.cardText,
              { fontSize: isLastThree ? 11.5 : 13.5, letterSpacing: 0.15 },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEyebrow}>Portal</Text>
      <Text style={styles.sectionTitle}>Quick access</Text>
      <Text style={styles.sectionSubtitle}>
        Everything you need for your child in one place.
      </Text>
    </View>
  );

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.screen}>
        <ImageBackground
          source={main_bg_img}
          style={styles.bg_img}
          resizeMode="cover">
          <LinearGradient
            colors={['rgba(2, 35, 55, 0.45)', 'rgba(3, 83, 146, 0.9)', PRIMARY]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View
            style={[
              styles.heroContent,
              { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 12 : 8) + 8 },
            ]}>
            <View style={styles.profileRow}>
              <View style={styles.profileImageWrapper}>
                <UserProfileCircle
                  profileUri={profile.photo || profile_icon}
                  disabled={true}
                  _style={styles.profilePhoto}
                />
              </View>
              <View style={styles.profileTextContainer}>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <GlroyBold text={profile.name} _style={styles.profile_name_text} />
              </View>
            </View>

            {children?.length > 1 && (
              <View style={[styles.dropdownWrapper, { zIndex: 5000 }]}>
                <Text style={styles.dropdownFieldLabel}>Active student</Text>
                <DropDown
                  label="Switch Child"
                  open={open}
                  setOpen={setOpen}
                  value={selectedChild?._id}
                  onSelectItem={item => {
                    if (item && item.child) {
                      dispatch(setSelectedChild(item.child));
                    }
                  }}
                  list={childrenList}
                  placeholder="Select child"
                  mainContainer_style={styles.dropdownContainer}
                  placeholderStyle={styles.dropdownPlaceholder}
                  labelStyle={styles.dropdownLabel}
                  dropDownContainerStyle={styles.dropdownMenuContainer}
                  listMode="SCROLLVIEW"
                  noTitle
                  zIndex={5000}
                  customLabelStyle={styles.dropdownValueText}
                />
              </View>
            )}
          </View>
        </ImageBackground>

        <FlatList
          data={menuItems}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.flatListContainer}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF1F6',
  },
  bg_img: {
    height: vh * 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileImageWrapper: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 36,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  profilePhoto: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  profileTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Glory-Medium',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  profile_name_text: {
    fontSize: 22,
    color: colors.theme.white,
    letterSpacing: 0.2,
  },
  dropdownWrapper: {
    marginTop: 18,
    width: '100%',
    alignSelf: 'stretch',
  },
  dropdownFieldLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Glory-Medium',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  dropdownContainer: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderRadius: 14,
  },
  dropdownPlaceholder: {
    color: colors.text.greyAlt2,
    fontSize: 15,
    fontFamily: 'Glory-Medium',
  },
  dropdownLabel: {
    color: colors.text.dimBlack,
    fontSize: 15,
    fontFamily: 'Glory-Medium',
  },
  dropdownValueText: {
    color: colors.text.dimBlack,
  },
  dropdownMenuContainer: {
    backgroundColor: colors.theme.white,
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    elevation: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  childListAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  sectionHeader: {
    width: '100%',
    paddingHorizontal: 14,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionEyebrow: {
    fontSize: 11,
    color: PRIMARY,
    fontFamily: 'Glory-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 22,
    color: colors.text.primary,
    fontFamily: 'Glory-Bold',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.greyAlt2,
    lineHeight: 20,
    fontFamily: 'Glory-Medium',
    maxWidth: 320,
  },
  card: {
    margin: 6,
    backgroundColor: colors.theme.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: vh * 16.2,
    width: vw * 42,
    borderRadius: 18,
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
  },
  smallCard: {
    margin: 5,
    backgroundColor: colors.theme.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: vh * 14.2,
    width: vw * 28,
    borderRadius: 16,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
  },
  cardElevated: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  iconContainer: {
    height: 30,
    width: 30,
  },
  featureIcons: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  textContainer: {
    width: '100%',
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingBottom: 2,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardText: {
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  flatListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingBottom: 36,
    paddingTop: 8,
  },
  flatList: {
    flex: 1,
    marginTop: -(vh * 3.2),
    zIndex: 2,
  },
});

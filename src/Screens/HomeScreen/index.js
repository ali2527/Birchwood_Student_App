import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  StatusBar,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { vh, vw } from '../../theme/units';
import main_bg_img from '../../Assets/images/animated_bg.png';
import GlroyBold from '../../Components/GlroyBoldText';
import profile_icon from '../../Assets/images/profile_bg.png';
import { colors } from '../../theme/colors';
import UserProfileCircle from '../../Components/ProfileCircle';
import student from '../../Assets/icons/student.png';
import { appShadow } from '../../theme/colors';
import { featureIcons } from '../../Assets';
import { icons } from '../../Assets/icons';
import GrayMediumText from '../../Components/GrayMediumText';
import { useNavigation } from '@react-navigation/native';
import routes from '../../Navigation/routes';
import { useDispatch } from 'react-redux';
import { asyncSignOut, asyncGetUserProfile } from '../../Stores/actions/user.action';

import { useAppSelector } from '../../Stores/hooks';
import { selectUserProfile } from '../../Stores/slices/user.slice';
import { selectChildren, selectSelectedChild, setSelectedChild } from '../../Stores/slices/class.slice';
import { spacing } from '../../theme/styles';
import DropDown from '../../Components/DropDown';
import { asyncGetAllMyChildren } from '../../Stores/actions/user.action';

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch()
  const userProfile = useAppSelector(selectUserProfile);
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const [open, setOpen] = useState(false);
  console.log("selectedChild", selectedChild)
  console.log("userProfile", userProfile)
  console.log("children", children)

  const [profile, setProfile] = useState({
    name: `${userProfile?.fatherFirstName || userProfile?.firstName || ''} ${userProfile?.fatherLastName || userProfile?.lastName || ''}`.trim() || 'User',
    year: '2023 - 2024',
    photo: '',
  });

  // Update profile state when userProfile changes
  React.useEffect(() => {
    dispatch(asyncGetUserProfile());
    dispatch(asyncGetAllMyChildren());
  }, [dispatch]);

  // Update profile state when userProfile or selectedChild changes
  React.useEffect(() => {
    if (selectedChild) {
      setProfile({
        name: `${selectedChild.firstName} ${selectedChild.lastName}`.trim() || 'Child',
        year: '2023 - 2024',
        photo: selectedChild.image,
      });
    } else if (userProfile) {
      setProfile({
        name: `${userProfile?.fatherFirstName || userProfile?.firstName || ''} ${userProfile?.fatherLastName || userProfile?.lastName || ''}`.trim() || 'User',
        year: '2023 - 2024',
        photo: userProfile?.image,
      });
    }
  }, [userProfile, selectedChild]);

  const childrenList = children?.map(child => ({
    label: `${child.firstName} ${child.lastName}`,
    value: child._id,
    icon: () => (
      <Image
        source={child.image ? { uri: child.image } : profile_icon}
        style={{ width: 24, height: 24, borderRadius: 12 }}
      />
    ),
    child: child
  })) || [];

  // const data = [
  //   { id: 1, title: 'Profile' },
  //   { id: 2, title: 'Activity' },
  //   { id: 3, title: 'Time Table' },
  //   { id: 4, title: 'Assignment' },
  //   // { id: 5, title: 'Result' },
  //   // { id: 6, title: 'Events' },
  //   // { id: 7, title: 'Ask Doubts' },
  //   { id: 8, title: 'School Gallery' },
  //   { id: 9, title: 'Leave Application' },
  //   // { id: 10, title: 'School Holiday' },
  //   { id: 11, title: 'Logout' },
  //   { id: 12, title: 'Change Password' },
  // ];


  const data = [{
    id: 1,
    title: 'Today’s Activities'
  },

  {
    id: 2,
    title: 'Attendance'
  },
  {
    id: 3,
    title: 'Diary / Chat'
  },
  {
    id: 4,
    title: 'Timetable'
  },
  {
    id: 5,
    title: 'Leave Request'
  },
  {
    id: 6,
    title: 'Notices'
  },
  {
    id: 7,
    title: 'Account & Settings'
  },



  ]
  const handleNavigate = (value, id) => {
    console.log('Valueee >>>>', value, id);
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

  // const data = Array.from({ length: 10 }, (_, index) => ({ id: index.toString(), title: `item${index + 1}` }));

  const renderItem = ({ item, index }) => {
    const isLastThree = index >= data.length - 3;

    // Define unique background colors for icon wrappers
    const iconBgColors = [
      '#E8F5E9', // Activities - Greenish
      '#FFF3E0', // Attendance - Orange
      '#E3F2FD', // Diary - Blue
      '#F3E5F5', // Timetable - Purple
      '#FFEBEE', // Leave - Red
      '#E0F2F1', // Notices - Teal
      '#F1F8E9', // Profile - Light Green
    ];

    return (
      <TouchableOpacity
        style={[isLastThree ? styles.smallCard : styles.card, styles.shadow]}
        onPress={() => handleNavigate(item.title, item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColors[index] || iconBgColors[0] }]}>
          <View style={styles.iconContainer}>
            <Image
              source={
                item.id === 1 ? featureIcons.activity :
                  item.id === 2 ? featureIcons.attendance :
                    item.id === 3 ? featureIcons.ask_doubts :
                      item.id === 4 ? featureIcons.time_table :
                        item.id === 5 ? featureIcons.leave_application :
                          item.id === 6 ? featureIcons.events :
                            item.id === 7 ? featureIcons.profile :
                              featureIcons.profile
              }
              style={styles.featureIcons}
            />
          </View>
        </View>
        <View style={styles.textContainer}>
          <GlroyBold
            text={item.title}
            numberOfLines={2}
            _style={[
              styles.cardText,
              { fontSize: isLastThree ? 11 : 13 }
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const headerCards = () => {
    return (
      <View style={styles.twoCardsTopContainer}>
        <TouchableOpacity
          style={[styles.twoCardsTop, { marginRight: 10 }]}
          onPress={() => handleNavigate('Attendance')}>
          <View
            style={[
              styles.cardInnerView,
              { backgroundColor: colors.theme.yellow0 },
            ]}>
            <Image source={icons.usr} style={styles.topCardIcon} />
          </View>
          <GlroyBold
            text={'80.39%'}
            _style={{ fontSize: 20, color: colors.text.black, marginVertical: 3 }}
          />
          <GrayMediumText text={'Attendance'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.twoCardsTop, { marginLeft: 10 }]}
          onPress={() => handleNavigate('Fees Due')}>
          <View
            style={[
              styles.cardInnerView,
              { backgroundColor: colors.theme.pink0 },
            ]}>
            <Image source={icons.dollar} style={styles.topCardIcon} />
          </View>
          <GlroyBold
            text={'$00.00'}
            _style={{ fontSize: 20, color: colors.text.black, marginVertical: 3 }}
          />
          <GrayMediumText text={'Fees Due'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>

        <ImageBackground
          source={main_bg_img}
          style={[styles.bg_img]}
          resizeMode="cover">
          <View style={styles.profile_container}>
            <View style={{ flex: 1 }}>
              <View style={styles.profile_container_inner}>
                <View style={styles.profileImageWrapper}>
                  <UserProfileCircle
                    profileUri={profile.photo || profile_icon}
                    disabled={true}
                    _style={styles.profilePhoto}
                  />
                </View>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <GlroyBold
                    text={profile.name}
                    _style={styles.profile_name_text}
                  />
                </View>
              </View>

              {children?.length > 1 && (
                <View style={[styles.dropdownWrapper, { zIndex: 5000 }]}>
                  <DropDown
                    label="Switch Child"
                    open={open}
                    setOpen={setOpen}
                    value={selectedChild?._id}
                    onSelectItem={(item) => {
                      if (item && item.child) {
                        dispatch(setSelectedChild(item.child));
                      }
                    }}
                    list={childrenList}
                    placeholder="Switch Child"
                    mainContainer_style={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    labelStyle={styles.dropdownLabel}
                    dropDownContainerStyle={styles.dropdownMenuContainer}
                    listMode="SCROLLVIEW"
                    noTitle
                    zIndex={5000}
                    customLabelStyle={{ color: colors.theme.white }}
                  />
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
        {/* <View style={styles.borderLine}/> */}
        <FlatList
          key={'mixed-layout'}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          // ListHeaderComponent={headerCards}
          contentContainerStyle={styles.flatListContainer}
          style={styles.flatList}
        />
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  bg_img: {
    height: vh * 30,
    position: 'relative',
    // overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topCardIcon: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
  },
  iconContainer: {
    height: 32,
    width: 32,
  },
  featureIcons: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  twoCardsTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInnerView: {
    margin: 15,
    height: 70,
    width: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoCardsTop: {
    ...appShadow,
    borderRadius: 10,
    height: vh * 23,
    width: vw * 38,
    marginBottom: 12,
    alignItems: 'center',
  },

  profile_name_text: {
    fontSize: 20,
    color: colors.theme.white,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.theme.white,
    opacity: 0.8,
    fontFamily: 'Glory-Medium',
  },
  profileTextContainer: {
    marginLeft: 4,
  },
  profileImageWrapper: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 50,
    padding: 2,
  },
  profile_container: {
    marginTop: vh * 7,
    marginHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  card: {
    margin: 7,
    backgroundColor: colors.theme.white,
    alignItems: 'center',
    height: vh * 16.5,
    width: vw * 42,
    borderRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 8,
  },
  smallCard: {
    margin: 5,
    backgroundColor: colors.theme.white,
    alignItems: 'center',
    height: vh * 14.5,
    width: vw * 28,
    borderRadius: 18,
    paddingTop: 15,
    paddingHorizontal: 4,
  },
  textContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardText: {
    color: '#1A1A1A',
    textAlign: 'center',
    paddingHorizontal: 5,
    lineHeight: 16,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  flatListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingBottom: 30,

  },
  flatList: {
    marginTop: vh * 6,
  },
  profile_container_inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  dropdownWrapper: {
    marginTop: 15,
    width: vw * 80,
    alignSelf: 'center',
  },
  dropdownContainer: {
    height: 48,
    // backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: colors.theme.white,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
    borderRadius: 12,
  },
  dropdownPlaceholder: {
    color: colors.theme.white,
    fontSize: 15,
    fontFamily: 'Glory-Medium',
  },
  dropdownLabel: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'Glory-Medium',
  },
  dropdownMenuContainer: {
    backgroundColor: colors.theme.white,
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  }
});

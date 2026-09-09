import {StyleSheet, Text, View, ScrollView, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import {vh} from '../../theme/units';
import GlroyBold from '../../Components/GlroyBoldText';
import {colors} from '../../theme/colors';
import GrayMediumText from '../../Components/GrayMediumText';
import Ionicon from 'react-native-vector-icons/Ionicons';
import TopBar from '../../Components/TopBar';
import dp1 from '../../Assets/icons/dp1.png';
import {useNavigation} from '@react-navigation/native';
import routes from '../../Navigation/routes';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {asyncGetUserProfile} from '../../Stores/actions/user.action';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import UserProfileCircle from '../../Components/ProfileCircle';
import {getImagePath} from '../../Service/axios';

export default function Profile() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectUserProfile);

  useEffect(() => {
    dispatch(asyncGetUserProfile());
  }, [dispatch]);

  return (
    <View style={{flex: 1, backgroundColor: colors.theme.white}}>
      <TopBar>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicon
                name="chevron-back-outline"
                size={18}
                color={colors.theme.white}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.text.white,
                marginLeft: 10,
                fontWeight: 'bold',
                bottom: 1,
              }}>
              My Profile
            </Text>
          </View>
        </View>
      </TopBar>
      <ScrollView contentContainerStyle={{paddingBottom: 30}}>
        {profile?._id ? (
          <View style={styles.profileDetailsContainer}>
            <View style={styles.profileHeaderSection}>
              <View style={styles.profileImageContainer}>
                <UserProfileCircle
                  profileUri={
                    profile?.fatherImage || profile?.image
                      ? {uri: getImagePath(profile.fatherImage || profile.image)}
                      : dp1
                  }
                  disabled={true}
                  _style={styles.profileImage}
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate(routes.screens.profileForm)}
                  style={styles.editButton}>
                  <Ionicon
                    name="create-outline"
                    size={16}
                    color={colors.theme.white}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.profileHeaderContent}>
                <View style={styles.nameRow}>
                  <GlroyBold
                    text={`${
                      profile?.fatherFirstName || profile?.firstName || ''
                    } ${
                      profile?.fatherLastName || profile?.lastName || ''
                    }`.trim()}
                    _style={styles.profileName}
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              {profile?.email ? (
                <View style={[styles.infoRow, styles.infoRowSpacing]}>
                  <View style={styles.iconContainer}>
                    <Ionicon
                      name="mail-outline"
                      size={18}
                      color={colors.theme.secondary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <GrayMediumText
                      text={profile.email}
                      _style={styles.infoValue}
                    />
                  </View>
                </View>
              ) : null}

              {profile?.phone ? (
                <View style={[styles.infoRow, styles.infoRowSpacing]}>
                  <View style={styles.iconContainer}>
                    <Ionicon
                      name="call-outline"
                      size={18}
                      color={colors.theme.secondary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <GrayMediumText
                      text={profile.phone}
                      _style={styles.infoValue}
                    />
                  </View>
                </View>
              ) : null}

              {profile?.address || profile?.city || profile?.state ? (
                <View style={[styles.infoRow, styles.infoRowSpacing]}>
                  <View style={styles.iconContainer}>
                    <Ionicon
                      name="location-outline"
                      size={18}
                      color={colors.theme.secondary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <GrayMediumText
                      text={[profile?.address, profile?.city, profile?.state]
                        .filter(Boolean)
                        .join(', ')}
                      _style={styles.infoValue}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    margin: 10,
    bottom: vh * 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileDetailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  profileHeaderSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  profileHeaderContent: {
    width: '100%',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    color: colors.text.black,
  },
  editButton: {
    padding: 6,
    position: 'absolute',
    bottom: -6,
    right: 0,
    backgroundColor: colors.theme.primary,
    borderRadius: 100,
    elevation: 5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.theme.secondary,
    opacity: 0.2,
    marginBottom: 20,
  },
  infoSection: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoRowSpacing: {
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.theme.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.text.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text.black,
    lineHeight: 20,
  },
});

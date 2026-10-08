import React, {useEffect} from 'react';
import {
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
import fonts from '../../Assets/fonts';
import Portrait from '../../Components/Portrait';
import routes from '../../Navigation/routes';
import {asyncGetUserProfile} from '../../Stores/actions/user.action';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {colors} from '../../theme/colors';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

function fullName(first, last) {
  return `${first || ''} ${last || ''}`.trim() || '—';
}

function InfoRow({icon, label, value}) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={PRIMARY} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function Profile() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const profile = useAppSelector(selectUserProfile);

  useEffect(() => {
    dispatch(asyncGetUserProfile());
  }, [dispatch]);

  const address = [profile?.address, profile?.city, profile?.state]
    .filter(Boolean)
    .join(', ');

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
        <Text style={styles.headerTitle}>My profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(routes.screens.profileForm)}
          style={styles.editChip}
          activeOpacity={0.85}>
          <Ionicons name="create-outline" size={16} color={PRIMARY} />
          <Text style={styles.editChipText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.photos}>
            <View style={styles.photoCol}>
              <Portrait
                file={profile?.fatherImage || profile?.image}
                style={styles.avatar}
              />
              <Text style={styles.photoLabel}>Father</Text>
            </View>
            <View style={styles.photoCol}>
              <Portrait file={profile?.motherImage} style={styles.avatar} />
              <Text style={styles.photoLabel}>Mother</Text>
            </View>
          </View>
          <Text style={styles.heroName}>
            {fullName(profile?.fatherFirstName, profile?.fatherLastName)}
          </Text>
          <Text style={styles.heroSub}>
            {fullName(profile?.motherFirstName, profile?.motherLastName)}
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
          <InfoRow icon="call-outline" label="Phone" value={profile?.phone} />
          <InfoRow
            icon="location-outline"
            label="Address"
            value={address}
          />
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
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editChipText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 13,
    color: PRIMARY,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  photos: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 14,
  },
  photoCol: {
    alignItems: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E8EEF5',
    marginBottom: 8,
  },
  photoLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
  },
  heroName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 20,
    color: NAVY,
    textAlign: 'center',
  },
  heroSub: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF5FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCopy: {
    flex: 1,
    paddingTop: 2,
  },
  infoLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  infoValue: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    color: NAVY,
    lineHeight: 20,
  },
});

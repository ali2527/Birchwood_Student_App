import React, {useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {useAppSelector} from '../../Stores/hooks';
import {selectUnreadNotificationCount} from '../../Stores/slices/notification.slice';
import {colors} from '../../theme/colors';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

export default function Settings() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const unreadNotifications = useAppSelector(selectUnreadNotificationCount);
  const [notificationsOn, setNotificationsOn] = useState(true);

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
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>Notifications</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate(routes.screens.notifications)}
            activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={18} color={NAVY} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Notification inbox</Text>
              <Text style={styles.rowSub}>
                {unreadNotifications > 0
                  ? `${unreadNotifications} unread`
                  : 'View recent alerts'}
              </Text>
            </View>
            {unreadNotifications > 0 ? <View style={styles.rowDot} /> : null}
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons
              name={
                notificationsOn
                  ? 'notifications-outline'
                  : 'notifications-off-outline'
              }
              size={18}
              color={NAVY}
            />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Push notifications</Text>
              <Text style={styles.rowSub}>
                {notificationsOn ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              trackColor={{false: '#D1D5DB', true: PRIMARY + '40'}}
              thumbColor={notificationsOn ? PRIMARY : '#f4f3f4'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={() => setNotificationsOn(prev => !prev)}
              value={notificationsOn}
            />
          </View>
        </View>

        <Text style={styles.section}>Security</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate(routes.screens.changePassword)}
            activeOpacity={0.8}>
            <Ionicons name="lock-closed-outline" size={18} color={NAVY} />
            <Text style={styles.rowTitleFlex}>Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Children</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate(routes.screens.children)}
            activeOpacity={0.8}>
            <Ionicons name="people-outline" size={18} color={NAVY} />
            <Text style={styles.rowTitleFlex}>Manage linked children</Text>
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={18} color={NAVY} />
            <Text style={styles.rowTitleFlex}>App Version</Text>
            <Text style={styles.rowSub}>0.0.1</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.staticBlock}>
            <Text style={styles.rowTitle}>Privacy Policy</Text>
            <Text style={styles.staticCopy}>
              Birchwood collects only what is needed to run the parent app and
              keep your child’s school records up to date.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.staticBlock}>
            <Text style={styles.rowTitle}>Terms of Use</Text>
            <Text style={styles.staticCopy}>
              Use of this app is subject to Birchwood Academy school policies.
            </Text>
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
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: MUTED,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  rowTitleFlex: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  rowSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  rowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E11D48',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  staticBlock: {
    paddingVertical: 14,
  },
  staticCopy: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
  },
});

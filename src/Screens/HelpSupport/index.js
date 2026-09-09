import React from 'react';
import {
  Linking,
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
import {colors} from '../../theme/colors';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

const CONTACTS = [
  {
    key: 'email',
    icon: 'mail-outline',
    label: 'Email',
    value: 'support@birchwood.school',
    href: 'mailto:support@birchwood.school',
  },
  {
    key: 'phone',
    icon: 'call-outline',
    label: 'Phone',
    value: '+92 300 0000000',
    href: 'tel:+923000000000',
  },
];

export default function HelpSupport() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <Text style={styles.copy}>
          Need a hand with the parent app? Reach the Birchwood office using the
          contacts below.
        </Text>
        {CONTACTS.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.row}
            onPress={() => Linking.openURL(item.href)}
            activeOpacity={0.8}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={18} color={PRIMARY} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 32,
  },
  copy: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
    lineHeight: 21,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: PRIMARY + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
  },
  value: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
});

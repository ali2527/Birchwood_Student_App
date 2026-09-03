import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import fonts from '../../Assets/fonts';

const TONE = {
  success: {
    accent: '#059669',
    cardBg: '#FFFFFF',
    border: '#D1FAE5',
    iconBg: '#ECFDF5',
    icon: 'check-circle',
    iconColor: '#059669',
  },
  danger: {
    accent: '#DC2626',
    cardBg: '#FFFFFF',
    border: '#FECACA',
    iconBg: '#FEF2F2',
    icon: 'alert-circle',
    iconColor: '#DC2626',
  },
  warning: {
    accent: '#D97706',
    cardBg: '#FFFFFF',
    border: '#FDE68A',
    iconBg: '#FFFBEB',
    icon: 'alert-triangle',
    iconColor: '#D97706',
  },
  info: {
    accent: '#035392',
    cardBg: '#FFFFFF',
    border: '#BFDBFE',
    iconBg: '#EFF6FF',
    icon: 'info',
    iconColor: '#035392',
  },
  default: {
    accent: '#6B7280',
    cardBg: '#FFFFFF',
    border: '#E5E7EB',
    iconBg: '#F3F4F6',
    icon: 'bell',
    iconColor: '#4B5563',
  },
};

export default function AppAlertCard({title, description, type = 'info'}) {
  const tone = TONE[type] || TONE.info;

  return (
    <View
      collapsable={false}
      style={[
        styles.card,
        {backgroundColor: tone.cardBg, borderColor: tone.border},
      ]}>
      <View style={[styles.accent, {backgroundColor: tone.accent}]} />
      <View style={[styles.iconWrap, {backgroundColor: tone.iconBg}]}>
        <Icon name={tone.icon} size={22} color={tone.iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={4}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    paddingVertical: 14,
    paddingRight: 16,
  },
  accent: {
    width: 5,
    alignSelf: 'stretch',
    marginVertical: -14,
    marginRight: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
    paddingRight: 4,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: '#111827',
    letterSpacing: -0.2,
  },
  description: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },
});

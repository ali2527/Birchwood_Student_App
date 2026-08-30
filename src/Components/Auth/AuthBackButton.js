import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme/colors';

export default function AuthBackButton({onPress, style}) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
      onPress={onPress || (() => navigation.goBack())}
      style={[styles.btn, style]}>
      <Icon name="arrow-left" size={22} color={colors.text.dimBlack} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
});

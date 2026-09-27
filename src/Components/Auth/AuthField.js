import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import fonts from '../../Assets/fonts';
import {colors} from '../../theme/colors';
import CountryCodePicker from './CountryCodePicker';
import {
  DEFAULT_PHONE_COUNTRY,
  PLACEHOLDER_COLOR,
  getPhoneCountry,
  maskPhone,
  phonePlaceholder,
  unmaskPhone,
} from './phoneMask';

const AUTH_NAVY = '#035392';

/**
 * Clean auth field matching the mockup: label + bordered input with left icon.
 */
export default function AuthField({
  label,
  placeholder,
  value,
  onChangeText,
  leftIcon = 'mail',
  password = false,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  editable = true,
  multiline = false,
  error,
  mask,
  countryIso = DEFAULT_PHONE_COUNTRY,
  onCountryChange,
}) {
  const [secure, setSecure] = useState(password);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isPhoneMask = mask === 'phone';
  const country = getPhoneCountry(countryIso) || getPhoneCountry(DEFAULT_PHONE_COUNTRY);
  const displayValue = isPhoneMask ? maskPhone(value, country.iso) : value;

  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMulti,
          error ? styles.fieldError : null,
          !editable && styles.fieldDisabled,
        ]}>
        {!isPhoneMask && leftIcon ? (
          <Icon
            name={leftIcon}
            size={18}
            color={PLACEHOLDER_COLOR}
            style={styles.leftIcon}
          />
        ) : null}
        {isPhoneMask ? (
          <>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setPickerOpen(true)}
              hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}
              activeOpacity={0.7}>
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text style={styles.countryCode}>+{country.dial}</Text>
              <Icon name="chevron-down" size={14} color={PLACEHOLDER_COLOR} />
            </TouchableOpacity>
            <View style={styles.countryDivider} />
          </>
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.inputMulti]}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholder={
            isPhoneMask ? phonePlaceholder(country.iso) : placeholder
          }
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={displayValue}
          editable={editable}
          onChangeText={text =>
            onChangeText?.(isPhoneMask ? unmaskPhone(text, country.iso) : text)
          }
          secureTextEntry={secure}
          keyboardType={isPhoneMask ? 'phone-pad' : keyboardType}
          maxLength={isPhoneMask ? 18 : undefined}
          autoCapitalize={isPhoneMask ? 'none' : autoCapitalize ?? 'sentences'}
          autoCorrect={isPhoneMask ? false : autoCorrect ?? true}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          underlineColorAndroid="transparent"
        />
        {password ? (
          <TouchableOpacity
            onPress={() => setSecure(s => !s)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.eye}>
            <Icon
              name={secure ? 'eye' : 'eye-off'}
              size={18}
              color={PLACEHOLDER_COLOR}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {isPhoneMask ? (
        <CountryCodePicker
          visible={pickerOpen}
          selectedIso={country.iso}
          onSelect={iso => onCountryChange?.(iso)}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </View>
  );
}

export {AUTH_NAVY};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  label: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 52,
  },
  fieldError: {
    borderColor: colors.theme.lightRed,
  },
  fieldDisabled: {
    backgroundColor: '#F3F4F6',
  },
  fieldMulti: {
    height: undefined,
    minHeight: 110,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 2,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: PLACEHOLDER_COLOR,
    marginRight: 2,
  },
  countryDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  inputMulti: {
    minHeight: 84,
  },
  eye: {
    paddingLeft: 8,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: colors.theme.mehron,
    fontFamily: fonts.euclidCircularA.regular,
  },
});

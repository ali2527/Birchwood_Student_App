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
  error,
}) {
  const [secure, setSecure] = useState(password);

  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <Icon
          name={leftIcon}
          size={18}
          color="#9AA3AF"
          style={styles.leftIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#B0B7C3"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          autoCorrect={autoCorrect ?? true}
        />
        {password ? (
          <TouchableOpacity
            onPress={() => setSecure(s => !s)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.eye}>
            <Icon name={secure ? 'eye' : 'eye-off'} size={18} color="#9AA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
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
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
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

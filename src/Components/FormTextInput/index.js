import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';
import CountryCodePicker from '../Auth/CountryCodePicker';
import {
  DEFAULT_PHONE_COUNTRY,
  PLACEHOLDER_COLOR,
  getPhoneCountry,
  maskPhone,
  phonePlaceholder,
  unmaskPhone,
} from '../Auth/phoneMask';

const FormTextInput = ({ 
    label, 
    placeholder,
    value, 
    required, 
    starColor, 
    password, 
    onChangeText,
    placeholderFontSize,
    name,
    multiple,
    containerStyle,
    icon,
    mask,
    keyboardType,
    countryIso = DEFAULT_PHONE_COUNTRY,
    onCountryChange,
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(password);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isPhoneMask = mask === 'phone' || name === 'phone' || name === 'phone_number';
  const country = getPhoneCountry(countryIso);
  return (
    <View style={{...styles.mainInputContainer, ...containerStyle}}>
      
      <Text style={[styles.labelStyle]}>
        {label} {required && <Text style={{ color: starColor || 'red' }}>*</Text>}
      </Text>
      <View style={styles.inputContainer}>
        {isPhoneMask ? (
          <TouchableOpacity
            style={styles.countryBtn}
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.7}>
            <Text style={styles.countryFlag}>{country.flag}</Text>
            <Text style={styles.countryCode}>+{country.dial}</Text>
            <Feather name="chevron-down" size={14} color={PLACEHOLDER_COLOR} />
          </TouchableOpacity>
        ) : null}
        <TextInput
          placeholder={isPhoneMask ? phonePlaceholder(country.iso) : placeholder}
          style={[styles.textInputField, {fontSize: placeholderFontSize || 12}]}
          placeholderTextColor={colors.text.altGrey}
          value={isPhoneMask ? maskPhone(value, country.iso) : value}
          name={name}
          secureTextEntry={secureTextEntry}
          keyboardType={isPhoneMask ? 'phone-pad' : keyboardType}
          maxLength={isPhoneMask ? 18 : undefined}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          underlineColorAndroid="transparent"
          onChangeText={(next)=> onChangeText(name, isPhoneMask ? unmaskPhone(next, country.iso) : next)}
        />
        {icon && !isPhoneMask && (
          <View
            style={{ position: 'absolute', right: 10 }}
          >
            <Icon name={icon} size={20} color={colors.text.altGrey} />
          </View>
        )}
      </View>
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
};

export default FormTextInput;

const styles = StyleSheet.create({
    mainInputContainer:{
        flex:1,
        marginVertical: 5,
    },
    textInputField:{
        height:45,
        flex: 1,
        alignItems:'center',
        color: colors.text.altGrey
        
    },
    labelStyle:{
        fontSize:12,
        color: colors.text.altGrey
    },
    inputContainer:{
        flexDirection: 'row', 
        alignItems: 'center',
        borderBottomColor:colors.text.altGrey,
        borderBottomWidth:1.1,
        height:45
    },
    countryBtn:{
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    countryFlag:{
        fontSize: 16,
        marginRight: 4,
    },
    countryCode:{
        fontSize: 13,
        color: PLACEHOLDER_COLOR,
        marginRight: 2,
    }
})

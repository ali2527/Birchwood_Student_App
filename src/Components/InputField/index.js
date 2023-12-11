import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // You may need to install this package
import { colors } from '../../theme/colors';
import { useColorScheme } from 'react-native';
import { vh } from '../../theme/units';

const CustomTextInput = ({ 
    label, 
    placeholder,
    value, 
    required, 
    starColor, 
    password, 
    onChangeText,
    placeholderFontSize,
    name,
    multiple
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(password);
  const colorScheme = useColorScheme();
  return (
    <View style={{ marginVertical: 10 }}>
      
      <Text style={[styles.labelStyle]}>
        {label} {required && <Text style={{ color: starColor || 'red' }}>*</Text>}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder={placeholder}
          style={[styles.textInputField, {fontSize: placeholderFontSize || 12, color: 'black', height: multiple ? vh * 20 : 40}]}
          placeholderTextColor={colors.text.black}
          value={value}
          name={name}
          secureTextEntry={secureTextEntry}
          onChangeText={(value)=> onChangeText(name, value)}
        />
        {password && (
          <TouchableOpacity
            onPress={() => setSecureTextEntry((prev) => !prev)}
            style={{ position: 'absolute', right: 10 }}
          >
            <Icon name={secureTextEntry ? 'eye' : 'eye-slash'} size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
    textInputField:{
        borderWidth: 1.5,
        borderColor: colors.input.background,
        borderRadius:10,
        paddingHorizontal: 7,
        // height:40,
        flex: 1,
        backgroundColor:colors.input.background,
    },
    labelStyle:{
        marginBottom: 5,
        fontSize:12,
        fontWeight:'bold',
        color: colors.text.altGrey
    }
})
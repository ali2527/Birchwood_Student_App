import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import IonicIcon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { colors } from '../../theme/colors';
import { useColorScheme } from 'react-native';


const SampleInputField = ({ 
    label, 
    placeholder,
    value, 
    required, 
    starColor, 
    icon, 
    onChangeText,
    placeholderFontSize,
    name
}) => {

  const colorScheme = useColorScheme();
  return (
    <View style={{ marginVertical: 10 }}>
      
      <Text style={[styles.labelStyle]}>
        {label} {required && <Text style={{ color: starColor || 'red' }}>*</Text>}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
        style={styles.textInputField}
        onPress={()=> onChangeText(name, value)}
        >
            <Text style={{fontSize: placeholderFontSize || 12, color: 'black'}}>{value !== '' ? value : placeholder}</Text>
        </TouchableOpacity>
        {icon && (
            <IonicIcon name={icon} size={20} color={colors.text.altGrey} />
        )}
      </View>
    </View>
  );
};

export default SampleInputField;

const styles = StyleSheet.create({
    textInputField:{
        borderWidth: 1.5,
        borderColor: colors.input.background,
        borderRadius:10,
        paddingHorizontal: 7,
        height:50,
        flex: 1,
        backgroundColor:colors.input.background,
        justifyContent:'center',
    },
    labelStyle:{
        marginBottom: 5,
        fontSize:12,
        fontWeight:'bold',
        color: colors.text.altGrey
    }
})
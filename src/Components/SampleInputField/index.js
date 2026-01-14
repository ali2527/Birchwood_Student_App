import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import IonicIcon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { colors } from '../../theme/colors';


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
  return (
    <View style={{ marginVertical: 10 }}>
      
      <Text style={[styles.labelStyle]}>
        {label} {required && <Text style={{ color: starColor || 'red' }}>*</Text>}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder={placeholder}
          style={[styles.textInputField, {fontSize: placeholderFontSize || 12}]}
          placeholderTextColor={colors.text.altGrey}
          value={value}
          name={name}
          onChangeText={(text) => onChangeText(name, text)}
        />
        {icon && (
            <IonicIcon name={icon} size={20} color={colors.text.altGrey} style={{ marginLeft: 10 }} />
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
        color: 'black',
    },
    labelStyle:{
        marginBottom: 5,
        fontSize:12,
        fontWeight:'bold',
        color: colors.text.altGrey
    }
})
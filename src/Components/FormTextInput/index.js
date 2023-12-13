import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { colors } from '../../theme/colors';
import { useColorScheme } from 'react-native';
import { vh } from '../../theme/units';

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
    icon
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(password);
  const colorScheme = useColorScheme();
  return (
    <View style={{...styles.mainInputContainer, ...containerStyle}}>
      
      <Text style={[styles.labelStyle]}>
        {label} {required && <Text style={{ color: starColor || 'red' }}>*</Text>}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={placeholder}
          style={[styles.textInputField, {fontSize: placeholderFontSize || 12}]}
          placeholderTextColor={colors.text.altGrey}
          value={value}
          name={name}
          secureTextEntry={secureTextEntry}
          onChangeText={(value)=> onChangeText(name, value)}
        />
        {icon && (
          <View
            style={{ position: 'absolute', right: 10 }}
          >
            <Icon name={icon} size={20} color={colors.text.altGrey} />
          </View>
        )}
      </View>
    </View>
  );
};

export default FormTextInput;

const styles = StyleSheet.create({
    mainInputContainer:{
        flex:1,
        marginVertical: 5,
        // height:80
    },
    textInputField:{
        // paddingHorizontal: 7,
        height:45,
        flex: 1,
        alignItems:'center',
        // backgroundColor:'black',
        color: colors.text.altGrey
        
    },
    labelStyle:{
        // marginBottom: 5,
        fontSize:12,
       // marginLeft:8,
        // fontWeight:'bold',
        color: colors.text.altGrey
    },
    inputContainer:{
        flexDirection: 'row', 
        alignItems: 'center',
        borderBottomColor:colors.text.altGrey,
        borderBottomWidth:1.1,
        height:45
    }
})
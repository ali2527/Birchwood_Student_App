import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../../theme/colors';
import Ionicon from 'react-native-vector-icons/Ionicons';

export default function DropDown({
  placeholder,
  list,
  onChange,
  value,
  noTitle,
  searchable,
  multiple,
  disabled,
  multipleText,
  selected,
  multiValue,
  open,
  setOpen,
  zIndex,
  dropDownMaxHeight,
  mainContainer_style,
  style,
  labelStyle,
  listMode,
  arrowIconStyle,
  translation,
  placeholderStyle,
  placeholderClr,
  setItems,
  badge,
  label,
  required,
  starColor
}) {

    const ArrowUpIconComponent=() => <Ionicon name='chevron-up' size={20} color={colors.text.altGrey} />
    const ArrowDownIconComponent=() => <Ionicon name='chevron-down' size={20} color={colors.text.altGrey} />
  
  return (
     <View style={{marginVertical:10}}>
        <Text style={[styles.labelStyle]}>
        {label} {required && <Text style={{ color: starColor || 'red' }}>*</Text>}
      </Text>
       <DropDownPicker
        items={list}
        placeholder={placeholder}
        containerStyle={{borderRadius:10}}
        style={{...styles.mainContainer_style, ...mainContainer_style}}
        // maxHeight={100}
        value={value}
        defaultValue={value}
        min={0}
        max={5}
        multipleText={multipleText}
        // dropDownMaxHeight={100}
        open={open}
        setOpen={setOpen}
        setValue={onChange}
        disabled={disabled}
        searchable={searchable === true}
        setItems={multiple ? setItems : null}
        multiple={multiple}
        selected={selected}
        labelStyle={labelStyle ? labelStyle : null}
        listMode={listMode ? listMode : 'DEFAULT'}
        placeholderStyle={{...styles.placeholder, ...placeholderStyle}}
        dropDownContainerStyle={{
          borderColor:colors.input.background
        }}
        mode={badge ? "BADGE" : "SIMPLE"}
        disabledItemLabelStyle={{
          opacity: 0.5
        }}
        disabledStyle={{
          opacity: 0.5
        }}
        ArrowDownIconComponent={ArrowDownIconComponent}
        ArrowUpIconComponent={ArrowUpIconComponent}
      /> 
   </View>
    
  );
}

const styles = StyleSheet.create({
  placeholder:{
     color:colors.text.altGrey
  },
  mainContainer_style:{
    borderWidth: 1.5,
    borderColor: colors.input.background,
    borderRadius:10,
    paddingHorizontal: 7,
    color:colors.text.grey,
    // flex: 1,
    backgroundColor:colors.input.background,
    // justifyContent:'center',
  },
  labelStyle:{
    marginBottom: 5,
    fontSize:12,
    fontWeight:'bold',
    color: colors.text.altGrey
}
})

import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {colors} from '../../theme/colors';
import GlroyBold from '../GlroyBoldText';

const CustomButton = ({title, containerStyle, _style, onPress, isFocused}) => {
  return (
    <TouchableOpacity
      style={{
        ...styles.button,
        ...containerStyle,
        backgroundColor: isFocused
          ? colors.theme.primary
          : colors.background.primary,
      }}
      onPress={() => {
        onPress && onPress();
      }}>
      <GlroyBold
        _style={{
          ..._style,
          color: isFocused ? colors.text.white : colors.theme.primary,
        }}
        text={title}
      />
      {/* <Text style={[styles.buttonText, {color:}]}>{title}</Text> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    paddingHorizontal: 50,
    paddingVertical: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.theme.primary,
    marginVertical: 8,
  },
});

export default CustomButton;

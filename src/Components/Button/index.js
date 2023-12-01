import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import GlroyBold from '../GlroyBoldText';

const CustomButton = ({ title, _style, onPress, isFocused }) => {
    return (
        <TouchableOpacity
            style={[styles.button, {backgroundColor: isFocused ? colors.theme.primary : colors.background.primary }]}
            onPress={()=> {onPress && onPress()}}
        >
            <GlroyBold
             _style={{color:isFocused ? colors.text.white : colors.theme.primary}}
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
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth:2,
        borderColor:colors.theme.primary
    }
});

export default CustomButton;

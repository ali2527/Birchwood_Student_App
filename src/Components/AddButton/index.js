import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import GlroyBold from '../GlroyBoldText';

export const AddButton = ({ title, _style, onPress, isFocused }) => {
    return (
        <View style={styles.container}>
        <TouchableOpacity
            style={[styles.button]}
            onPress={()=> {onPress && onPress()}}
        >
            <IonicIcon name='add' size={15} color={colors.text.altGrey}  />
            <GlroyBold
             _style={{color:colors.text.altGrey,fontSize:14, fontWeight:'normal', marginHorizontal:5}}
             text={title}
            />
            {/* <Text style={[styles.buttonText, {color:}]}>{title}</Text> */}
        </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection:'row',
        alignItems:'center',
        borderRadius: 20,
        paddingHorizontal: 50,
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth:1,
        borderColor:colors.text.altGrey,
        marginVertical:10
    },
    container:{
        alignItems:'center'
    }
});


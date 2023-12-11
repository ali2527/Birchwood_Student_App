import { StyleSheet, Text, View, FlatList, Platform, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { vh, vw } from '../../theme/units'
import GlroyBold from '../../Components/GlroyBoldText';
import { colors } from '../../theme/colors';
import GrayMediumText from '../../Components/GrayMediumText';
import Ionicon from 'react-native-vector-icons/Ionicons';
import TopBar from '../../Components/TopBar';
import FormContainer from '../../Components/FormContainer';

export default function ProfileForm() {
    return (
        <>
            <TopBar>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicon name="chevron-back-outline" size={18} color={colors.theme.white} />
                        <Text style={{ color: colors.text.white, marginLeft: 10, fontWeight: 'bold', bottom: 1 }}>My Profile</Text>
                    </View>
                    <TouchableOpacity style={styles.editContainer}>
                        <Ionicon name="checkmark" size={15} color={colors.theme.white} style={styles.addIcon} />
                        <Text style={{ color: colors.theme.secondary, fontWeight: 'bold', fontSize: 13 }}>Done</Text>
                    </TouchableOpacity>
                </View>
            </TopBar>
            <FormContainer>
                <Text>Test The Form Container</Text>
            </FormContainer>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        margin: 10,
        bottom: vh * 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: colors.theme.white,
        borderRadius: 15,
        padding: 3,
        bottom: 3
    },
    addIcon: {
        // height:20,
        // width:20,
        backgroundColor: colors.theme.secondary,
        borderRadius: 10,
        marginHorizontal: 5
    },
    container:{
        flex:1,
        marginHorizontal:20
    }
})
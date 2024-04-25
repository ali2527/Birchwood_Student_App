import { StyleSheet, Text, View, FlatList, Platform, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { vh, vw } from '../../theme/units'
import GlroyBold from '../../Components/GlroyBoldText';
import { colors } from '../../theme/colors';
import GrayMediumText from '../../Components/GrayMediumText';
import Ionicon from 'react-native-vector-icons/Ionicons';
import TopBar from '../../Components/TopBar';
import FormContainer from '../../Components/FormContainer';
import FormTextInput from '../../Components/FormTextInput';
import { BackArrow } from '../../Components/BackArrow';

export default function ProfileForm() {
    return (
        <>
            <TopBar>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <BackArrow/>
                        {/* <Ionicon name="chevron-back-outline" size={18} color={colors.theme.white} /> */}
                        <Text style={{ color: colors.text.white, marginLeft: 10, fontWeight: 'bold', bottom: 1 }}>My Profile fff</Text>
                    </View>
                    <TouchableOpacity style={styles.editContainer}>
                        <Ionicon name="checkmark" size={15} color={colors.theme.white} style={styles.addIcon} />
                        <Text style={{ color: colors.theme.secondary, fontWeight: 'bold', fontSize: 13 }}>Done</Text>
                    </TouchableOpacity>
                </View>
            </TopBar>
            <FormContainer>
                <View style={styles.inputFieldContainer}>
                    <FormTextInput
                        label={'Roll Number'}
                        placeholder={'123 345'}
                        containerStyle={{ marginRight: 5 }}
                    // icon={'bag'}
                    />
                    <FormTextInput
                        label={'Acadmic Year'}
                        placeholder={'2023-2021'}
                        containerStyle={{ marginLeft: 5 }}
                    />
                </View>
                <View style={styles.inputFieldContainer}>
                    <FormTextInput
                        label={'Admission Class'}
                        placeholder={'V1'}
                        containerStyle={{ marginRight: 5 }}
                        icon={'bag'}
                    />
                    <FormTextInput
                        label={'Old Admission No'}
                        placeholder={'T1022'}
                        containerStyle={{ marginLeft: 5 }}
                        icon={'bag'}
                    />
                </View>
                <View style={styles.inputFieldContainer}>
                    <FormTextInput
                        label={'Date of Admission'}
                        placeholder={'01 Apr 2021'}
                        containerStyle={{ marginRight: 5 }}
                        icon={'bag'}
                    />
                    <FormTextInput
                        label={'Date of Birth'}
                        placeholder={'22 July 1996'}
                        containerStyle={{ marginLeft: 5 }}
                        icon={'bag'}
                    />
                </View>
                <View style={styles.inputFieldContainer}>
                    <FormTextInput
                        label={'Parent Mail ID'}
                        placeholder={'admin@mail.com'}
                        icon={'bag'}
                    />
                </View>
                <View style={styles.inputFieldContainer}>
                    <FormTextInput
                        label={'Mother Name'}
                        placeholder={'Monica Larson'}
                        icon={'bag'}
                    />
                </View>
                <View style={styles.inputFieldContainer}>
                    <FormTextInput
                        label={'Father Name'}
                        placeholder={'Bermad Tylor'}
                        icon={'bag'}
                    />
                </View>
                <View style={styles.inputFieldContainer}>
                    <FormTextInput
                        label={'Permanent Address'}
                        placeholder={'address'}
                        icon={'bag'}
                    />
                </View>
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
    container: {
        flex: 1,
        marginHorizontal: 20
    },
    inputFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop:10
    }
})
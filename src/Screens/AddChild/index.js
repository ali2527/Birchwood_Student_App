import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { vh, vw } from '../../theme/units';
import { colors } from '../../theme/colors';
import Ionicon from 'react-native-vector-icons/Ionicons';
import TopBar from '../../Components/TopBar';
import FormContainer from '../../Components/FormContainer';
import FormTextInput from '../../Components/FormTextInput';
import { BackArrow } from '../../Components/BackArrow';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../Stores/hooks';
import { asyncAssignChild } from '../../Stores/actions/user.action';

export default function AddChild() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        child: '',
        rollNo: '',
        dob: '',
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            child: formData.child,
            rollNo: formData.rollNo,
            dob: formData.dob,
        };

        const result = await dispatch(asyncAssignChild(payload));
        if (result.type === 'assignChild/fulfilled' && result.payload?.status) {
            navigation.goBack();
        }
    };

    return (
        <>
            <TopBar>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <BackArrow />
                        <Text style={{ color: colors.text.white, marginLeft: 10, fontWeight: 'bold', bottom: 1 }}>Assign Child</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editContainer}
                        onPress={handleSubmit}
                    >
                        <Ionicon name="checkmark" size={15} color={colors.theme.white} style={styles.addIcon} />
                        <Text style={{ color: colors.theme.secondary, fontWeight: 'bold', fontSize: 13 }}>Done</Text>
                    </TouchableOpacity>
                </View>
            </TopBar>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <FormContainer>
                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Child ID'}
                                placeholder={'Enter Child ID'}
                                value={formData.child}
                                onChangeText={handleChange}
                                name="child"
                            />
                        </View>

                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Roll No'}
                                placeholder={'Enter Roll Number'}
                                value={formData.rollNo}
                                onChangeText={handleChange}
                                name="rollNo"
                            />
                        </View>

                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Date of Birth'}
                                placeholder={'DD-MM-YYYY'}
                                value={formData.dob}
                                onChangeText={handleChange}
                                name="dob"
                                icon={'calendar-outline'}
                            />
                        </View>
                    </FormContainer>
                </ScrollView>
            </KeyboardAvoidingView>
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
        marginTop: 10
    }
})

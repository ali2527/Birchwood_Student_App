import { StyleSheet, Text, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { vh, vw } from '../../theme/units'
import { colors } from '../../theme/colors';
import Ionicon from 'react-native-vector-icons/Ionicons';
import TopBar from '../../Components/TopBar';
import FormContainer from '../../Components/FormContainer';
import FormTextInput from '../../Components/FormTextInput';
import { BackArrow } from '../../Components/BackArrow';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../Stores/hooks';
import { selectUserProfile } from '../../Stores/slices/user.slice';
import { asyncUpdateProfile } from '../../Stores/actions/user.action';
import { getImagePath } from '../../Service/axios';
import ParentPhotoPickers, {
    appendParentPhoto,
    pickParentPhoto,
} from '../../Components/Auth/ParentPhotoPickers';
import {
    DEFAULT_PHONE_COUNTRY,
    parsePhone,
    toPhonePayload,
} from '../../Components/Auth/phoneMask';

export default function ProfileForm() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const profile = useAppSelector(selectUserProfile);

    const [formData, setFormData] = useState({
        fatherFirstName: '',
        fatherLastName: '',
        motherFirstName: '',
        motherLastName: '',
        email: '',
        phone: '',
        phoneCountry: DEFAULT_PHONE_COUNTRY,
        address: '',
        city: '',
        state: '',
    });
    const [fatherPhoto, setFatherPhoto] = useState(null);
    const [motherPhoto, setMotherPhoto] = useState(null);

    useEffect(() => {
        if (profile?._id) {
            const parsed = parsePhone(profile?.phone || '');
            setFormData({
                fatherFirstName: profile?.fatherFirstName || '',
                fatherLastName: profile?.fatherLastName || '',
                motherFirstName: profile?.motherFirstName || '',
                motherLastName: profile?.motherLastName || '',
                email: profile?.email || '',
                phone: parsed.local,
                phoneCountry: parsed.iso,
                address: profile?.address || '',
                city: profile?.city || '',
                state: profile?.state || '',
            });
            setFatherPhoto(
                profile?.fatherImage || profile?.image
                    ? { uri: getImagePath(profile.fatherImage || profile.image) }
                    : null,
            );
            setMotherPhoto(
                profile?.motherImage
                    ? { uri: getImagePath(profile.motherImage) }
                    : null,
            );
        }
    }, [profile]);

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            fatherFirstName: formData.fatherFirstName,
            fatherLastName: formData.fatherLastName,
            motherFirstName: formData.motherFirstName,
            motherLastName: formData.motherLastName,
            phone: toPhonePayload(formData.phone, formData.phoneCountry),
            address: formData.address,
            city: formData.city,
            state: formData.state,
        };

        const fatherPicked = fatherPhoto?.uri && !fatherPhoto.uri.startsWith('http');
        const motherPicked = motherPhoto?.uri && !motherPhoto.uri.startsWith('http');

        let body = payload;
        if (fatherPicked || motherPicked) {
            const data = new FormData();
            Object.keys(payload).forEach(key => {
                if (payload[key] !== undefined && payload[key] !== null) {
                    data.append(key, payload[key]);
                }
            });
            if (fatherPicked) {
                appendParentPhoto(data, 'fatherImage', fatherPhoto);
            }
            if (motherPicked) {
                appendParentPhoto(data, 'motherImage', motherPhoto);
            }
            body = data;
        }

        const result = await dispatch(asyncUpdateProfile(body));
        if (result.type === 'updateProfile/fulfilled' && result.payload?.status) {
            navigation.goBack();
        }
    };

    return (
        <>
            <TopBar>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <BackArrow/>
                        <Text style={{ color: colors.text.white, marginLeft: 10, fontWeight: 'bold', bottom: 1 }}>Edit Profile</Text>
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
                        <ParentPhotoPickers
                            fatherUri={fatherPhoto?.uri}
                            motherUri={motherPhoto?.uri}
                            onPickFather={async () => {
                                const photo = await pickParentPhoto();
                                if (photo) {
                                    setFatherPhoto(photo);
                                }
                            }}
                            onPickMother={async () => {
                                const photo = await pickParentPhoto();
                                if (photo) {
                                    setMotherPhoto(photo);
                                }
                            }}
                        />
                        {/* Father Name */}
                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Father First Name'}
                                placeholder={'Enter first name'}
                                containerStyle={{ marginRight: 5 }}
                                value={formData.fatherFirstName}
                                onChangeText={handleChange}
                                name="fatherFirstName"
                            />
                            <FormTextInput
                                label={'Father Last Name'}
                                placeholder={'Enter last name'}
                                containerStyle={{ marginLeft: 5 }}
                                value={formData.fatherLastName}
                                onChangeText={handleChange}
                                name="fatherLastName"
                            />
                        </View>

                        {/* Mother Name */}
                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Mother First Name'}
                                placeholder={'Enter first name'}
                                containerStyle={{ marginRight: 5 }}
                                value={formData.motherFirstName}
                                onChangeText={handleChange}
                                name="motherFirstName"
                            />
                            <FormTextInput
                                label={'Mother Last Name'}
                                placeholder={'Enter last name'}
                                containerStyle={{ marginLeft: 5 }}
                                value={formData.motherLastName}
                                onChangeText={handleChange}
                                name="motherLastName"
                            />
                        </View>

                        {/* Contact Information */}
                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Email'}
                                placeholder={'parent@email.com'}
                                value={formData.email}
                                onChangeText={handleChange}
                                name="email"
                                icon={'mail-outline'}
                            />
                        </View>

                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Phone'}
                                value={formData.phone}
                                onChangeText={handleChange}
                                name="phone"
                                icon={'call-outline'}
                                countryIso={formData.phoneCountry}
                                onCountryChange={iso =>
                                    setFormData(prev => ({
                                        ...prev,
                                        phoneCountry: iso,
                                    }))
                                }
                            />
                        </View>

                        {/* Address */}
                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'Address'}
                                placeholder={'Enter address'}
                                value={formData.address}
                                onChangeText={handleChange}
                                name="address"
                                icon={'location-outline'}
                            />
                        </View>

                        <View style={styles.inputFieldContainer}>
                            <FormTextInput
                                label={'City'}
                                placeholder={'Enter city'}
                                containerStyle={{ marginRight: 5 }}
                                value={formData.city}
                                onChangeText={handleChange}
                                name="city"
                            />
                            <FormTextInput
                                label={'State'}
                                placeholder={'Enter state'}
                                containerStyle={{ marginLeft: 5 }}
                                value={formData.state}
                                onChangeText={handleChange}
                                name="state"
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
import {
    View,
    ScrollView,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    Text
} from 'react-native'
import React, { useState } from 'react'
import CustomStatusBar from '../../Components/StatusBar'
import { colors } from '../../theme/colors'
import MainLogo from '../../Components/MainLogo'
import CustomButton from '../../Components/Button';
import GlroyBold from '../../Components/GlroyBoldText';
import { useNavigation } from '@react-navigation/native';
import routes from '../../Navigation/routes';
import GrayMediumText from '../../Components/GrayMediumText'
import CustomTextInput from '../../Components/InputField'
import SampleInputField from '../../Components/SampleInputField'
import { AddButton } from '../../Components/AddButton'

export default function Experience() {
    const [formData, setFormData] = useState({
        institut_name: '',
        start_date: '',
        end_date: '',
        subject_taught: ''
    })
    const [rememberPassword, setRememberPassword] = useState(false);
    const navigation = useNavigation();

    function handleChange(name, value) {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <CustomStatusBar
                    backgroundColor={colors.theme.white}
                    barStyle="dark-content"
                />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                // behavior="padding"
                // enabled
                >
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <MainLogo />
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {/* Your other components/content here */}
                        <View style={{ alignItems: 'center' }}>
                            <GrayMediumText
                                text={'Welcome to Birchwood Montessori Academy, a family-owned and operated school with a profound mission and vision.'}
                                _style={styles.para}
                            />
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <GlroyBold
                                text={'Experience'}
                                _style={styles.head}
                            />
                        </View>
                        <CustomTextInput
                            label="Institute Name"
                            name={'institue_name'}
                            placeholder={'institute name'}
                            value={formData.institut_name}
                            required
                            onChangeText={(name, value) => handleChange(name, value)}
                        />

                        <SampleInputField
                            label="Starting Date"
                            name={'start_date'}
                            onChangeText={(name, value) => handleChange(name, value)}
                            placeholder={'start date'}
                            value={formData.start_date}
                            required
                        />
                        <SampleInputField
                            label="Ending Date"
                            name={'end_date'}
                            onChangeText={(name, value) => handleChange(name, value)}
                            placeholder={'end date'}
                            value={formData.end_date}
                            required
                        />
                        <CustomTextInput
                            label="Subject study"
                            name={'subject_taught'}
                            placeholder={'subject taught'}
                            value={formData.subject_taught}
                            required
                            onChangeText={(name, value) => handleChange(name, value)}
                        />

                        <AddButton
                            title={'Add Experience'}
                        />

                        <View style={{ alignItems: 'center' }}>
                            <CustomButton
                                isFocused={true}
                                title={'Finish'}
                                onPress={() => console.log('finish details')}
                            />
                        </View>

                        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                            <GrayMediumText
                                text={'Already have account?'}
                            />
                            <TouchableOpacity
                                style={{ marginHorizontal: 2 }}
                                onPress={() => navigation.navigate(routes.navigator.signin)}
                            >
                                <Text style={{ color: colors.theme.primary, fontWeight: 'bold' }}>Login</Text>
                            </TouchableOpacity>
                        </View>


                        {/* Add more TextInput fields as needed */}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'green'
    },
    scrollContainer: {
        flexGrow: 1,
        // justifyContent: 'center',
        padding: 16,
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    head: {
        // marginTop: 0,
        color: colors.text.black
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'red'
    },
    checkboxLabel: {
        marginLeft: 8,
    },
    para: {
        fontSize: 14,
        fontWeight: 'normal'
    }
})
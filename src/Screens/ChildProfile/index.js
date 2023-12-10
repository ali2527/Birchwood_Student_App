import {
    View,
    ScrollView,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    Text,
    SafeAreaView
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
import { BackArrow } from '../../Components/BackArrow'
import { vh } from '../../theme/units';
import Ionicon from 'react-native-vector-icons/Ionicons';


export default function ChildProfile() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dod: '',
        age: '',
        gender: '',
    })
    const navigation = useNavigation();

    function handleChange(name, value) {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={{ flex: 1 }}>
                <CustomStatusBar
                    backgroundColor={colors.theme.white}
                    barStyle="dark-content"
                />
                <View style={styles.container}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                    // behavior="padding"
                    // enabled
                    >

                        <View style={styles.profileCircle}>
                            <Ionicon name='person' size={30} color={colors.text.greyAlt2}
                            />
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContainer}>
                            {/* Your other components/content here */}
                            <View style={{ alignItems: 'center' }}>
                                <GlroyBold
                                    text={'Child Profile'}
                                    _style={styles.head}
                                />
                                <GrayMediumText
                                    text={'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
                                    _style={styles.para}
                                />
                            </View>
                            <CustomTextInput
                                label="First Name"
                                name={'first_name'}
                                placeholder={'first name'}
                                value={formData.first_name}
                                required
                                onChangeText={(name, value) => handleChange(name, value)}
                            />
                            <CustomTextInput
                                label="Last Name"
                                name={'last_name'}
                                placeholder={'last name'}
                                value={formData.last_name}
                                required
                                onChangeText={(name, value) => handleChange(name, value)}
                            />
                            <SampleInputField
                                label="Age"
                                name={'age'}
                                onChangeText={(name, value) => handleChange(name, value)}
                                placeholder={'12-12-1995'}
                                value={formData.age}
                                required
                            />
                            <SampleInputField
                                label="Date Of Birth"
                                name={'dob'}
                                onChangeText={(name, value) => handleChange(name, value)}
                                placeholder={'date of birt'}
                                value={formData.dod}
                                required
                            />
                            <SampleInputField
                                label="Gender"
                                name={'gender'}
                                onChangeText={(name, value) => handleChange(name, value)}
                                placeholder={'gender'}
                                value={formData.gender}
                                required
                            />

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <CustomButton
                                    isFocused={true}
                                    title={'Next'}
                                // onPress={() => navigation.navigate(routes.navigator.education)}
                                />
                            </View>

                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
    },
    profileCircle: {
        height: 70,
        width: 70,
        borderRadius: 35,
        backgroundColor: colors.text.grey,
        alignItems: 'center',
        alignSelf: 'center',
        paddingVertical: 20,
        marginTop: vh * 8,
        position: 'relative'
    }
})
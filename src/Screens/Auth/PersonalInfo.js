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
import IonicIcon from 'react-native-vector-icons/Ionicons';
import { BackArrow } from '../../Components/BackArrow'


export default function PersonalInfo() {
    const [formData, setFormData] = useState({
        dod: '',
        age: '',
        gender: '',
        address: '',
        city: ''
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
                                text={'Personal Information'}
                                _style={styles.head}
                            />
                        </View>

                        <SampleInputField
                            label="Date Of Birth"
                            name={'dob'}
                            onChangeText={(name, value) => handleChange(name, value)}
                            placeholder={'date of birt'}
                            value={formData.dod}
                            required
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
                            label="Gender"
                            name={'gender'}
                            onChangeText={(name, value) => handleChange(name, value)}
                            placeholder={'gender'}
                            value={formData.gender}
                            required
                        />
                        <CustomTextInput
                            label="Address"
                            name={'address'}
                            placeholder={'address'}
                            value={formData.address}
                            required
                            onChangeText={(name, value) => handleChange(name, value)}
                        />
                        <CustomTextInput
                            label="City"
                            name={'city'}
                            placeholder={'city'}
                            value={formData.city}
                            required
                            onChangeText={(name, value) => handleChange(name, value)}
                        />

                        <View style={{flexDirection:'row', alignItems: 'center', justifyContent:'center' }}>
                           <BackArrow/>
                            <CustomButton
                                isFocused={true}
                                title={'Next'}
                                onPress={() => navigation.navigate(routes.navigator.education)}
                            />
                        </View>

                        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent:'center' }}>
                            <GrayMediumText
                                text={'Already have account?'}
                            />
                            <TouchableOpacity 
                            style={{ marginHorizontal: 2 }}
                            onPress={()=> navigation.navigate(routes.navigator.signin)}
                            >
                                <Text style={{ color: colors.theme.primary, fontWeight:'bold' }}>Login</Text>
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
    para:{
        fontSize:14,
        fontWeight:'normal'
    }
})
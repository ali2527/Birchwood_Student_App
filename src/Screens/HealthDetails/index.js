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
import DropDown from '../../Components/DropDown'

export default function HealthDetails() {
    const [formData, setFormData] = useState({
        allergi: '',
        fear: '',
        condition: '',
        brief: ''
    })
    const [rememberPassword, setRememberPassword] = useState(false);
    const navigation = useNavigation();

    const [openAllergi, setOpenAllergi] = useState(false);
    const [openFear, setOpenFear] = useState(false);
    const [openCondition, setOpenCondition] = useState(false);


    function handleChange(name, value) {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const listAllergi = [
        {
            label: 'Alergi 1',
            value: 'alergi_1',
        },
        {
            label: 'Alergi 2',
            value: 'alergi_2'
        },
        {
            label: 'Alergi 3',
            value: 'alergi_3'
        },
        {
            label: 'Alergi 4',
            value: 'alergi_4'
        }

    ];

    const fearList = [
        {
            label: 'Fear 1',
            value: 'fear_1',
        },
        {
            label: 'Fear 2',
            value: 'fear_2'
        },
        {
            label: 'Fear 3',
            value: 'fear_3'
        },
        {
            label: 'Fear 4',
            value: 'fear_4'
        }

    ];

    const conditions = [
        {
            label: 'Condition 1',
            value: 'condition_1',
        },
        {
            label: 'Condition 2',
            value: 'condition_2'
        },
        {
            label: 'Condition 3',
            value: 'condition_3'
        },
        {
            label: 'Condition 4',
            value: 'condition_4'
        }

    ];




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
                            <GlroyBold
                                text={'Health Details'}
                                _style={styles.head}
                            />
                            <GrayMediumText
                                text={'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
                                _style={styles.para}
                            />
                        </View>
                        <DropDown
                            label={'Any Allergies'}
                            placeholder={'Select any'}
                            list={listAllergi}
                            onChange={(value) => handleChange('allergi', value())}
                            value={formData.allergi}
                            open={openAllergi}
                            style={styles.dropdown_inner_style}
                            setOpen={() => setOpenAllergi(openAllergi => !openAllergi)}
                            listMode="MODAL"
                            required
                        />

                        <DropDown
                            label={'Any Fears'}
                            placeholder={'Select any'}
                            list={fearList}
                            onChange={(value) => handleChange('fear', value())}
                            value={formData.fear}
                            open={openFear}
                            style={styles.dropdown_inner_style}
                            setOpen={() => setOpenFear(openFear => !openFear)}
                            listMode="MODAL"
                            required
                        />
                        <DropDown
                            label={'Health Condition'}
                            placeholder={'Select any'}
                            list={conditions}
                            onChange={(value) => handleChange('fear', value())}
                            value={formData.condition}
                            open={openCondition}
                            style={styles.dropdown_inner_style}
                            setOpen={() => setOpenCondition(openCondition => !openCondition)}
                            listMode="MODAL"
                            required
                        />
                    
                        <CustomTextInput
                            label="Brief Summary"
                            name={'brief'}
                            placeholder={'Describe...'}
                            value={formData.brief}
                            required
                            onChangeText={(name, value) => handleChange(name, value)}
                            multiple
                        />
            
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <CustomButton
                                isFocused={true}
                                title={'Finish'}
                                onPress={() => console.log('Finish')}
                            />
                        </View>

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
    },
    dropdown_inner_style: {

    }
})
import { StyleSheet, Text, View, } from 'react-native'
import React, { useState } from 'react'
import GlroyBold from '../../Components/GlroyBoldText'
import GrayMediumText from '../../Components/GrayMediumText'
import CustomButton from '../../Components/Button'
import CustomTextInput from '../../Components/InputField'
import { colors } from '../../theme/colors'

export default function ForgotPassword({handleScreen}) {
    const [email, setEmail] = useState('');
    return (
        <View style={styles.contanier}>
            <View style={styles.heading}>
                <GlroyBold text={'Forgot Password'} _style={{ color: colors.text.black }} />
            </View>
            <GrayMediumText
                text={'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
                _style={styles.para}
            />
            <View>
                <CustomTextInput
                    label="Enter your Email"
                    placeholder={'Email'}
                    value={email}
                    required
                    onChangeText={setEmail}
                />
            </View>
            <View style={{ alignItems: 'center' }}>
                <CustomButton
                    isFocused={true}
                    title={'Submit'}
                    onPress={() => handleScreen(2)}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    para: {
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 22
    },
    heading: {
        justifyContent: 'center',
        alignItems: "center"
    }
})
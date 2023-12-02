import { StyleSheet, Text, View, } from 'react-native'
import React, { useState } from 'react'
import GlroyBold from '../../Components/GlroyBoldText'
import GrayMediumText from '../../Components/GrayMediumText'
import CustomTextInput from '../../Components/InputField'
import { colors } from '../../theme/colors'
import CustomButton from '../../Components/Button'

export default function VerificationCode({handleScreen}) {
    const [email, setEmail] = useState('');
    return (
        <View style={styles.contanier}>
            <View style={styles.heading}>
                <GlroyBold text={'Verification Code?'} _style={{ color: colors.text.black }} />
            </View>
            <GrayMediumText
                text={'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
                _style={styles.para}
            />
            <View>
                <CustomTextInput
                    label="Enter your verification code?"
                    placeholder={'Code'}
                    value={email}
                    required
                    onChangeText={setEmail}
                />
            </View>
            <View style={{ alignItems: 'center' }}>
                <CustomButton
                    isFocused={true}
                    title={'Verify'}
                    onPress={() => handleScreen(3)}
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
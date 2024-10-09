import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native'
import React, { useState } from 'react'
import AnimatedBackgroundImage from '../../Components/AnimatedBackgroundImage'
import forgot_child from '../../Assets/images/forgot_child.png';
import verification_child from '../../Assets/images/verification_child.png';
import reset_pass_child from '../../Assets/images/reset_pass_child.png';

import ForgotPassword from './ForgotPassword';
import VerificationCode from './VerificationCode';
import ResetPassword from './ResetPassword';

export default function PasswordResetScreens() {
    const [screensData, setScreensData] = {
        index: 1,
        email: "",
        code: ""
    }

    function handleScreen(data) {
        setScreensData(prevData = ({ ...prevData, ...data }))
    }

    const screen = screensData.index

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <AnimatedBackgroundImage
                additionalImage={screen == 2 ? verification_child : screen === 3 ? reset_pass_child : forgot_child}
            />
            <View style={[styles.bottomContainer, { flex: (screen == 1 || screen == 2) ? 1 : 1.3 }]}>
                {screen == 1 && (<ForgotPassword data={screensData} handleScreen={handleScreen} />)}
                {screen == 2 && (<VerificationCode data={screensData} handleScreen={handleScreen} />)}
                {screen == 3 && (<ResetPassword data={screensData} />)}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
})
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native'
import React, {useState} from 'react'
import AnimatedBackgroundImage from '../../Components/AnimatedBackgroundImage'
import forgot_child from '../../Assets/images/forgot_child.png';
import verification_child from '../../Assets/images/verification_child.png';
import reset_pass_child from '../../Assets/images/reset_pass_child.png';

import ForgotPassword from './ForgotPassword';
import VerificationCode from './VerificationCode';
import ResetPassword from './ResetPassword';

export default function PasswordResetScreens() {
    const [screen, setScreen] = useState(1);
    function handleForgotPassword(params) {
        console.log('Clicked On Forgot Password')
    }

    function handleScreen(params) {
        setScreen(params)
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <AnimatedBackgroundImage
                additionalImage={screen == 2 ? verification_child : screen === 3 ? reset_pass_child : forgot_child}
            />
            <View style={[styles.bottomContainer, {flex: (screen == 1 || screen == 2) ? 1 : 2}]}>
                {screen == 1 && (<ForgotPassword handleScreen={handleScreen}/>)}
                {screen == 2 && (<VerificationCode handleScreen={handleScreen}/>)}
                {screen == 3 && (<ResetPassword handleScreen={handleScreen}/>)}
                
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomContainer: {
        justifyContent: 'center', // Align content to the top
        alignItems: 'center',
        paddingHorizontal: 20,
        // backgroundColor:'red',
        paddingTop: 20,
    },
})
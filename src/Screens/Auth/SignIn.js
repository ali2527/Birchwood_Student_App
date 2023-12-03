import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import CustomTextInput from '../../Components/InputField';
import SmallText from '../../Components/SmallText';
import { colors } from '../../theme/colors';
import MainLogo from '../../Components/MainLogo';
import ChildLogo from '../../Components/ChildLogo';
import CustomButton from '../../Components/Button';
import GlroyBold from '../../Components/GlroyBoldText';
import SocialMediaIcons from '../../Components/SocialMediaIcons';
import { useNavigation } from '@react-navigation/native';
import routes from '../../Navigation/routes';


const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation();

    const handleForgotPassword = () => {
        // Add logic to handle forgot password functionality
        console.log('Forgot Password clicked');
        navigation.navigate(routes.navigator.passwordresetscreens)
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 0}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ alignItems: 'center' }}>
                    <MainLogo />
                </View>
                <View style={styles.formContainer}>
                    <CustomTextInput
                        label="Email Address"
                        placeholder={'Enter your email here'}
                        value={email}
                        required
                        onChangeText={setEmail}
                    />
                    <CustomTextInput
                        label="Password"
                        placeholder={'password'}
                        value={password}
                        required
                        password
                        onChangeText={setPassword}
                    />
                    <View style={styles.forgotPasswordContainer}>
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <SmallText
                                text={'Forgot Password?'}
                                _style={styles.forgotPasswordText}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <CustomButton
                        isFocused={true}
                        title={'Sign In'}
                        onPress={() => console.log('Login')}
                    />
                </View>
                <View style={{ alignItems: 'center',marginVertical:10 }}>
                    <ChildLogo _style={styles.childLogo} />
                </View>
                <SocialMediaIcons />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    formContainer: {
        flex: 1,
        //  marginTop:30,
        justifyContent: 'flex-end',
        // backgroundColor:'red'
    },
    forgotPasswordContainer: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        textDecorationLine: 'underline',
        color: colors.theme.primary

    },
    childLogo: {
        height: 180,
        width: 320
    }
});

export default SignIn;

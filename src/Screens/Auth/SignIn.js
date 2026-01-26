import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Keyboard } from 'react-native';
import CustomButton from '../../Components/Button';
import ChildLogo from '../../Components/ChildLogo';
import CustomTextInput from '../../Components/InputField';
import MainLogo from '../../Components/MainLogo';
import SmallText from '../../Components/SmallText';
import { colors } from '../../theme/colors';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch } from '../../Stores/hooks';
import routes from '../../Navigation/routes';
import GrayMediumText from '../../Components/GrayMediumText';
import { asyncLogin } from '../../Stores/actions/user.action';

const SignIn = ({ navigation }) => {

    const dispatch = useAppDispatch();
    // Track keyboard visibility to enable/disable scrolling
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        // Listen to keyboard show/hide events
        // Enable scrolling only when keyboard is visible (input field focused)
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleForgotPassword = () => {
        navigation.navigate(routes.navigator.passwordresetscreens)
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = useCallback(
        async (body) => {
            console.log('body', body);
            const res = await dispatch(asyncLogin(body)).unwrap();
            if (res.status) {
                navigation.navigate(routes.screens.homeScreen);
            }
        },
        [navigation, dispatch]
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                // Enable scrolling only when keyboard is visible (input field focused)
                scrollEnabled={isKeyboardVisible}
                bounces={isKeyboardVisible}
            >
                <View style={styles.logoContainer}>
                    <MainLogo />
                </View>
                <View style={styles.formContainer}>
                    <Controller
                        name="email"
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: 'Email is required',
                            },
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: 'Email format is invalid',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <CustomTextInput
                                label="Email Address"
                                placeholder={'Enter your email here'}
                                value={value}
                                required
                                onChangeText={onChange}
                            />
                        )} />

                    {errors.email?.message && (
                        <GrayMediumText
                            _style={{ color: colors.theme.lightRed }}
                            text={errors.email.message}
                        />
                    )}

                    <Controller
                        name="password"
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: 'Password is required',
                            },
                            minLength: {
                                value: 8,
                                message: 'Password must be minimum 8 characters',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <CustomTextInput
                                label="Password"
                                placeholder={'password'}
                                value={value}
                                required
                                password
                                onChangeText={onChange}
                            />
                        )} />

                    {errors.password?.message && (
                        <GrayMediumText
                            _style={{ color: colors.theme.lightRed }}
                            text={errors.password.message}
                        />
                    )}

                    <View style={styles.forgotPasswordContainer}>
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <SmallText
                                text={'Forgot Password?'}
                                _style={styles.forgotPasswordText}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <CustomButton
                        isFocused={true}
                        title={'Sign In'}
                        onPress={handleSubmit(onSubmit)}
                    />
                </View>
                <View style={styles.childLogoContainer}>
                    <ChildLogo _style={styles.childLogo} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    formContainer: {
        width: '100%',
        marginBottom: 20,
    },
    forgotPasswordContainer: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        textDecorationLine: 'underline',
        color: colors.theme.primary
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    childLogoContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    childLogo: {
        height: 120,
        width: 220
    }
});

export default SignIn;

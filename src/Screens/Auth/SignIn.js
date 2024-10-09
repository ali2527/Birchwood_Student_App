import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../Components/Button';
import ChildLogo from '../../Components/ChildLogo';
import CustomTextInput from '../../Components/InputField';
import MainLogo from '../../Components/MainLogo';
import SmallText from '../../Components/SmallText';
import SocialMediaIcons from '../../Components/SocialMediaIcons';
import { colors } from '../../theme/colors';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch } from '../../Stores/hooks';
import routes from '../../Navigation/routes';
import GrayMediumText from '../../Components/GrayMediumText';
import { asyncLogin } from '../../Stores/actions/user.action';

const SignIn = ({ navigation }) => {

    const dispatch = useAppDispatch();

    const handleForgotPassword = () => {
        console.log('Forgot Password clicked');
        navigation.navigate(routes.navigator.passwordresetscreens)
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: 'waqas@gmail.com',
            password: 'Waqas@123456',
        },
    });

    const onSubmit = useCallback(
        async (body) => {
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
            behavior={Platform.OS === 'ios' ? 'padding' : 0}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ alignItems: 'center' }}>
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

                    {errors.password?.message && (
                        <GrayMediumText
                            _style={{ color: colors.theme.lightRed }}
                            text={errors.password.message}
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
                <View style={{ alignItems: 'center' }}>
                    <CustomButton
                        isFocused={true}
                        title={'Sign In'}
                        onPress={handleSubmit(onSubmit)}
                    />
                </View>
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
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

import React, { useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import CustomButton from '../../Components/Button'
import GlroyBold from '../../Components/GlroyBoldText'
import GrayMediumText from '../../Components/GrayMediumText'
import { asyncEmailVerification } from '../../Stores/actions/user.action'
import { colors } from '../../theme/colors'
import { useAppDispatch } from '../../Stores/hooks'

export default function ForgotPassword({ data, handleScreen }) {
    const dispatch = useAppDispatch();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = useCallback(
        async (body) => {
            const res = await dispatch(asyncEmailVerification(body)).unwrap();

            if (res?.data?.encodedEmail) {
                handleScreen({
                    index: 2,
                    email: encodedEmail
                })
            }
        },
        [navigation, dispatch]
    );

    return (
        <View style={styles.contanier}>
            <View style={styles.heading}>
                <GlroyBold text={'Forgot Password ?'} _style={{ color: colors.text.black }} />
            </View>
            <GrayMediumText
                text={'Please enter the email address associated with your account below. We will send you a verification code to reset your password.'}
                _style={styles.para}
            />
            <View>
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
                            message: 'Email format is Invalid',
                        },
                    }}
                    render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                            label="Enter Address"
                            placeholder="Email your email"
                            value={value}
                            required
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.email?.message && (
                    <GrayMediumText
                        _style={{ color: colors.theme.lightRed }}
                        text={errors.email.message}
                    />
                )}
            </View>
            <View style={{ alignItems: 'center' }}>
                <CustomButton
                    isFocused={true}
                    title={'Submit'}
                    onPress={handleSubmit(onSubmit)}
                />
            </View>
        </View >
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
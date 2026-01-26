import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import CustomButton from '../../Components/Button'
import GlroyBold from '../../Components/GlroyBoldText'
import GrayMediumText from '../../Components/GrayMediumText'
import CustomTextInput from '../../Components/InputField'
import { asyncOtpVerification } from '../../Stores/actions/user.action'
import { useAppDispatch } from '../../Stores/hooks'
import { colors } from '../../theme/colors'
import { Controller, useForm } from 'react-hook-form'
import { useNavigation } from '@react-navigation/native'

export default function VerificationCode({ data, handleScreen }) {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            email: '',
            code: '',
        },
    });

    useEffect(() => {
        if (data?.email) {
            setValue('email', data.email);
        }
    }, [data?.email, setValue]);

    const onSubmit = useCallback(
        async (body) => {
            const res = await dispatch(asyncOtpVerification(body)).unwrap();

            if (res.status) {
                handleScreen({
                    index: 3,
                    code: body.code
                })
            }
        },
        [navigation, dispatch]
    );


    return (
        <View style={styles.contanier}>
            <View style={styles.heading}>
                <GlroyBold text={'Verification Code?'} _style={{ color: colors.text.black }} />
            </View>
            <GrayMediumText
                text={'Please enter the verification code sent to your email.'}
                _style={styles.para}
            />
            <View>
                <Controller
                    name="code"
                    control={control}
                    rules={{
                        required: {
                            value: true,
                            message: 'Otp is required',
                        },
                        minLength: {
                            value: 4,
                            message: 'Otp is incomplete',
                        },
                    }}
                    render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                            label="Enter your verification code?"
                            placeholder={'Code'}
                            value={value}
                            required
                            onChangeText={onChange}
                            keyboardType="number-pad"
                        />
                    )}
                />

                {errors.code?.message && (
                    <GrayMediumText
                        _style={{ color: colors.theme.lightRed }}
                        text={errors.code.message}
                    />
                )}


            </View>
            <View style={{ alignItems: 'center' }}>
                <CustomButton
                    isFocused={true}
                    title={'Verify'}
                    onPress={handleSubmit(onSubmit)}
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
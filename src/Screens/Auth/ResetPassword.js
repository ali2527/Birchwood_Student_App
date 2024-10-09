import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import CustomButton from '../../Components/Button'
import GlroyBold from '../../Components/GlroyBoldText'
import GrayMediumText from '../../Components/GrayMediumText'
import CustomTextInput from '../../Components/InputField'
import routes from '../../Navigation/routes'
import { asyncResetPassword } from '../../Stores/actions/user.action'
import { colors } from '../../theme/colors'

export default function ResetPassword({ data }) {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
    } = useForm({
        defaultValues: {
            email: '',
            code: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (data.email && data.code) {
            setValue('email', data.email);
            setValue('code', data.code);
        }
    }, [data.email, data.code, setValue]);

    const onSubmit = useCallback(
        async (body) => {
            const res = await dispatch(asyncResetPassword(body)).unwrap();

            if (res.status) {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: routes.screens.homeScreen }],
                    })
                );
            }
        },
        [navigation, dispatch]
    );

    return (
        <View style={styles.contanier}>
            <View style={styles.heading}>
                <GlroyBold text={'Reset Password?'} _style={{ color: colors.text.black }} />
            </View>
            <GrayMediumText
                text={'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
                _style={styles.para}
            />
            <View>
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
                            placeholder={'Enter password'}
                            value={value}
                            required
                            onChangeText={onChange}
                            password={true}
                        />
                    )}
                />

                {errors.password?.message && (
                    <GrayMediumText
                        _style={{ color: colors.theme.lightRed }}
                        text={errors.password.message}
                    />
                )}

                <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                        required: {
                            value: true,
                            message: 'Confirm Password is required',
                        },
                        validate: {
                            matchesPreviousPassword: value => {
                                const { password } = getValues();
                                return (
                                    (value && password === value) || 'Passwords do not match'
                                );
                            },
                        },
                    }}
                    render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                            label="Confirm New Password"
                            placeholder={'Enter password to confirm'}
                            value={value}
                            required
                            onChangeText={onChange}
                            password={true}
                        />
                    )}
                />

                {errors.confirmPassword?.message && (
                    <GrayMediumText
                        _style={{ color: colors.theme.lightRed }}
                        text={errors.confirmPassword.message}
                    />
                )}
            </View>
            <View style={{ alignItems: 'center' }}>
                <CustomButton
                    isFocused={true}
                    title={'Next'}
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
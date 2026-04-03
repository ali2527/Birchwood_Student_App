import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import CustomButton from '../../Components/Button';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import CustomTextInput from '../../Components/InputField';
import routes from '../../Navigation/routes';
import { asyncResetPassword } from '../../Stores/actions/user.action';
import { colors } from '../../theme/colors';
import { useAppDispatch } from '../../Stores/hooks';

export default function ResetPassword({ data }) {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async ({ password, confirmPassword }) => {
      const res = await dispatch(
        asyncResetPassword({
          email: data?.email ?? '',
          code: data?.code ?? '',
          password,
          confirmPassword,
        })
      ).unwrap();

      if (res.status) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routes.navigator.signin }],
          })
        );
      }
    },
    [navigation, dispatch, data?.email, data?.code]
  );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <GlroyBold
          text="Reset password"
          _style={{ color: colors.text.black }}
        />
      </View>
      <GrayMediumText
        text="Choose a new password for your account."
        _style={styles.para}
      />
      <View>
        <Controller
          name="password"
          control={control}
          rules={{
            required: { value: true, message: 'Password is required' },
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="New password"
              placeholder="Enter new password"
              value={value}
              required
              onChangeText={onChange}
              password
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
              message: 'Confirm password is required',
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
              label="Confirm new password"
              placeholder="Re-enter password"
              value={value}
              required
              onChangeText={onChange}
              password
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
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <CustomButton
          isFocused
          title="Update password"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  para: {
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
  heading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, {useCallback} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {StyleSheet, Text, View} from 'react-native';
import AuthField from '../../Components/Auth/AuthField';
import CustomButton from '../../Components/Button';
import fonts from '../../Assets/fonts';
import {asyncEmailVerification} from '../../Stores/actions/user.action';
import {useAppDispatch} from '../../Stores/hooks';

export default function ForgotPassword({data, handleScreen}) {
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      email: data?.email || '',
    },
  });

  const onSubmit = useCallback(
    async body => {
      const email = body.email.trim().toLowerCase();
      const res = await dispatch(
        asyncEmailVerification({email}),
      ).unwrap();

      if (res?.status) {
        // Keep PLAIN email for verify/reset — encodedEmail is not a valid email.
        handleScreen({
          index: 2,
          email,
        });
      }
    },
    [dispatch, handleScreen],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter the parent email on your account. We'll send a 4-digit code to
        reset your password.
      </Text>

      <Controller
        name="email"
        control={control}
        rules={{
          required: {value: true, message: 'Email is required'},
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: 'Enter a valid email address',
          },
        }}
        render={({field: {onChange, value}}) => (
          <AuthField
            label="Email"
            placeholder="parent@email.com"
            leftIcon="mail"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email?.message}
          />
        )}
      />

      <CustomButton
        isFocused
        title="Send Reset Code"
        onPress={handleSubmit(onSubmit)}
        containerStyle={styles.primaryBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 26,
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#9CA3AF',
    marginBottom: 28,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    marginTop: 12,
    marginVertical: 0,
    paddingHorizontal: 16,
  },
});

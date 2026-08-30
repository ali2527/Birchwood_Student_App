import React, {useCallback, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import AuthField from '../../Components/Auth/AuthField';
import CustomButton from '../../Components/Button';
import fonts from '../../Assets/fonts';
import {asyncOtpVerification} from '../../Stores/actions/user.action';
import {useAppDispatch} from '../../Stores/hooks';

export default function VerificationCode({data, handleScreen}) {
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm({
    defaultValues: {
      email: data?.email || '',
      code: '',
    },
  });

  useEffect(() => {
    if (data?.email) {
      setValue('email', data.email);
    }
  }, [data?.email, setValue]);

  const onSubmit = useCallback(
    async body => {
      const payload = {
        email: (data?.email || body.email || '').trim().toLowerCase(),
        code: String(body.code || '').trim(),
      };
      const res = await dispatch(asyncOtpVerification(payload)).unwrap();

      if (res.status) {
        handleScreen({
          index: 3,
          email: payload.email,
          code: payload.code,
        });
      }
    },
    [dispatch, handleScreen, data?.email],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification Code</Text>
      <Text style={styles.subtitle}>
        Enter the 4-digit code we emailed to {data?.email || 'your inbox'}.
      </Text>

      <Controller
        name="code"
        control={control}
        rules={{
          required: {value: true, message: 'Verification code is required'},
          minLength: {value: 4, message: 'Code must be 4 digits'},
          maxLength: {value: 4, message: 'Code must be 4 digits'},
          pattern: {
            value: /^\d{4}$/,
            message: 'Enter the 4-digit code from your email',
          },
        }}
        render={({field: {onChange, value}}) => (
          <AuthField
            label="Verification Code"
            placeholder="e.g. 4584"
            leftIcon="shield"
            value={value}
            onChangeText={text => onChange(text.replace(/[^\d]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.code?.message}
          />
        )}
      />

      <CustomButton
        isFocused
        title="Verify"
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

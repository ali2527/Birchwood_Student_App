import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import CustomButton from '../../Components/Button';
import CustomTextInput from '../../Components/InputField';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import { asyncEmailVerification } from '../../Stores/actions/user.action';
import { colors } from '../../theme/colors';
import { useAppDispatch } from '../../Stores/hooks';

export default function ForgotPassword({ data, handleScreen }) {
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: data?.email || '',
    },
  });

  const onSubmit = useCallback(
    async body => {
      const res = await dispatch(asyncEmailVerification(body)).unwrap();

      if (res?.data?.encodedEmail) {
        handleScreen({
          index: 2,
          email: res.data.encodedEmail,
        });
      }
    },
    [dispatch, handleScreen]
  );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <GlroyBold
          text="Forgot password?"
          _style={{ color: colors.text.black }}
        />
      </View>
      <GrayMediumText
        text="Enter the email linked to your account. We will send a verification code to reset your password."
        _style={styles.para}
      />
      <View>
        <Controller
          name="email"
          control={control}
          rules={{
            required: { value: true, message: 'Email is required' },
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Email format is invalid',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Email address"
              placeholder="your@email.com"
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
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <CustomButton
          isFocused
          title="Submit"
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

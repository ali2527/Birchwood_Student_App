import {CommonActions, useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {StyleSheet, Text, View} from 'react-native';
import AuthField from '../../Components/Auth/AuthField';
import CustomButton from '../../Components/Button';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {asyncResetPassword} from '../../Stores/actions/user.action';
import {useAppDispatch} from '../../Stores/hooks';

const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPassword({data}) {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async ({password, confirmPassword}) => {
      const res = await dispatch(
        asyncResetPassword({
          email: data?.email ?? '',
          code: data?.code ?? '',
          password,
          confirmPassword,
        }),
      ).unwrap();

      if (res.status) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: routes.navigator.signin}],
          }),
        );
      }
    },
    [navigation, dispatch, data?.email, data?.code],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Use at least 8 characters with uppercase, lowercase, a number, and a
        symbol.
      </Text>

      <Controller
        name="password"
        control={control}
        rules={{
          required: {value: true, message: 'Password is required'},
          validate: value =>
            STRONG_PASSWORD_RE.test(value) ||
            'Password is too weak — follow the rules above',
        }}
        render={({field: {onChange, value}}) => (
          <AuthField
            label="New Password"
            placeholder="Create a strong password"
            leftIcon="lock"
            password
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        rules={{
          required: {value: true, message: 'Confirm password is required'},
          validate: {
            matchesPreviousPassword: value => {
              const {password} = getValues();
              return (value && password === value) || 'Passwords do not match';
            },
          },
        }}
        render={({field: {onChange, value}}) => (
          <AuthField
            label="Confirm New Password"
            placeholder="Re-enter your password"
            leftIcon="lock"
            password
            value={value}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      <CustomButton
        isFocused
        title="Reset Password"
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

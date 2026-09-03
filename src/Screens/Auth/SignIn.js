import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import Icon from 'react-native-vector-icons/Feather';
import AuthShell from '../../Components/Auth/AuthShell';
import AuthField from '../../Components/Auth/AuthField';
import CustomButton from '../../Components/Button';
import MainLogo from '../../Components/MainLogo';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {asyncLogin} from '../../Stores/actions/user.action';
import {useAppDispatch} from '../../Stores/hooks';
import {colors} from '../../theme/colors';
import {WIDTH} from '../../theme/units';

const SignIn = ({navigation}) => {
  const dispatch = useAppDispatch();
  const [rememberMe, setRememberMe] = useState(true);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async body => {
      try {
        await dispatch(
          asyncLogin({
            email: String(body.email || '').trim().toLowerCase(),
            password: body.password,
            rememberMe,
          }),
        ).unwrap();
      } catch {
        /* errors from thunk / flash message */
      }
    },
    [rememberMe, dispatch],
  );

  return (
    <AuthShell showBack>
      <View style={styles.brand}>
        <MainLogo _style={styles.logo} />
      </View>

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in with your parent email</Text>

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

      <Controller
        name="password"
        control={control}
        rules={{
          required: {value: true, message: 'Password is required'},
        }}
        render={({field: {onChange, value}}) => (
          <AuthField
            label="Password"
            placeholder="Enter your password"
            leftIcon="lock"
            password
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      <View style={styles.rowBetween}>
        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() => setRememberMe(v => !v)}
          activeOpacity={0.7}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
            {rememberMe ? (
              <Icon name="check" size={12} color="#FFF" />
            ) : null}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(routes.navigator.passwordresetscreens)
          }
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        isFocused
        title="Sign In"
        onPress={handleSubmit(onSubmit)}
        containerStyle={styles.primaryBtn}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerMuted}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(routes.navigator.signup)}
          hitSlop={{top: 10, bottom: 10, left: 4, right: 4}}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </AuthShell>
  );
};

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    marginTop: 0,
    width: WIDTH * 0.56,
    height: 56,
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
    color: '#9CA3AF',
    marginBottom: 28,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  checkboxOn: {
    backgroundColor: colors.theme.primary,
    borderColor: colors.theme.primary,
  },
  rememberText: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: '#6B7280',
  },
  forgot: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: colors.theme.primary,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    marginVertical: 0,
    paddingHorizontal: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    flexWrap: 'wrap',
  },
  footerMuted: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: colors.theme.primary,
  },
});

export default SignIn;

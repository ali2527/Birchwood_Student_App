import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../Components/Button';
import ChildLogo from '../../Components/ChildLogo';
import CustomTextInput from '../../Components/InputField';
import MainLogo from '../../Components/MainLogo';
import SmallText from '../../Components/SmallText';
import { colors, appShadow } from '../../theme/colors';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch } from '../../Stores/hooks';
import routes from '../../Navigation/routes';
import GrayMediumText from '../../Components/GrayMediumText';
import { asyncLogin } from '../../Stores/actions/user.action';

const SignIn = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const keyboardDidShowListener = Keyboard.addListener(show, () =>
      setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(hide, () =>
      setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleForgotPassword = () => {
    navigation.navigate(routes.navigator.passwordresetscreens);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async body => {
      const res = await dispatch(asyncLogin(body)).unwrap();
      console.log('res::::::', res);
      if (res.status && res.data?.token) {
        navigation.navigate(routes.screens.homeScreen);
      }
    },
    [navigation, dispatch]
  );

  return (
    <LinearGradient
      colors={[colors.theme.primary, '#0a4a8a', colors.theme.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEnabled
            bounces={isKeyboardVisible}>
            <View style={styles.hero}>
              <View style={styles.logoWrap}>
                <MainLogo />
              </View>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to continue to your dashboard
              </Text>
            </View>

            <View style={[styles.card, appShadow]}>
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
                    placeholder="you@example.com"
                    value={value}
                    required
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.email?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.email.message}
                />
              )}

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
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    required
                    password
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.password?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.password.message}
                />
              )}

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotRow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <SmallText
                  text="Forgot password?"
                  _style={styles.forgotPasswordText}
                />
              </TouchableOpacity>

              <View style={styles.buttonWrap}>
                <CustomButton
                  isFocused
                  title="Sign in"
                  onPress={handleSubmit(onSubmit)}
                  containerStyle={styles.signInButton}
                />
              </View>
            </View>

            <View style={styles.footerLogo}>
              <ChildLogo _style={styles.childLogo} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 8,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.theme.white,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.text.dimWhite,
    textAlign: 'center',
    opacity: 0.95,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: colors.theme.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 20,
  },
  fieldError: {
    color: colors.theme.lightRed,
    marginTop: -4,
    marginBottom: 8,
    fontSize: 12,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 8,
  },
  forgotPasswordText: {
    textDecorationLine: 'underline',
    color: colors.theme.primary,
    fontSize: 13,
  },
  buttonWrap: {
    alignItems: 'stretch',
    marginTop: 12,
  },
  signInButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
  },
  footerLogo: {
    alignItems: 'center',
    marginTop: 8,
  },
  childLogo: {
    height: 100,
    width: 200,
    opacity: 0.95,
  },
});

export default SignIn;

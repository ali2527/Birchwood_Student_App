import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(28)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(36)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.spring(heroTranslateY, {
          toValue: 0,
          friction: 9,
          tension: 68,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 72,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();
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
      try {
        const res = await dispatch(asyncLogin(body)).unwrap();
        if (res.status && res.data?.token) {
          navigation.navigate(routes.screens.homeScreen);
        }
      } catch {
        /* errors from thunk / flash message */
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
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
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
            <Animated.View
              style={[
                styles.hero,
                {
                  opacity: heroOpacity,
                  transform: [{ translateY: heroTranslateY }],
                },
              ]}>
              <Animated.View
                style={[
                  styles.logoWrap,
                  { transform: [{ scale: logoScale }] },
                ]}>
                <MainLogo />
              </Animated.View>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to continue to your dashboard
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                appShadow,
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}>
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
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
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
            </Animated.View>

            <Animated.View style={[styles.footerLogo, { opacity: footerOpacity }]}>
              <ChildLogo _style={styles.childLogo} />
            </Animated.View>
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
    borderWidth: 1,
    borderColor: 'rgba(3, 83, 146, 0.08)',
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

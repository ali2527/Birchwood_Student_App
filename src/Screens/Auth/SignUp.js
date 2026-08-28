import { CheckBox } from '@rneui/themed';
import React, { useCallback, useState } from 'react';
import {
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
import GrayMediumText from '../../Components/GrayMediumText';
import CustomTextInput from '../../Components/InputField';
import MainLogo from '../../Components/MainLogo';
import routes from '../../Navigation/routes';
import { colors, appShadow } from '../../theme/colors';
import { Controller, useForm } from 'react-hook-form';
import { asyncSignup } from '../../Stores/actions/user.action';
import { useAppDispatch } from '../../Stores/hooks';

export default function SignUp({ navigation }) {
  const dispatch = useAppDispatch();
  const [rememberPassword, setRememberPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      fatherFirstName: '',
      fatherLastName: '',
      motherFirstName: '',
      motherLastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async body => {
      try {
        const res = await dispatch(asyncSignup(body)).unwrap();
        if (res.status === true) {
          navigation.navigate(routes.screens.homeScreen);
        }
      } catch {
        /* errors surfaced via asyncSignup / global handlers */
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
            showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <View style={styles.logoWrap}>
                <MainLogo />
              </View>
              <Text style={styles.heroEyebrow}>New account</Text>
              <Text style={styles.welcomeTitle}>Create your account</Text>
              <Text style={styles.welcomeSubtitle}>
                Register as a parent to access your child’s school portal.
              </Text>
            </View>

            <View style={[styles.card, appShadow]}>
              <Text style={styles.sectionLabel}>Father</Text>
              <Controller
                name="fatherFirstName"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Father first name is required',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="First name"
                    onChangeText={onChange}
                    placeholder="First name"
                    value={value}
                    required
                  />
                )}
              />
              {errors.fatherFirstName?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.fatherFirstName.message}
                />
              )}

              <Controller
                name="fatherLastName"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Father last name is required',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Last name"
                    onChangeText={onChange}
                    placeholder="Last name"
                    value={value}
                    required
                  />
                )}
              />
              {errors.fatherLastName?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.fatherLastName.message}
                />
              )}

              <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                Mother
              </Text>
              <Controller
                name="motherFirstName"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Mother first name is required',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="First name"
                    onChangeText={onChange}
                    placeholder="First name"
                    value={value}
                    required
                  />
                )}
              />
              {errors.motherFirstName?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.motherFirstName.message}
                />
              )}

              <Controller
                name="motherLastName"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Mother last name is required',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Last name"
                    onChangeText={onChange}
                    placeholder="Last name"
                    value={value}
                    required
                  />
                )}
              />
              {errors.motherLastName?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.motherLastName.message}
                />
              )}

              <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                Contact
              </Text>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Phone number is required',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Phone number"
                    placeholder="Mobile number"
                    value={value}
                    required
                    keyboardType="phone-pad"
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.phone?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.phone.message}
                />
              )}

              <Controller
                name="email"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Email is required',
                  },
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

              <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                Security
              </Text>
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
                    message: 'Password must be at least 8 characters',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Password"
                    placeholder="At least 8 characters"
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

              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Please confirm your password',
                  },
                  validate: value => {
                    const password = getValues('password');
                    return value === password || 'Passwords do not match';
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Confirm password"
                    placeholder="Re-enter password"
                    value={value}
                    required
                    password
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.confirmPassword?.message && (
                <GrayMediumText
                  _style={styles.fieldError}
                  text={errors.confirmPassword.message}
                />
              )}

              <CheckBox
                checked={rememberPassword}
                title="Remember password on this device"
                textStyle={styles.checkboxText}
                checkedColor={colors.theme.primary}
                containerStyle={styles.checkboxContainer}
                wrapperStyle={styles.checkboxWrapper}
                onPress={() => setRememberPassword(v => !v)}
              />

              <View style={styles.buttonWrap}>
                <CustomButton
                  isFocused
                  title="Create account"
                  onPress={handleSubmit(onSubmit)}
                  containerStyle={styles.signUpButton}
                />
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(routes.navigator.signin)}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerLogo}>
              <ChildLogo _style={styles.childLogo} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
    paddingBottom: 32,
    paddingTop: 8,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoWrap: {
    marginBottom: 14,
    paddingVertical: 6,
  },
  heroEyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Glory-Bold',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.theme.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.text.dimWhite,
    textAlign: 'center',
    opacity: 0.95,
    paddingHorizontal: 8,
    lineHeight: 20,
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.theme.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(3, 83, 146, 0.08)',
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.theme.primary,
    fontFamily: 'Glory-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 2,
  },
  sectionLabelSpaced: {
    marginTop: 14,
  },
  fieldError: {
    color: colors.theme.lightRed,
    marginTop: -6,
    marginBottom: 4,
    fontSize: 12,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 4,
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  checkboxWrapper: {
    marginLeft: 0,
  },
  checkboxText: {
    fontSize: 13,
    color: colors.text.greyAlt2,
    fontWeight: '500',
    fontFamily: 'Glory-Medium',
  },
  buttonWrap: {
    alignItems: 'stretch',
    marginTop: 8,
    marginBottom: 4,
  },
  signUpButton: {
    width: '100%',
    height: 40,
    paddingVertical: 0,
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  footerMuted: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'Glory-Medium',
  },
  footerLink: {
    fontSize: 14,
    color: colors.theme.white,
    fontFamily: 'Glory-Bold',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255,255,255,0.6)',
  },
  footerLogo: {
    alignItems: 'center',
    marginTop: 4,
  },
  childLogo: {
    height: 88,
    width: 180,
    opacity: 0.92,
  },
});

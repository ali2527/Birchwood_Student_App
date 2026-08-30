import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import AuthShell from '../../Components/Auth/AuthShell';
import AuthField from '../../Components/Auth/AuthField';
import CustomButton from '../../Components/Button';
import MainLogo from '../../Components/MainLogo';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {asyncLogin, asyncSignup} from '../../Stores/actions/user.action';
import {useAppDispatch} from '../../Stores/hooks';
import {asyncShowSuccess} from '../../Stores/actions/common.action';
import {colors} from '../../theme/colors';
import {WIDTH} from '../../theme/units';

const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const STEPS = [
  {title: 'Parent Details', subtitle: 'Father and mother information'},
  {title: 'Contact', subtitle: 'How we can reach you'},
  {title: 'Security', subtitle: 'Create a strong password'},
];

export default function SignUp({navigation}) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);

  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
    trigger,
  } = useForm({
    defaultValues: {
      fatherFirstName: '',
      fatherLastName: '',
      motherFirstName: '',
      motherLastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const goNext = useCallback(async () => {
    const fieldsByStep = [
      [
        'fatherFirstName',
        'fatherLastName',
        'motherFirstName',
        'motherLastName',
      ],
      ['email', 'phone'],
      ['password', 'confirmPassword'],
    ];
    const ok = await trigger(fieldsByStep[step]);
    if (ok) {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  }, [step, trigger]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1);
      return;
    }
    navigation.goBack();
  }, [navigation, step]);

  const onSubmit = useCallback(
    async form => {
      const body = {
        fatherFirstName: form.fatherFirstName.trim(),
        fatherLastName: form.fatherLastName.trim(),
        motherFirstName: form.motherFirstName.trim(),
        motherLastName: form.motherLastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      try {
        const res = await dispatch(asyncSignup(body)).unwrap();
        if (res.status === true) {
          // Backend does not return a token on signup — sign in for USER token.
          const loginRes = await dispatch(
            asyncLogin({
              email: body.email,
              password: body.password,
            }),
          ).unwrap();
          if (loginRes.status && loginRes.data?.token) {
            dispatch(
              asyncShowSuccess('Account created. Welcome to Birchwood!'),
            );
            navigation.navigate(routes.screens.homeScreen);
          } else {
            dispatch(
              asyncShowSuccess(
                'Account created. Please sign in with your email and password.',
              ),
            );
            navigation.navigate(routes.navigator.signin);
          }
        }
      } catch {
        /* errors from thunks / flash */
      }
    },
    [navigation, dispatch],
  );

  const stepMeta = STEPS[step];

  return (
    <AuthShell showBack onBack={goBack}>
      <View style={styles.brand}>
        <MainLogo _style={styles.logo} />
      </View>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join our learning community</Text>

      <View style={styles.stepRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.stepDot, i <= step && styles.stepDotActive]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {step + 1} of {STEPS.length}: {stepMeta.title}
      </Text>
      <Text style={styles.stepHint}>{stepMeta.subtitle}</Text>

      {step === 0 && (
        <>
          <Text style={styles.section}>Father</Text>
          <Controller
            name="fatherFirstName"
            control={control}
            rules={{
              required: {value: true, message: 'Father first name is required'},
              minLength: {
                value: 3,
                message: 'First name must be at least 3 characters',
              },
            }}
            render={({field: {onChange, value}}) => (
              <AuthField
                label="Father First Name"
                placeholder="e.g. James"
                leftIcon="user"
                value={value}
                onChangeText={onChange}
                error={errors.fatherFirstName?.message}
              />
            )}
          />
          <Controller
            name="fatherLastName"
            control={control}
            rules={{
              required: {value: true, message: 'Father last name is required'},
            }}
            render={({field: {onChange, value}}) => (
              <AuthField
                label="Father Last Name"
                placeholder="e.g. William"
                leftIcon="user"
                value={value}
                onChangeText={onChange}
                error={errors.fatherLastName?.message}
              />
            )}
          />
          <Text style={styles.section}>Mother</Text>
          <Controller
            name="motherFirstName"
            control={control}
            rules={{
              required: {value: true, message: 'Mother first name is required'},
              minLength: {
                value: 3,
                message: 'First name must be at least 3 characters',
              },
            }}
            render={({field: {onChange, value}}) => (
              <AuthField
                label="Mother First Name"
                placeholder="e.g. Helen"
                leftIcon="user"
                value={value}
                onChangeText={onChange}
                error={errors.motherFirstName?.message}
              />
            )}
          />
          <Controller
            name="motherLastName"
            control={control}
            rules={{
              required: {value: true, message: 'Mother last name is required'},
            }}
            render={({field: {onChange, value}}) => (
              <AuthField
                label="Mother Last Name"
                placeholder="e.g. William"
                leftIcon="user"
                value={value}
                onChangeText={onChange}
                error={errors.motherLastName?.message}
              />
            )}
          />
        </>
      )}

      {step === 1 && (
        <>
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
            name="phone"
            control={control}
            rules={{
              required: {value: true, message: 'Phone number is required'},
              minLength: {
                value: 8,
                message: 'Enter a valid phone number',
              },
            }}
            render={({field: {onChange, value}}) => (
              <AuthField
                label="Phone Number"
                placeholder="e.g. 5550201234"
                leftIcon="phone"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.passwordHint}>
            Use at least 8 characters with uppercase, lowercase, a number, and a
            symbol (e.g. Parent@12345).
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
                label="Password"
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
              required: {value: true, message: 'Please confirm your password'},
              validate: value =>
                value === getValues('password') || 'Passwords do not match',
            }}
            render={({field: {onChange, value}}) => (
              <AuthField
                label="Confirm Password"
                placeholder="Re-enter your password"
                leftIcon="lock"
                password
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </>
      )}

      {step < STEPS.length - 1 ? (
        <CustomButton
          isFocused
          title="Continue"
          onPress={goNext}
          containerStyle={styles.primaryBtn}
        />
      ) : (
        <CustomButton
          isFocused
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          containerStyle={styles.primaryBtn}
        />
      )}

      <View style={styles.footerRow}>
        <Text style={styles.footerMuted}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(routes.navigator.signin)}
          hitSlop={{top: 10, bottom: 10, left: 4, right: 4}}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    marginTop: 0,
    width: WIDTH * 0.52,
    height: 52,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 24,
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  stepDotActive: {
    backgroundColor: colors.theme.primary,
  },
  stepLabel: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  stepHint: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 22,
  },
  section: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    color: colors.theme.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  passwordHint: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    marginTop: 16,
    marginVertical: 0,
    paddingHorizontal: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
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

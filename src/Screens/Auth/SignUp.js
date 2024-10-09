import { CheckBox } from '@rneui/themed';
import React, { useCallback, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import CustomButton from '../../Components/Button';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import CustomTextInput from '../../Components/InputField';
import MainLogo from '../../Components/MainLogo';
import CustomStatusBar from '../../Components/StatusBar';
import routes from '../../Navigation/routes';
import { colors } from '../../theme/colors';
import { Controller, useForm } from 'react-hook-form';
import { asyncSignup } from '../../Stores/actions/user.action';
import { useAppDispatch } from '../../Stores/hooks';

export default function SignUp({ navigation }) {

  const dispatch = useAppDispatch()
  const [rememberPassword, setRememberPassword] = useState(false);

  function handleChange(name, value) {
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({
    defaultValues: {
      fatherFirstName: "",
      fatherLastName: "",
      motherFirstName: "",
      motherLastName: "",
      phone: "",
      email: "",
      password: ""
    }
  })

  const onSubmit = useCallback(
    async (body) => {
      const res = await dispatch(asyncSignup(body)).unwrap();
      if (res.status) {
        navigation.navigate(routes.screens.homeScreen);
      }
    },
    [navigation, dispatch]
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <CustomStatusBar
          backgroundColor={colors.theme.white}
          barStyle="dark-content"
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
        // behavior="padding"
        // enabled
        >
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <MainLogo />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Your other components/content here */}
            <View style={{ alignItems: 'center' }}>
              <GlroyBold text={'Sign UP'} _style={styles.head} />
            </View>

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
                  label="Father First Name"
                  name={'fatherFirstName'}
                  onChangeText={onChange}
                  placeholder={'Enter father first name'}
                  value={value}
                  required
                />
              )} />

            {errors.fatherFirstName?.message && (
              <GrayMediumText
                _style={{ color: colors.theme.lightRed }}
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
                  label="Father Last Name"
                  name={'fatherLastName'}
                  onChangeText={onChange}
                  placeholder={'Enter father last name'}
                  value={value}
                  required
                />
              )} />

            {errors.fatherLastName?.message && (
              <GrayMediumText
                _style={{ color: colors.theme.lightRed }}
                text={errors.fatherLastName.message}
              />
            )}
           
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
                  label="Mother First Name"
                  name={'motherFirstName'}
                  onChangeText={onChange}
                  placeholder={'Enter mother first name'}
                  value={value}
                  required
                />
              )} />

            {errors.fatherFirstName?.message && (
              <GrayMediumText
                _style={{ color: colors.theme.lightRed }}
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
                  label="Father Last Name"
                  name={'fatherLastName'}
                  onChangeText={onChange}
                  placeholder={'Enter father last name'}
                  value={value}
                  required
                />
              )} />

            {errors.fatherLastName?.message && (
              <GrayMediumText
                _style={{ color: colors.theme.lightRed }}
                text={errors.fatherLastName.message}
              />
            )}

            {/* <CustomTextInput
              label="Last Name"
              name={'last_name'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'last name'}
              // value={formData.last_name}
              required
            /> */}

            {/* <CustomTextInput
              label="Email Address"
              name={'email'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'email'}
              value={formData.email}
              required
            /> */}
            <CustomTextInput
              label="Password"
              name={'password'}
              placeholder={'password'}
              // value={formData.password}
              required
              password={true}
              onChangeText={(name, value) => handleChange(name, value)}
            />
            <CustomTextInput
              label="Confirm Password"
              name={'confirm_password'}
              placeholder={'confirm password'}
              // value={formData.confirm_password}
              required
              password={true}
              onChangeText={(name, value) => handleChange(name, value)}
            />

            <CheckBox
              checked={rememberPassword}
              title="Remember Password"
              textStyle={{
                fontSize: 12,
                color: colors.text.altGrey,
              }}
              checkedColor={colors.theme.primary}
              onIconPress={() =>
                setRememberPassword(rememberPassword => !rememberPassword)
              }
            />
            <View style={{ alignItems: 'center' }}>
              <CustomButton
                isFocused={true}
                title={'Next'}
                onPress={() =>
                  navigation.navigate(routes.navigator.personalInfo)
                }
              />
            </View>

            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <GrayMediumText text={'Already have account?'} />
              <TouchableOpacity
                style={{ marginHorizontal: 2 }}
                onPress={() => navigation.navigate(routes.navigator.signin)}>
                <Text style={{ color: colors.theme.primary, fontWeight: 'bold' }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add more TextInput fields as needed */}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'green'
  },
  scrollContainer: {
    flexGrow: 1,
    // justifyContent: 'center',
    padding: 16,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  head: {
    // marginTop: 0,
    color: colors.text.black,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  checkboxLabel: {
    marginLeft: 8,
  },
});

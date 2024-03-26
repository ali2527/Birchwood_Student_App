import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, {useState} from 'react';
import CustomStatusBar from '../../Components/StatusBar';
import {colors} from '../../theme/colors';
import MainLogo from '../../Components/MainLogo';
import CustomButton from '../../Components/Button';
import GlroyBold from '../../Components/GlroyBoldText';
import {useNavigation} from '@react-navigation/native';
import routes from '../../Navigation/routes';
import GrayMediumText from '../../Components/GrayMediumText';
import CustomTextInput from '../../Components/InputField';
import {CheckBox} from '@rneui/themed';

export default function SignUp() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [rememberPassword, setRememberPassword] = useState(false);
  const navigation = useNavigation();

  function handleChange(name, value) {
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <CustomStatusBar
          backgroundColor={colors.theme.white}
          barStyle="dark-content"
        />
        <KeyboardAvoidingView
          style={{flex: 1}}
          // behavior="padding"
          // enabled
        >
          <View style={{alignItems: 'center', paddingVertical: 20}}>
            <MainLogo />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Your other components/content here */}
            <View style={{alignItems: 'center'}}>
              <GlroyBold text={'Sign UP'} _style={styles.head} />
            </View>

            <CustomTextInput
              label="First Name"
              name={'first_name'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'first name'}
              value={formData.first_name}
              required
            />
            <CustomTextInput
              label="Last Name"
              name={'last_name'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'last name'}
              value={formData.last_name}
              required
            />
            <CustomTextInput
              label="Email Address"
              name={'email'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'email'}
              value={formData.email}
              required
            />
            <CustomTextInput
              label="Password"
              name={'password'}
              placeholder={'password'}
              value={formData.password}
              required
              password={true}
              onChangeText={(name, value) => handleChange(name, value)}
            />
            <CustomTextInput
              label="Confirm Password"
              name={'confirm_password'}
              placeholder={'confirm password'}
              value={formData.confirm_password}
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
            <View style={{alignItems: 'center'}}>
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
                style={{marginHorizontal: 2}}
                onPress={() => navigation.navigate(routes.navigator.signin)}>
                <Text style={{color: colors.theme.primary, fontWeight: 'bold'}}>
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

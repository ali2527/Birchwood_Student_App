import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AuthShell from '../../Components/Auth/AuthShell';
import MainLogo from '../../Components/MainLogo';
import splashImage from '../../Assets/images/splash_image.png';
import ForgotPassword from './ForgotPassword';
import VerificationCode from './VerificationCode';
import ResetPassword from './ResetPassword';
import {WIDTH, HEIGHT} from '../../theme/units';

export default function PasswordResetScreens() {
  const navigation = useNavigation();
  const [screensData, setScreensData] = useState({
    index: 1,
    email: '',
    code: '',
  });

  function handleScreen(data) {
    setScreensData(prev => ({...prev, ...data}));
  }

  const screen = screensData.index;
  const showHeroTop = screen === 1;
  const showHeroBottom = screen === 3;

  const handleBack = () => {
    if (screen > 1) {
      handleScreen({index: screen - 1});
      return;
    }
    navigation.goBack();
  };

  return (
    <AuthShell showBack onBack={handleBack}>
      <View style={styles.brand}>
        <MainLogo _style={styles.logo} />
      </View>

      {showHeroTop ? (
        <Image
          source={splashImage}
          style={styles.heroTop}
          resizeMode="contain"
        />
      ) : null}

      {screen === 1 && (
        <ForgotPassword data={screensData} handleScreen={handleScreen} />
      )}
      {screen === 2 && (
        <VerificationCode data={screensData} handleScreen={handleScreen} />
      )}
      {screen === 3 && <ResetPassword data={screensData} />}

      {showHeroBottom ? (
        <Image
          source={splashImage}
          style={styles.heroBottom}
          resizeMode="contain"
        />
      ) : null}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    marginTop: 0,
    width: WIDTH * 0.52,
    height: 52,
  },
  heroTop: {
    width: WIDTH * 0.62,
    height: HEIGHT * 0.16,
    alignSelf: 'center',
    marginBottom: 12,
  },
  heroBottom: {
    width: WIDTH * 0.58,
    height: HEIGHT * 0.14,
    alignSelf: 'center',
    marginTop: 20,
  },
});

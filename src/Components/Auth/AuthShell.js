import React from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AuthBackButton from './AuthBackButton';
import whiteBg from '../../Assets/images/white_bg.png';

/** White auth layout shell — form content centered with comfortable padding. */
export default function AuthShell({
  children,
  showBack = false,
  onBack,
  scroll = true,
  contentStyle,
  bottomExtra,
}) {
  const form = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scroll, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}>
      <View style={styles.formCluster}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.flexPad, contentStyle]}>
      <View style={styles.formCluster}>{children}</View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ImageBackground
        source={whiteBg}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="cover">
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
            {showBack ? (
              <View style={styles.backRow}>
                <AuthBackButton onPress={onBack} />
              </View>
            ) : (
              <View style={styles.backSpacer} />
            )}
            {form}
          </KeyboardAvoidingView>
        </SafeAreaView>
        {bottomExtra}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bg: {
    flex: 1,
  },
  bgImage: {
    opacity: 0.55,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  backRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  backSpacer: {
    height: 12,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 48,
  },
  flexPad: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 48,
  },
  formCluster: {
    width: '100%',
  },
});

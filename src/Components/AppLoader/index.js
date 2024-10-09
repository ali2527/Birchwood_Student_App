import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

export const AppLoader = () => {
  return (
    <Modal
      statusBarTranslucent={true}
      transparent={true}
      animationType="slide"
      visible={true}
      onRequestClose={() => {}}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            style={styles.loader}
            animating={true}
            size={'large'}
            color="white"
          />

          {/* If you want to image set source here */}
          {/* <Image
              source={require('../assets/images/loader.gif')}
              style={{ height: 80, width: 80 }}
              resizeMode="contain"
              resizeMethod="resize"
            /> */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  activityIndicatorWrapper: {
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    color: '#FFF',
    justifyContent: 'space-around',
  },
  loader: {
    height: 100,
    width: 100,
    fontSize: 30,
  },
});

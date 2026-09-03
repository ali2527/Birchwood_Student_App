import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, View} from 'react-native';
import {colors} from '../../theme/colors';
import {useAppSelector} from '../../Stores/hooks';
import {selectAppLoader} from '../../Stores/slices/common.slice';

export const AppLoader = () => {
  const loading = useAppSelector(selectAppLoader);
  if (!loading) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.theme.primary} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  card: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

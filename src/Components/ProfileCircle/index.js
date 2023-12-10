import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';

const UserProfileCircle = ({ profileUri, name, onPress, disabled , _style }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={{...styles.container, ..._style}}>
        {profileUri ? (
          <Image source={profileUri} style={styles.image} />
        ) : (
          <IonIcon name={name} size={40} color={colors.text.greyAlt2}/>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor: colors.text.altGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  icon: {
    fontSize: 20,
    color: '#fff',
  },
};

export default UserProfileCircle;

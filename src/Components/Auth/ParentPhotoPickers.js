import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import fonts from '../../Assets/fonts';

export function pickParentPhoto() {
  return new Promise(resolve => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response?.didCancel || response?.errorCode) {
          resolve(null);
          return;
        }
        const asset = response?.assets?.[0];
        if (!asset?.uri) {
          resolve(null);
          return;
        }
        resolve({
          uri: asset.uri,
          name: asset.fileName || `parent-${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
      },
    );
  });
}

export function appendParentPhoto(form, field, photo) {
  if (!photo?.uri) {
    return;
  }
  form.append(field, {
    uri: photo.uri,
    name: photo.name || `${field}.jpg`,
    type: photo.type || 'image/jpeg',
  });
}

function PhotoSlot({label, uri, onPress}) {
  return (
    <TouchableOpacity style={styles.slot} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.circle}>
        {uri ? (
          <Image source={{uri}} style={styles.image} />
        ) : (
          <Icon name="camera" size={28} color="#9AA3AF" />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ParentPhotoPickers({
  fatherUri,
  motherUri,
  onPickFather,
  onPickMother,
}) {
  return (
    <View style={styles.row}>
      <PhotoSlot label="Father photo" uri={fatherUri} onPress={onPickFather} />
      <PhotoSlot label="Mother photo" uri={motherUri} onPress={onPickMother} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  slot: {
    alignItems: 'center',
    width: '48%',
  },
  circle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#111827',
  },
});

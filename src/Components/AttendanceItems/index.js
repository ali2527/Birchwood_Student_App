import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {vh, vw} from '../../theme/units';
import {colors} from '../../theme/colors';

export function AttendanceItems({item}) {
  if (item.title === 'Absent') {
    return (
      <View style={[styles.container, {borderColor: colors.theme.mehron}]}>
        <View
          style={[styles.leftBorder, {backgroundColor: colors.theme.mehron}]}
        />
        <View style={styles.content}>
          <View style={{flex: 1}}>
            <Text>Absent</Text>
          </View>
          <View
            style={[
              styles.dataContainer,
              {backgroundColor: colors.theme.lightRed},
            ]}>
            <Text style={[styles.dataTitle, {color: colors.theme.red}]}>
              {item.data}
            </Text>
          </View>
        </View>
      </View>
    );
  } else if (item.title === 'Festival & Holiday') {
    return (
      <View style={[styles.container, {borderColor: colors.theme.darkGreen}]}>
        <View
          style={[styles.leftBorder, {backgroundColor: colors.theme.darkGreen}]}
        />
        <View style={styles.content}>
          <View style={{flex: 1}}>
            <Text>Festival & Holidays</Text>
          </View>
          <View
            style={[
              styles.dataContainer,
              {backgroundColor: colors.theme.lightGreen},
            ]}>
            <Text style={[styles.dataTitle, {color: colors.theme.darkGreen}]}>
              {item.data}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: vw * 3.7,
    height: vh * 5,
    borderWidth: 1,
    borderRadius: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  leftBorder: {
    height: '100%',
    width: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  dataContainer: {
    borderRadius: 100,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

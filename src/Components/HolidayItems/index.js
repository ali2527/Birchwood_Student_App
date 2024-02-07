import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {vh, vw} from '../../theme/units';
import {colors} from '../../theme/colors';

export function HolidayItems({item, index}) {
  return (
    <>
      {index == 0 && <Text style={styles.head}>List of Holidays</Text>}
      <View style={styles.container}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.contentBody}>
          <View style={{flex: 1}}>
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <View>
            <Text>Tuesday</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    // flexDirection: 'row',
    // alignItems: 'center',
    marginHorizontal: vw * 3.7,
    borderWidth: 1,
    borderColor: colors.theme.lightGray,
    borderRadius: 10,
    padding: 10,
  },
  head: {
    fontWeight: 'bold',
    marginVertical: 10,
    marginHorizontal: vw * 3.7,
  },
  contentBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
  },
});

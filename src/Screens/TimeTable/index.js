import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import VectorIcon from '../../Components/VectorIcons';
import {colors} from '../../theme/colors';
import {featureIcons} from '../../Assets';

export default function TimeTable() {
  const [selectedDay, setSelectedDay] = useState('MON');
  const data = [
    {
      id: '123',
      class_name: 'Computer Science',
      time: '08:15 am - 09:00 am',
      status: 'seen',
      teacher: {
        name: 'Cheries James',
        period: 'Period 1',
      },
    },
    {
      id: '1234',
      class_name: 'Mathematics',
      time: '08:15 am - 09:00 am',
      status: 'seen',
      teacher: {
        name: 'Reveaka Stadman',
        period: 'Period 1',
      },
    },
    {
      id: '12345',
      class_name: 'English',
      time: '08:15 am - 09:00 am',
      status: 'seen',
      teacher: {
        name: 'Marta Mangana',
        period: 'Period 1',
      },
    },
    {
      id: '123456',
      class_name: 'Lunch Break',
      time: '08:15 am - 09:00 am',
      status: 'lunch',
      teacher: null,
    },
    {
      id: '1234567',
      class_name: 'Science',
      time: '08:15 am - 09:00 am',
      status: 'seen',
      teacher: {
        name: 'Danica Partridge',
        period: 'Period 1',
      },
    },
    {
      id: '12345678',
      class_name: 'Sociel Study',
      time: '08:15 am - 09:00 am',
      status: 'seen',
      teacher: {
        name: 'Danica Partridge',
        period: 'Period 1',
      },
    },
  ];

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  const renderItem = ({item}) => {
    return (
      <View style={styles.cardContainer}>
        <View style={{padding: 15}}>
          {item.status === 'lunch' ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={styles.titleText}>Lunch Break</Text>
                <Text style={{fontSize: 12}}>{item.time}</Text>
              </View>
              <View>
                <Image
                  source={featureIcons.lunch_break}
                  resizeMode="contain"
                  style={styles.lunch_break_icon}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.itemContent}>
                <Text style={styles.titleText}>{item.class_name}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <VectorIcon
                    type={'Ionicons'}
                    name={'checkmark-circle'}
                    size={20}
                    color={colors.theme.lightGreen}
                    style={{marginHorizontal: 3}}
                  />
                  <Text style={{fontSize: 12}}>
                    {item.status === 'seen' ? 'Seen' : null}
                  </Text>
                </View>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.titleText}>{item.time}</Text>
              </View>
              <View style={styles.borderLine} />
              <View style={styles.itemContent}>
                <Text style={styles.titleText}>{item?.teacher?.name}</Text>
                <Text style={{fontSize: 12}}>{item?.teacher?.period}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const onSelectDay = value => {
    setSelectedDay(value);
  };

  return (
    <ContainerComponent>
      <ScreenWrapperContainer title="Timetable">
        <View style={styles.container}>
          <View style={styles.stepperContainer}>
            {days.map((item, indx) => (
              <TouchableOpacity
                key={indx}
                style={
                  selectedDay === item
                    ? styles.stepperBtnSelected
                    : styles.stepperBtnUnSelected
                }
                onPress={() => onSelectDay(item)}>
                <Text
                  style={
                    selectedDay === item
                      ? styles.selectedTitle
                      : styles.unSelectedTitle
                  }>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={data}
            keyExtractor={item => `item_${item.id}`}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{margin: 10}} />}
            contentContainerStyle={styles.flatListContainer}
          />
        </View>
      </ScreenWrapperContainer>
    </ContainerComponent>
  );
}

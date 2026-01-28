import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { styles } from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import VectorIcon from '../../Components/VectorIcons';
import { colors } from '../../theme/colors';
import { featureIcons } from '../../Assets';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../Stores/hooks';
import { asyncGetAllClassTimeTable } from '../../Stores/actions/timeTable.action';
import { selectTimeTableByDay } from '../../Stores/slices/timeTable.slice';
import { selectChildren } from '../../Stores/slices/class.slice';
import { asyncGetAllMyChildren } from '../../Stores/actions/user.action';

export default function TimeTable() {
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState('MON');
  const timeTableData = useAppSelector(selectTimeTableByDay(selectedDay));
  const children = useAppSelector(selectChildren);

  // Get classroom ID from first child
  const classroomId = children?.[0]?.classroom?._id;

  console.log('Children:', children);
  console.log('Classroom ID from child:', classroomId);
  console.log('Selected Day:', selectedDay);
  console.log('TimeTable Data for day:', timeTableData);

  useEffect(() => {
    // Fetch children to get classroom data
    dispatch(asyncGetAllMyChildren());
  }, [dispatch]);

  useEffect(() => {
    // Fetch timetable only when we have classroom ID from children
    if (classroomId) {
      console.log('Fetching timetable for classroom:', classroomId);
      dispatch(asyncGetAllClassTimeTable(undefined));
    }
  }, [dispatch, classroomId]);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  const renderItem = ({ item }) => {
    // Check if it's a lunch break based on meta or description
    const isLunchBreak = item.meta === 'lunch' || item.description?.toLowerCase().includes('lunch');

    return (
      <View style={styles.cardContainer}>
        <View style={{ padding: 15 }}>
          {isLunchBreak ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={styles.titleText}>Lunch Break</Text>
                <Text style={{ fontSize: 12 }}>{item.startTime} - {item.endTime}</Text>
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
                <Text style={styles.titleText}>{item.subject}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <VectorIcon
                    type={'Ionicons'}
                    name={'checkmark-circle'}
                    size={20}
                    color={colors.theme.lightGreen}
                    style={{ marginHorizontal: 3 }}
                  />
                  <Text style={{ fontSize: 12 }}>Seen</Text>
                </View>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.titleText}>{item.startTime} - {item.endTime}</Text>
              </View>
              <View style={styles.borderLine} />
              <View style={styles.itemContent}>
                <Text style={styles.titleText}>{item.description || 'No description'}</Text>
                <Text style={{ fontSize: 12 }}>Period {item.meta || '1'}</Text>
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
            data={timeTableData}
            keyExtractor={item => `item_${item._id}`}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ margin: 10 }} />}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: colors.text.grey }}>
                  No timetable for {selectedDay}
                </Text>
              </View>
            }
          />
        </View>
      </ScreenWrapperContainer>
    </ContainerComponent>
  );
}

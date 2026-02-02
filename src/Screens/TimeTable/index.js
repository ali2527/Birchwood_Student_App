import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
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
import { selectSelectedChild } from '../../Stores/slices/class.slice';
import { asyncGetAllMyChildren } from '../../Stores/actions/user.action';
import GlroyBold from '../../Components/GlroyBoldText';

export default function TimeTable() {
  const dispatch = useDispatch();

  const getCurrentDay = () => {
    const day = moment().format('ddd').toUpperCase();
    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    return validDays.includes(day) ? day : 'MON';
  };

  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const timeTableData = useAppSelector(selectTimeTableByDay(selectedDay));
  const selectedChild = useAppSelector(selectSelectedChild);

  const getClassroomId = (child) => {
    if (!child?.classroom) return null;
    if (typeof child.classroom === 'string') return child.classroom;
    return child.classroom._id || child.classroom.classroomId || child.classroom.id;
  };

  const classroomId = getClassroomId(selectedChild);
  console.log('Classroom ID:', classroomId);
  useEffect(() => {
    console.log('DEBUG: selectedChild state:', selectedChild ? 'Present' : 'Empty');
    if (!selectedChild || !selectedChild._id) {
      console.log('DEBUG: Fetching children...');
      dispatch(asyncGetAllMyChildren());
    }
  }, [dispatch, selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      console.log('DEBUG: Full Selected Child Object:', JSON.stringify(selectedChild, null, 2));
      console.log('DEBUG: Classroom ID derived:', classroomId);
    }
    if (classroomId) {
      dispatch(asyncGetAllClassTimeTable(undefined));
    }
  }, [dispatch, classroomId, selectedChild]);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  const getSubjectIcon = (subject) => {
    const s = subject?.toLowerCase() || '';
    if (s.includes('math')) return { type: 'MaterialCommunityIcons', name: 'calculator' };
    if (s.includes('english') || s.includes('reading')) return { type: 'Ionicons', name: 'book' };
    if (s.includes('sci')) return { type: 'MaterialCommunityIcons', name: 'flask' };
    if (s.includes('art')) return { type: 'Ionicons', name: 'color-palette' };
    if (s.includes('music')) return { type: 'Ionicons', name: 'musical-notes' };
    if (s.includes('phys') || s.includes('sport') || s.includes('gym')) return { type: 'Ionicons', name: 'fitness' };
    if (s.includes('lunch') || s.includes('break')) return { type: 'Ionicons', name: 'restaurant' };
    return { type: 'Ionicons', name: 'school' }; // Default icon
  };

  const renderItem = ({ item, index }) => {
    const isLunchBreak = item.meta === 'lunch' || item.subject?.toLowerCase().includes('lunch');
    const iconData = getSubjectIcon(item.subject);

    return (
      <View style={styles.timelineRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{item.startTime}</Text>
          <Text style={styles.endTimeText}>{item.endTime}</Text>
        </View>

        <View style={styles.timelineGraphic}>
          <View style={[styles.timelineDot, { backgroundColor: isLunchBreak ? '#FF9800' : colors.theme.primary }]} />
          {index !== timeTableData.length - 1 && <View style={styles.timelineLine} />}
        </View>

        <View style={[styles.activityCard, isLunchBreak && styles.lunchCard]}>
          <View style={[styles.iconContainer, { backgroundColor: (isLunchBreak ? '#FF9800' : colors.theme.primary) + '20' }]}>
            <VectorIcon
              type={iconData.type}
              name={iconData.name}
              size={22}
              color={isLunchBreak ? '#FF9800' : colors.theme.primary}
            />
          </View>
          <View style={styles.activityInfo}>
            <GlroyBold text={item.subject} _style={styles.activityName} />
            <Text style={styles.periodText}>Period {item.meta || (index + 1)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const onSelectDay = value => {
    setSelectedDay(value);
  };

  return (
    <ContainerComponent>
      <ScreenWrapperContainer title="Class Timetable">
        <View style={styles.container}>

          <View style={styles.daySelector}>
            {days.map((item, indx) => (
              <TouchableOpacity
                key={indx}
                style={[
                  styles.dayBtn,
                  selectedDay === item && styles.dayBtnSelected
                ]}
                onPress={() => onSelectDay(item)}>
                <Text style={[
                  styles.dayText,
                  selectedDay === item && styles.dayTextSelected
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={timeTableData}
            keyExtractor={item => `item_${item._id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.timelineContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {!classroomId ? (
                  <>
                    <VectorIcon type="Ionicons" name="alert-circle-outline" size={60} color={colors.text.grey + '40'} />
                    <Text style={styles.emptyText}>Could not find your classroom information. Please contact support or try again later.</Text>
                  </>
                ) : (
                  <>
                    <VectorIcon type="Ionicons" name="calendar-outline" size={60} color={colors.text.grey + '40'} />
                    <Text style={styles.emptyText}>No activities scheduled for {selectedDay}</Text>
                  </>
                )}
              </View>
            }
          />
        </View>
      </ScreenWrapperContainer>
    </ContainerComponent>
  );
}

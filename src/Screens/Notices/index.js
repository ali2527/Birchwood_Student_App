import React, {useEffect, useMemo} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import {asyncGetAllChildHomeWorks} from '../../Stores/actions/diary.action';
import {useAppSelector} from '../../Stores/hooks';
import {selectSelectedChild} from '../../Stores/slices/class.slice';
import {selectHomeWorks} from '../../Stores/slices/diary.slice';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';

export default function Notices() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const selectedChild = useAppSelector(selectSelectedChild);
  const homeworks = useAppSelector(selectHomeWorks);
  const childId = selectedChild?._id;

  useEffect(() => {
    if (childId) {
      dispatch(asyncGetAllChildHomeWorks({childId}));
    }
  }, [dispatch, childId]);

  const items = useMemo(
    () => (homeworks || []).filter(item => item.type === 'NOTICE'),
    [homeworks],
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <View style={[styles.header, {paddingTop: Math.max(insets.top, 12) + 6}]}>
          <Text style={styles.headerTitle}>Notices</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {paddingBottom: 100 + insets.bottom},
          ]}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No notices yet</Text>
          </View>
        ) : (
          items.map(item => (
            <View key={item._id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.dueDate || item.assignDate ? (
                <Text style={styles.due}>
                  {moment(item.dueDate || item.assignDate).format('D MMM YYYY')}
                </Text>
              ) : null}
              {item.description ? (
                <Text style={styles.body}>{item.description}</Text>
              ) : null}
            </View>
          ))
        )}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  due: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
  },
  body: {
    marginTop: 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: NAVY,
    lineHeight: 19,
  },
  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: MUTED,
  },
});

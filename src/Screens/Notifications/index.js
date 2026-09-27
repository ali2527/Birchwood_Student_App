import React, {useCallback, useEffect, useMemo} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {
  asyncGetUserNotifications,
} from '../../Stores/actions/notification.action';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {selectNotifications} from '../../Stores/slices/notification.slice';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const ACCENT = '#035392';

export default function Notifications() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const items = useAppSelector(selectNotifications);

  const refresh = useCallback(() => {
    dispatch(asyncGetUserNotifications());
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const {today, earlier} = useMemo(() => {
    const start = moment().startOf('day');
    const todayItems = [];
    const earlierItems = [];
    items.forEach(item => {
      const created = moment(item.createdAt);
      if (created.isValid() && created.isSameOrAfter(start)) {
        todayItems.push(item);
      } else {
        earlierItems.push(item);
      }
    });
    return {today: todayItems, earlier: earlierItems};
  }, [items]);

  const onPressItem = item => {
    if (!item?._id) {
      return;
    }
    navigation.navigate(routes.screens.notificationDetail, {
      notificationId: item._id,
      notification: item,
    });
  };

  const renderItem = item => {
    const unread = !item.isRead;
    return (
      <TouchableOpacity
        key={item._id}
        style={[styles.card, unread && styles.cardUnread]}
        activeOpacity={0.85}
        onPress={() => onPressItem(item)}>
        <View style={styles.cardTop}>
          <Text
            style={[styles.cardTitle, unread && styles.cardTitleUnread]}
            numberOfLines={1}>
            {item.title || 'Notification'}
          </Text>
          {unread ? <View style={styles.dot} /> : null}
        </View>
        {item.createdAt ? (
          <Text style={styles.when}>
            {moment(item.createdAt).format('h:mm A')}
          </Text>
        ) : null}
        {item.content ? (
          <Text style={styles.body} numberOfLines={1}>
            {item.content}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 12) + 6}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} />
        }>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
          </View>
        ) : (
          <>
            {today.length > 0 ? (
              <>
                <Text style={styles.section}>TODAY</Text>
                {today.map(renderItem)}
              </>
            ) : null}
            {earlier.length > 0 ? (
              <>
                <Text style={styles.section}>EARLIER</Text>
                {earlier.map(renderItem)}
              </>
            ) : null}
          </>
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
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  section: {
    marginTop: 8,
    marginBottom: 8,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: '#D6E6F7',
    backgroundColor: '#F7FBFF',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
    paddingRight: 8,
  },
  cardTitleUnread: {
    color: ACCENT,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  when: {
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

import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import {asyncGetUserNotifications} from '../../Stores/actions/user.action';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';

function pickDocs(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.docs)) {
    return payload.docs;
  }
  if (Array.isArray(payload?.notifications)) {
    return payload.notifications;
  }
  return [];
}

export default function Notifications() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    dispatch(asyncGetUserNotifications())
      .unwrap()
      .then(res => {
        if (!mounted) {
          return;
        }
        setItems(pickDocs(res?.data ?? res));
      })
      .catch(() => {
        if (mounted) {
          setItems([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, [dispatch]);

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

  const renderItem = item => (
    <View key={item._id} style={styles.card}>
      <Text style={styles.cardTitle}>{item.title || 'Notification'}</Text>
      {item.createdAt ? (
        <Text style={styles.when}>{moment(item.createdAt).format('h:mm A')}</Text>
      ) : null}
      {item.content ? <Text style={styles.body}>{item.content}</Text> : null}
    </View>
  );

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
        contentContainerStyle={styles.scroll}>
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
  cardTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
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

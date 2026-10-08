import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
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
  asyncBulkUserNotifications,
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
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    dispatch(asyncGetUserNotifications());
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedItems = useMemo(
    () => items.filter(item => selectedSet.has(item._id)),
    [items, selectedSet],
  );
  const canRead = selectedItems.some(item => !item.isRead);
  const canUnread = selectedItems.some(item => item.isRead);
  const allIds = useMemo(
    () => items.map(item => item._id).filter(Boolean),
    [items],
  );
  const allSelected = allIds.length > 0 && allIds.every(id => selectedSet.has(id));

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

  const exitSelect = () => {
    setSelecting(false);
    setSelected([]);
  };

  const toggle = id => {
    if (!id) {
      return;
    }
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const onPressItem = item => {
    if (!item?._id) {
      return;
    }
    if (selecting) {
      toggle(item._id);
      return;
    }
    navigation.navigate(routes.screens.notificationDetail, {
      notificationId: item._id,
      notification: item,
    });
  };

  const onLongPressItem = item => {
    if (!item?._id) {
      return;
    }
    if (!selecting) {
      setSelecting(true);
    }
    toggle(item._id);
  };

  const runAction = action => {
    if (!selected.length || busy) {
      return;
    }
    const apply = async () => {
      setBusy(true);
      try {
        const result = await dispatch(
          asyncBulkUserNotifications({ids: selected, action}),
        );
        if (result?.payload?.status) {
          exitSelect();
          return;
        }
        Alert.alert(
          'Could not update',
          result?.payload?.message || 'Try again.',
        );
      } catch {
        Alert.alert('Could not update', 'Try again.');
      } finally {
        setBusy(false);
      }
    };

    if (action === 'delete') {
      const count = selected.length;
      Alert.alert(
        'Delete notifications',
        count === 1
          ? 'Delete this notification?'
          : `Delete ${count} notifications?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Delete', style: 'destructive', onPress: apply},
        ],
      );
      return;
    }
    apply();
  };

  const renderItem = item => {
    const unread = !item.isRead;
    const checked = selectedSet.has(item._id);
    return (
      <TouchableOpacity
        key={item._id}
        style={[
          styles.card,
          unread && styles.cardUnread,
          checked && styles.cardSelected,
        ]}
        activeOpacity={0.85}
        onPress={() => onPressItem(item)}
        onLongPress={() => onLongPressItem(item)}>
        <View style={styles.cardRow}>
          {selecting ? (
            <View style={[styles.check, checked && styles.checkOn]}>
              {checked ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : null}
            </View>
          ) : null}
          <View style={styles.cardCopy}>
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const barSpace = selecting ? 78 + Math.max(insets.bottom, 10) : 32;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 12) + 6}]}>
        <TouchableOpacity
          onPress={() => (selecting ? exitSelect() : navigation.goBack())}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons
            name={selecting ? 'close' : 'chevron-back'}
            size={22}
            color={NAVY}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {selecting ? `${selected.length} selected` : 'Notifications'}
        </Text>
        {items.length > 0 ? (
          <TouchableOpacity
            onPress={() => (selecting ? exitSelect() : setSelecting(true))}
            style={styles.selectBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.selectText}>{selecting ? 'Done' : 'Select'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.selectBtn} />
        )}
      </View>
      {selecting && items.length > 0 ? (
        <TouchableOpacity
          style={styles.selectAll}
          onPress={() => setSelected(allSelected ? [] : allIds)}
          activeOpacity={0.8}>
          <Text style={styles.selectAllText}>
            {allSelected ? 'Clear all' : 'Select all'}
          </Text>
        </TouchableOpacity>
      ) : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: barSpace}]}
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
      {selecting ? (
        <View style={[styles.bar, {paddingBottom: Math.max(insets.bottom, 10)}]}>
          <TouchableOpacity
            style={[styles.barBtn, (!canRead || busy) && styles.barBtnOff]}
            disabled={!canRead || busy}
            onPress={() => runAction('read')}>
            <Ionicons name="mail-open-outline" size={18} color={ACCENT} />
            <Text style={styles.barText}>Read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.barBtn, (!canUnread || busy) && styles.barBtnOff]}
            disabled={!canUnread || busy}
            onPress={() => runAction('unread')}>
            <Ionicons name="mail-unread-outline" size={18} color={ACCENT} />
            <Text style={styles.barText}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.barBtn, (!selected.length || busy) && styles.barBtnOff]}
            disabled={!selected.length || busy}
            onPress={() => runAction('delete')}>
            <Ionicons name="trash-outline" size={18} color="#E11D48" />
            <Text style={[styles.barText, styles.barTextDanger]}>Delete</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  selectBtn: {
    minWidth: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 6,
  },
  selectText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: ACCENT,
  },
  selectAll: {
    alignSelf: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  selectAllText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: ACCENT,
  },
  scroll: {
    paddingHorizontal: 18,
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
  cardSelected: {
    borderWidth: 1,
    borderColor: ACCENT,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardCopy: {
    flex: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C5CDD8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkOn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
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
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E8EF',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  barBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  barBtnOff: {
    opacity: 0.35,
  },
  barText: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: ACCENT,
  },
  barTextDanger: {
    color: '#E11D48',
  },
});

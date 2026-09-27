import React, {useCallback, useMemo, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {
  asyncGetUnreadUserNotices,
  asyncGetUserNotices,
} from '../../Stores/actions/notification.action';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {
  selectNotices,
  selectUnreadNoticeCount,
} from '../../Stores/slices/notification.slice';
import {
  NOTICE_TYPES,
  noticeTypeAccent,
  noticeTypeIcon,
  noticeTypeLabel,
} from '../../Utils/noticeTypes';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F2F5FA';
const BLUE = '#035392';

const TYPE_FILTERS = [{value: 'ALL', label: 'All', icon: 'apps-outline'}, ...NOTICE_TYPES];

function NoticeCard({item, onPress}) {
  const unread = !item.isRead;
  const when = moment(item.createdAt);
  const icon = noticeTypeIcon(item.type);
  const accent = noticeTypeAccent(item.type);
  return (
    <TouchableOpacity
      style={[styles.card, unread && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.85}>
      <View
        style={[
          styles.cardIcon,
          {
            backgroundColor: accent.bg,
            borderColor: accent.border,
          },
        ]}>
        <Ionicons name={icon} size={18} color={accent.color} />
      </View>
      <View style={styles.cardCopy}>
        <View style={styles.cardTop}>
          <Text
            style={[styles.cardTitle, unread && styles.cardTitleUnread]}
            numberOfLines={2}>
            {item.title || 'Notice'}
          </Text>
          {unread ? <View style={styles.dot} /> : null}
        </View>
        <Text style={[styles.cardMeta, {color: accent.color}]}>
          {noticeTypeLabel(item.type)}
          {when.isValid() ? ` · ${when.format('ddd, D MMM YYYY')}` : ''}
        </Text>
        {item.content ? (
          <Text style={styles.cardBody} numberOfLines={1}>
            {item.content}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={MUTED} />
    </TouchableOpacity>
  );
}

export default function Notices() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const notices = useAppSelector(selectNotices);
  const unreadCount = useAppSelector(selectUnreadNoticeCount);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const refresh = useCallback(() => {
    dispatch(asyncGetUserNotices());
    dispatch(asyncGetUnreadUserNotices());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const items = useMemo(() => {
    return (notices || [])
      .filter(item => {
        if (typeFilter === 'ALL') {
          return true;
        }
        return String(item.type || '').toUpperCase() === typeFilter;
      })
      .slice()
      .sort((a, b) => {
        const aDate = moment(a.createdAt).valueOf();
        const bDate = moment(b.createdAt).valueOf();
        return bDate - aDate;
      });
  }, [notices, typeFilter]);

  const emptyTitle =
    typeFilter !== 'ALL' ? 'No notices of this type' : 'No notices yet';
  const emptyBody =
    typeFilter !== 'ALL'
      ? `Nothing matches ${noticeTypeLabel(typeFilter)}. Try another type.`
      : 'School notices will appear here as soon as they are sent.';

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
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Notices</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {unreadCount > 0
              ? `${unreadCount} unread school notice${unreadCount === 1 ? '' : 's'}`
              : 'School announcements for you'}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filters}>
        {TYPE_FILTERS.map(item => {
          const on = typeFilter === item.value;
          const accent =
            item.value === 'ALL'
              ? {color: BLUE, bg: '#E8F1FA'}
              : noticeTypeAccent(item.value);
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.chip,
                on && {
                  backgroundColor: accent.color,
                  borderColor: accent.color,
                },
              ]}
              onPress={() => setTypeFilter(item.value)}
              activeOpacity={0.85}>
              <Ionicons
                name={item.icon}
                size={14}
                color={on ? '#FFFFFF' : accent.color}
              />
              <Text
                style={[
                  styles.chipText,
                  on ? styles.chipTextOn : {color: accent.color},
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} tintColor={BLUE} />
        }
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: 32 + insets.bottom},
          items.length === 0 && styles.scrollEmpty,
        ]}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                typeFilter !== 'ALL' && {
                  backgroundColor: noticeTypeAccent(typeFilter).bg,
                  borderColor: noticeTypeAccent(typeFilter).border,
                },
              ]}>
              <Ionicons
                name={
                  typeFilter === 'ALL'
                    ? 'megaphone-outline'
                    : noticeTypeIcon(typeFilter)
                }
                size={26}
                color={
                  typeFilter === 'ALL'
                    ? BLUE
                    : noticeTypeAccent(typeFilter).color
                }
              />
            </View>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyBody}>{emptyBody}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.countLabel}>
              {items.length} notice{items.length === 1 ? '' : 's'}
              {typeFilter !== 'ALL' ? ` · ${noticeTypeLabel(typeFilter)}` : ''}
            </Text>
            {items.map(item => (
              <NoticeCard
                key={item._id}
                item={item}
                onPress={() =>
                  navigation.navigate(routes.screens.noticeDetail, {
                    noticeId: item._id,
                    notice: item,
                  })
                }
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: PAGE_BG},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 18,
    paddingBottom: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {flex: 1, minWidth: 0},
  headerTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    letterSpacing: -0.3,
    color: NAVY,
  },
  headerSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  filterBar: {
    flexGrow: 0,
  },
  filters: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EEF6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipOn: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  chipText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: NAVY,
  },
  chipTextOn: {
    color: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  scrollEmpty: {
    justifyContent: 'center',
  },
  countLabel: {
    marginBottom: 10,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: MUTED,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  cardUnread: {
    borderColor: '#BFD6F5',
    backgroundColor: '#F7FBFF',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {flex: 1, minWidth: 0},
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
    letterSpacing: -0.1,
  },
  cardTitleUnread: {
    color: '#0A1B45',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#E11D48',
  },
  cardMeta: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
  },
  cardBody: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F1FA',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 14,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  emptyBody: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
});

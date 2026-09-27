import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import ConfirmSheet from '../../Components/ConfirmSheet';
import {
  asyncDeleteUserNotification,
  asyncMarkNotificationRead,
} from '../../Stores/actions/notification.action';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {selectNotices} from '../../Stores/slices/notification.slice';
import {noticeTypeAccent, noticeTypeIcon, noticeTypeLabel} from '../../Utils/noticeTypes';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F2F5FA';
const BLUE = '#035392';
const BLUE_SOFT = '#E8F1FA';

function formatDate(value, fallback = '') {
  const date = moment(value);
  return date.isValid() ? date.format('dddd, D MMMM YYYY · h:mm A') : fallback;
}

function InfoRow({icon, label, value, last, accent}) {
  if (!value) {
    return null;
  }
  const color = accent?.color || BLUE;
  const bg = accent?.bg || BLUE_SOFT;
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={[styles.infoIcon, {backgroundColor: bg}]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, accent?.color && {color: accent.color}]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function NoticeDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const notices = useAppSelector(selectNotices);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const noticeId = route.params?.noticeId;
  const notice = useMemo(() => {
    if (route.params?.notice?._id) {
      const live = (notices || []).find(
        item => String(item._id) === String(route.params.notice._id),
      );
      return live || route.params.notice;
    }
    return (notices || []).find(item => String(item._id) === String(noticeId));
  }, [notices, noticeId, route.params?.notice]);

  const accent = noticeTypeAccent(notice?.type);

  useEffect(() => {
    if (notice?._id && !notice.isRead) {
      dispatch(asyncMarkNotificationRead({id: notice._id, isRead: true}));
    }
  }, [dispatch, notice?._id, notice?.isRead]);

  const openDeleteConfirm = () => {
    if (!notice?._id || deleting) {
      return;
    }
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!notice?._id || deleting) {
      return;
    }
    setDeleting(true);
    try {
      const res = await dispatch(
        asyncDeleteUserNotification({id: notice._id}),
      ).unwrap();
      if (res?.status) {
        setConfirmOpen(false);
        navigation.goBack();
      }
    } catch (_) {
      // keep sheet open; API/network errors surface via existing handlers
    } finally {
      setDeleting(false);
    }
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
        <Text style={styles.headerTitle}>Notice</Text>
        {notice?._id ? (
          <TouchableOpacity
            onPress={openDeleteConfirm}
            style={styles.backBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityLabel="Delete notice">
            <Ionicons name="trash-outline" size={20} color="#E11D48" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSide} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: 32 + insets.bottom},
        ]}>
        {!notice ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Notice not found</Text>
            <Text style={styles.emptyBody}>
              This notice may have been removed or is no longer available.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: accent.bg,
                    borderColor: accent.border,
                  },
                ]}>
                <Ionicons
                  name={noticeTypeIcon(notice.type)}
                  size={12}
                  color={accent.color}
                  style={styles.badgeIcon}
                />
                <Text style={[styles.badgeText, {color: accent.color}]}>
                  {noticeTypeLabel(notice.type)}
                </Text>
              </View>
              {!notice.isRead ? (
                <View style={styles.unreadPill}>
                  <Text style={styles.unreadPillText}>New</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.title}>{notice.title || 'Notice'}</Text>

            <View style={styles.infoBlock}>
              <InfoRow
                icon="calendar-outline"
                label="Sent"
                value={formatDate(notice.createdAt)}
              />
              <InfoRow
                icon={noticeTypeIcon(notice.type)}
                label="Type"
                value={noticeTypeLabel(notice.type)}
                accent={accent}
                last
              />
            </View>

            <Text style={styles.sectionLabel}>Message</Text>
            <Text style={styles.body}>
              {notice.content?.trim() ||
                'No additional details were provided for this notice.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <ConfirmSheet
        visible={confirmOpen}
        title="Delete this notice?"
        message="It will be removed from your list. You won't be able to get it back."
        confirmLabel="Delete"
        cancelLabel="Keep"
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={confirmDelete}
      />
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
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  headerSide: {width: 40},
  scroll: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  badgeIcon: {
    marginTop: 1,
  },
  badgeText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
  },
  unreadPill: {
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadPillText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: '#B91C1C',
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    letterSpacing: -0.3,
    color: NAVY,
    marginBottom: 16,
  },
  infoBlock: {
    borderRadius: 14,
    backgroundColor: '#F7FAFD',
    borderWidth: 1,
    borderColor: '#E8EEF5',
    marginBottom: 18,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF5',
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BLUE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {flex: 1, minWidth: 0},
  infoLabel: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  infoValue: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: NAVY,
  },
  sectionLabel: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: NAVY,
    marginBottom: 8,
  },
  body: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  emptyBody: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
});

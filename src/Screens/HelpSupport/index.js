import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
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
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {getAppSocket, SOCKET_EVENTS} from '../../Service/socket';
import {colors} from '../../theme/colors';
import {OFFICE, categoryLabel, priorityColors, priorityLabel, statusColors, statusLabel} from './helpers';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

export default function HelpSupport() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await callApi({
        path: allApiPaths.getPath('getAllSupportTickets'),
        options: {params: {page: 1, limit: 50}},
      });
      const docs = res?.data?.docs || res?.data?.tickets || [];
      setTickets(Array.isArray(docs) ? docs : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = getAppSocket();
    if (!socket) {
      return undefined;
    }
    const refresh = () => load(true);
    socket.on(SOCKET_EVENTS.SUPPORT_TICKET_NEW, refresh);
    socket.on(SOCKET_EVENTS.SUPPORT_TICKET_UPDATED, refresh);
    socket.on(SOCKET_EVENTS.SUPPORT_MESSAGE_NEW, refresh);
    return () => {
      socket.off(SOCKET_EVENTS.SUPPORT_TICKET_NEW, refresh);
      socket.off(SOCKET_EVENTS.SUPPORT_TICKET_UPDATED, refresh);
      socket.off(SOCKET_EVENTS.SUPPORT_MESSAGE_NEW, refresh);
    };
  }, [load]);

  const openTicket = ticket => {
    navigation.navigate(routes.screens.supportTicket, {ticketId: ticket._id});
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 8}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate(routes.screens.createSupportTicket)}
          activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contacts}>
        <TouchableOpacity
          style={styles.contact}
          onPress={() => Linking.openURL(OFFICE.emailHref)}
          activeOpacity={0.85}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail-outline" size={18} color={PRIMARY} />
          </View>
          <View style={styles.contactCopy}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{OFFICE.email}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contact}
          onPress={() => Linking.openURL(OFFICE.phoneHref)}
          activeOpacity={0.85}>
          <View style={styles.contactIcon}>
            <Ionicons name="call-outline" size={18} color={PRIMARY} />
          </View>
          <View style={styles.contactCopy}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>{OFFICE.phone}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.section}>Support tickets</Text>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PRIMARY} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(true);
              }}
              tintColor={PRIMARY}
            />
          }
          contentContainerStyle={[
            styles.list,
            tickets.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No tickets yet</Text>
              <Text style={styles.emptyCopy}>
                Open a ticket to chat with the Birchwood office. Each chat gets
                its own ticket number.
              </Text>
            </View>
          }
          renderItem={({item}) => {
            const tone = statusColors(item.status);
            const priorityTone = priorityColors(item.priority);
            const unread = Number(item.participantUnreadCount) > 0;
            return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openTicket(item)}
              activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <Text style={styles.number}>{item.ticketNumber}</Text>
                <View style={styles.cardMeta}>
                  {unread ? <View style={styles.unread} /> : null}
                  <View style={[styles.pill, {backgroundColor: priorityTone.bg}]}>
                    <Text style={[styles.pillText, {color: priorityTone.text}]}>
                      {priorityLabel(item.priority)}
                    </Text>
                  </View>
                  <View style={[styles.pill, {backgroundColor: tone.bg}]}>
                    <Text style={[styles.pillText, {color: tone.text}]}>
                      {statusLabel(item.status)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.subject} numberOfLines={1}>
                {item.subject}
              </Text>
              {item.category ? (
                <Text style={styles.category} numberOfLines={1}>
                  {categoryLabel(item.category)}
                </Text>
              ) : null}
              {item.lastMessagePreview ? (
                <Text style={styles.preview} numberOfLines={2}>
                  {item.lastMessagePreview}
                </Text>
              ) : null}
              <Text style={styles.time}>
                {item.lastMessageAt
                  ? moment(item.lastMessageAt).fromNow()
                  : moment(item.createdAt).fromNow()}
              </Text>
            </TouchableOpacity>
            );
          }}
        />
      )}
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: NAVY,
    letterSpacing: -0.3,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newBtnText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  contacts: {
    paddingHorizontal: 18,
    gap: 10,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F1F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCopy: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
  },
  contactValue: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  section: {
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 18,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
    marginBottom: 6,
  },
  emptyCopy: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  number: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 13,
    color: PRIMARY,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unread: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
  },
  subject: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  category: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: PRIMARY,
  },
  preview: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  time: {
    marginTop: 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
});

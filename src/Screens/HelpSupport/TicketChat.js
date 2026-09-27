import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import {useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {callApi} from '../../Service/api';
import {getImagePath} from '../../Service/axios';
import {allApiPaths} from '../../Service/apiPaths';
import {getAppSocket, SOCKET_EVENTS} from '../../Service/socket';
import {colors} from '../../theme/colors';
import {
  OFFICE,
  categoryLabel,
  isClosedTicket,
  priorityColors,
  priorityLabel,
  statusColors,
  statusLabel,
} from './helpers';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function ChatAvatar({uri, label, mine = false}) {
  return (
    <View style={[styles.avatar, mine && styles.avatarMine]}>
      {uri ? (
        <Image source={{uri}} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{initials(label)}</Text>
      )}
    </View>
  );
}

function dayLabel(value) {
  return moment(value).calendar(null, {
    sameDay: '[Today]',
    lastDay: '[Yesterday]',
    lastWeek: 'dddd',
    sameElse: 'D MMM YYYY',
  });
}

function threadRows(messages) {
  const rows = [];
  let lastDay = '';
  messages.forEach(message => {
    const day = moment(message.createdAt).format('YYYY-MM-DD');
    if (day !== lastDay) {
      rows.push({kind: 'day', id: `day-${day}`, label: dayLabel(message.createdAt)});
      lastDay = day;
    }
    rows.push({kind: 'message', id: message._id, message});
  });
  return rows;
}

export default function TicketChat() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const ticketId = route?.params?.ticketId;
  const profile = useAppSelector(selectUserProfile);
  const myName = `${profile?.fatherFirstName || profile?.firstName || ''} ${
    profile?.fatherLastName || profile?.lastName || ''
  }`.trim();
  const myPhoto = getImagePath(profile?.fatherImage || profile?.image);
  const listRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const load = useCallback(async () => {
    if (!ticketId) {
      return;
    }
    const [ticketRes, messageRes] = await Promise.all([
      callApi({
        path: allApiPaths.getPath('getSupportTicket', {id: ticketId}),
      }),
      callApi({
        path: allApiPaths.getPath('getSupportMessages', {id: ticketId}),
        options: {params: {page: 1, limit: 100}},
      }),
    ]);
    setTicket(ticketRes?.data?.ticket || null);
    setMessages(messageRes?.data?.docs || []);
    callApi({
      method: 'POST',
      path: allApiPaths.getPath('markSupportTicketRead', {id: ticketId}),
    });
  }, [ticketId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  useEffect(() => {
    const socket = getAppSocket();
    if (!socket || !ticketId) {
      return undefined;
    }

    const join = () => {
      socket.emit(SOCKET_EVENTS.SUPPORT_JOIN, {ticketId});
    };
    if (socket.connected) {
      join();
    } else {
      socket.once(SOCKET_EVENTS.CONNECTED, join);
    }

    const onMessage = payload => {
      if (String(payload?.ticketId) !== String(ticketId) || !payload?.message) {
        return;
      }
      setMessages(prev => {
        if (prev.some(item => item._id === payload.message._id)) {
          return prev;
        }
        return [...prev, payload.message];
      });
      if (payload.ticket) {
        setTicket(payload.ticket);
      }
      callApi({
        method: 'POST',
        path: allApiPaths.getPath('markSupportTicketRead', {id: ticketId}),
      });
    };

    const onUpdated = payload => {
      const next = payload?.ticket;
      if (next && String(next._id) === String(ticketId)) {
        setTicket(next);
      }
    };

    socket.on(SOCKET_EVENTS.SUPPORT_MESSAGE_NEW, onMessage);
    socket.on(SOCKET_EVENTS.SUPPORT_TICKET_UPDATED, onUpdated);
    return () => {
      socket.off(SOCKET_EVENTS.CONNECTED, join);
      socket.off(SOCKET_EVENTS.SUPPORT_MESSAGE_NEW, onMessage);
      socket.off(SOCKET_EVENTS.SUPPORT_TICKET_UPDATED, onUpdated);
      socket.emit(SOCKET_EVENTS.SUPPORT_LEAVE, {ticketId});
    };
  }, [ticketId]);

  const rows = useMemo(() => threadRows(messages), [messages]);
  const closed = isClosedTicket(ticket?.status);
  const tone = statusColors(ticket?.status);
  const priorityTone = priorityColors(ticket?.priority);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending || closed) {
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await callApi({
        method: 'POST',
        path: allApiPaths.getPath('sendSupportMessage', {id: ticketId}),
        body: {body},
      });
      if (!res?.status) {
        setError(res?.message || 'Could not send that message.');
        return;
      }
      setDraft('');
      if (res.data?.message) {
        setMessages(prev => {
          if (prev.some(item => item._id === res.data.message._id)) {
            return prev;
          }
          return [...prev, res.data.message];
        });
      }
      if (res.data?.ticket) {
        setTicket(res.data.ticket);
      }
    } finally {
      setSending(false);
    }
  };

  const setStatus = async status => {
    setMenuOpen(false);
    const res = await callApi({
      method: 'POST',
      path: allApiPaths.getPath('updateSupportTicket', {id: ticketId}),
      body: {status},
    });
    if (res?.data?.ticket) {
      setTicket(res.data.ticket);
    } else if (!res?.status) {
      setError(res?.message || 'Could not update this ticket.');
    }
  };

  const deleteTicket = () => {
    setMenuOpen(false);
    Alert.alert(
      'Delete ticket',
      'This closed ticket and its messages will be removed. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await callApi({
              method: 'DELETE',
              path: allApiPaths.getPath('deleteSupportTicket', {id: ticketId}),
            });
            if (!res?.status) {
              setError(res?.message || 'Could not delete this ticket.');
              return;
            }
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 8}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {ticket?.ticketNumber || 'Ticket'}
            </Text>
            <View style={[styles.pill, {backgroundColor: priorityTone.bg}]}>
              <Text style={[styles.pillText, {color: priorityTone.text}]}>
                {priorityLabel(ticket?.priority)}
              </Text>
            </View>
            <View style={[styles.pill, {backgroundColor: tone.bg}]}>
              <Text style={[styles.pillText, {color: tone.text}]}>
                {statusLabel(ticket?.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.headerSub} numberOfLines={1}>
            {ticket?.subject || 'Support chat'}
            {ticket?.category ? ` · ${categoryLabel(ticket.category)}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Ticket options">
          <Ionicons name="ellipsis-horizontal" size={20} color={NAVY} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PRIMARY} />
      ) : (
        <KeyboardAvoidingView
          style={styles.chat}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            ref={listRef}
            data={rows}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd?.({animated: false})
            }
            ListEmptyComponent={
              <Text style={styles.empty}>Send a message to the office.</Text>
            }
            renderItem={({item}) => {
              if (item.kind === 'day') {
                return (
                  <View style={styles.dayWrap}>
                    <Text style={styles.day}>{item.label}</Text>
                  </View>
                );
              }
              const message = item.message;
              const mine = message.senderRole === 'PARENT';
              const photo = message.senderImage
                ? getImagePath(message.senderImage)
                : mine
                  ? myPhoto
                  : '';
              return (
                <View style={[styles.row, mine && styles.rowMine]}>
                  {!mine ? (
                    <ChatAvatar uri={photo} label={message.senderName || 'B'} />
                  ) : null}
                  <View style={styles.bubbleCol}>
                    {!mine ? (
                      <Text style={styles.sender}>
                        {message.senderName || 'Birchwood office'}
                      </Text>
                    ) : null}
                    <View
                      style={[
                        styles.bubble,
                        mine ? styles.bubbleMine : styles.bubbleTheirs,
                      ]}>
                      <Text
                        style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
                        {message.body}
                      </Text>
                      <Text style={[styles.time, mine && styles.timeMine]}>
                        {moment(message.createdAt).format('h:mm A')}
                      </Text>
                    </View>
                  </View>
                  {mine ? (
                    <ChatAvatar uri={photo} label={myName || 'You'} mine />
                  ) : null}
                </View>
              );
            }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {closed ? (
            <View style={[styles.closedBar, {paddingBottom: Math.max(insets.bottom, 14)}]}>
              <Ionicons name="lock-closed-outline" size={16} color={MUTED} />
              <Text style={styles.closedNote}>This ticket is closed.</Text>
              <TouchableOpacity
                style={styles.deleteClosedBtn}
                onPress={deleteTicket}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Delete ticket">
                <Ionicons name="trash-outline" size={15} color="#C44548" />
                <Text style={styles.deleteClosedText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.composer, {paddingBottom: Math.max(insets.bottom, 10)}]}>
              <TextInput
                style={styles.input}
                placeholder="Message the office"
                placeholderTextColor="#9CA3AF"
                value={draft}
                onChangeText={setDraft}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.send,
                  (!draft.trim() || sending) && styles.sendDisabled,
                ]}
                onPress={send}
                disabled={!draft.trim() || sending}
                activeOpacity={0.85}>
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuRoot} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuCard}>
            <Text style={styles.menuTitle}>Ticket options</Text>
            {ticket?.status !== 'RESOLVED' && !closed ? (
              <MenuRow
                icon="checkmark-circle-outline"
                label="Mark resolved"
                onPress={() => setStatus('RESOLVED')}
              />
            ) : null}
            {!closed ? (
              <MenuRow
                icon="lock-closed-outline"
                label="Close ticket"
                onPress={() => setStatus('CLOSED')}
              />
            ) : (
              <MenuRow
                icon="trash-outline"
                label="Delete ticket"
                detail="Remove this closed ticket"
                onPress={deleteTicket}
              />
            )}
            <MenuRow
              icon="call-outline"
              label="Call office"
              detail={OFFICE.phone}
              onPress={() => {
                setMenuOpen(false);
                Linking.openURL(OFFICE.phoneHref);
              }}
            />
            <MenuRow
              icon="mail-outline"
              label="Email office"
              detail={OFFICE.email}
              onPress={() => {
                setMenuOpen(false);
                Linking.openURL(OFFICE.emailHref);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function MenuRow({icon, label, detail, onPress}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={18} color={NAVY} />
      <View style={styles.menuCopy}>
        <Text style={styles.menuLabel}>{label}</Text>
        {detail ? <Text style={styles.menuDetail}>{detail}</Text> : null}
      </View>
    </TouchableOpacity>
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
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E8EE',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    flexShrink: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: NAVY,
  },
  headerSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
  },
  loader: {
    marginTop: 40,
  },
  chat: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
  },
  dayWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  day: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#035392',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  avatarMine: {
    backgroundColor: PRIMARY,
  },
  avatarText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  bubbleCol: {
    maxWidth: '78%',
  },
  sender: {
    marginBottom: 4,
    marginLeft: 4,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  bubbleMine: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    color: NAVY,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: '#FFFFFF',
  },
  time: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 11,
    color: MUTED,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(255,255,255,0.75)',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E8EE',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: PAGE_BG,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    color: NAVY,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.45,
  },
  closedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E8EE',
  },
  closedNote: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: MUTED,
  },
  deleteClosedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FDECEC',
  },
  deleteClosedText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 13,
    color: '#C44548',
  },
  error: {
    textAlign: 'center',
    color: '#E11D48',
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  menuRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  menuTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  menuDetail: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
});

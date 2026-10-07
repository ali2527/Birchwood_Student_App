import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import routes from '../../Navigation/routes';
import {isChatAudio, isChatImage} from '../../Components/ChatLibrary';
import SmallDialog from '../../Components/SmallDialog';
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {useAppSelector} from '../../Stores/hooks';
import {selectUserToken} from '../../Stores/slices/user.slice';
import {selectChildren} from '../../Stores/slices/class.slice';
import {applyIncomingChatDeletion, applyIncomingChatMessage, removeChatFromList, useChatList} from '../../Query/chats';
import {connectAppSocket, getAppSocket} from '../../Service/socket';
import {BAR_H} from '../../Components/AppFooter/shape';
import {
  Avatar,
  childName,
  classLabel,
  personName,
  photoUri,
  resolveTeacher,
} from './Thread';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F2F5FA';
const BLUE = '#035392';
const BLUE_SOFT = '#E8F1FA';

function previewText(latestMessage) {
  if (!latestMessage || typeof latestMessage === 'string') {
    return {text: typeof latestMessage === 'string' ? latestMessage : '', muted: false};
  }
  if (latestMessage.deletedForEveryone) {
    return {text: 'This message was deleted', muted: true};
  }
  if (latestMessage.hiddenForMe) {
    return {text: 'You deleted this message', muted: true};
  }
  if (latestMessage.attachment?.file && !latestMessage.content) {
    const mine = latestMessage.senderType === 'parent';
    const label = isChatAudio(latestMessage.attachment)
      ? 'Voice message'
      : isChatImage(latestMessage.attachment)
        ? 'Photo'
        : 'Document';
    return {text: mine ? `You: ${label}` : label, muted: false};
  }
  const body = latestMessage.content || '';
  const mine = latestMessage.senderType === 'parent';
  return {text: mine && body ? `You: ${body}` : body, muted: false};
}

function chatWhen(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
  }
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function ChatListSkeleton() {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1, duration: 700, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 0.45, duration: 700, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const bone = style => <Animated.View style={[styles.bone, style, {opacity: pulse}]} />;

  return (
    <View style={styles.skeletonWrap}>
      {[0, 1, 2, 3, 4, 5].map(key => (
        <View key={key} style={styles.listCard}>
          {bone(styles.boneAvatar)}
          <View style={styles.listCopy}>
            <View style={styles.listTop}>
              {bone(styles.boneTitle)}
              {bone(styles.boneTime)}
            </View>
            {bone(styles.boneLine)}
            {bone(styles.bonePreview)}
          </View>
        </View>
      ))}
    </View>
  );
}

function childRecord(chat) {
  const child = chat?.children || chat?.child;
  if (child && typeof child === 'object') return child;
  return null;
}

function ChatList({children, chats, loading, onOpen, onDelete, insets}) {
  const rows = useMemo(() => {
    const byId = new Map((children || []).map(child => [String(child._id), child]));
    return (chats || [])
      .map(chat => {
        const embedded = childRecord(chat);
        const childId = String(embedded?._id || chat?.children || chat?.child || '');
        const child = (childId && byId.get(childId)) || embedded || {_id: childId};
        return {
          key: String(chat?._id || childId),
          child,
          teacher: resolveTeacher(child, chat),
          chat,
        };
      })
      .filter(row => row.chat?._id);
  }, [children, chats]);

  if (loading) {
    return <ChatListSkeleton />;
  }

  if (!rows.length) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={BLUE} />
        </View>
        <Text style={styles.emptyTitle}>
          {(children || []).length ? 'No chats yet' : 'No children linked'}
        </Text>
        <Text style={styles.emptyBody}>
          {(children || []).length
            ? 'Tap Start to message a class teacher.'
            : 'Link a child to message their class teacher.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={item => item.key}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: BAR_H + insets.bottom + 24,
      }}
      ItemSeparatorComponent={() => <View style={{height: 10}} />}
      renderItem={({item}) => {
        const teacherLabel = personName(item.teacher, 'No teacher yet');
        const room = classLabel(item.child?.classroom);
        const unread = Number(item.chat?.parentUnread ?? item.chat?.unreadMessage ?? 0);
        const photo =
          photoUri(item.teacher) || photoUri(item.child) || null;
        const canOpen = Boolean(
          item.teacher &&
            (typeof item.teacher === 'object'
              ? item.teacher._id
              : item.teacher),
        );
        const preview = previewText(item.chat?.latestMessage);
        const when = chatWhen(item.chat?.latestMessage?.createdAt);
        return (
          <TouchableOpacity
            style={[styles.listCard, !canOpen && styles.listCardDisabled]}
            activeOpacity={0.85}
            onPress={() => onOpen(item)}
            onLongPress={() => item.chat?._id && onDelete?.(item.chat)}
            delayLongPress={280}
            disabled={!canOpen}>
            <Avatar uri={photo} label={teacherLabel} />
            <View style={styles.listCopy}>
              <View style={styles.listTop}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {teacherLabel}
                </Text>
                {when ? <Text style={styles.listTime}>{when}</Text> : null}
              </View>
              <Text style={styles.listSub} numberOfLines={1}>
                {childName(item.child)}
                {room ? ` · ${room}` : ''}
              </Text>
              <Text
                style={[styles.listPreview, preview.muted && styles.listPreviewMuted]}
                numberOfLines={1}>
                {canOpen ? preview.text || 'No messages yet' : 'Teacher not assigned yet'}
              </Text>
            </View>
            {unread > 0 ? (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      }}
    />
  );
}

export default function TeacherChat() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(selectUserToken);
  const children = useAppSelector(selectChildren);
  const chatsQuery = useChatList('parent');
  const chats = Array.isArray(chatsQuery.data) ? chatsQuery.data : [];
  const [awaitingChats, setAwaitingChats] = useState(
    () => !Array.isArray(chatsQuery.data) || chatsQuery.data.length === 0,
  );
  const loading = chats.length === 0 && (awaitingChats || chatsQuery.data === undefined);
  const [startOpen, setStartOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [deletingChat, setDeletingChat] = useState(false);

  const {refetch} = chatsQuery;
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setAwaitingChats(true);
      refetch().finally(() => {
        if (alive) setAwaitingChats(false);
      });
      return () => {
        alive = false;
      };
    }, [refetch]),
  );

  useEffect(() => {
    const socket = connectAppSocket(token) || getAppSocket();
    if (!socket) return undefined;
    const onMessage = record => applyIncomingChatMessage('parent', record);
    const onDeleted = record => applyIncomingChatDeletion('parent', record);
    socket.on('message', onMessage);
    socket.on('message:deleted', onDeleted);
    return () => {
      socket.off('message', onMessage);
      socket.off('message:deleted', onDeleted);
    };
  }, [token]);

  const openThread = item => {
    const teacher = resolveTeacher(item.child, item.chat);
    if (!teacher) return;
    navigation.navigate(routes.screens.teacherChatThread, {
      child: item.child,
      teacher,
      chatId: item.chat?._id || null,
    });
  };

  const starters = useMemo(() => {
    const taken = new Set(
      (chats || [])
        .map(chat => String(chat.children?._id || chat.children || ''))
        .filter(Boolean),
    );
    return (children || []).filter(child => {
      if (taken.has(String(child._id))) return false;
      const teacher = resolveTeacher(child, null);
      return Boolean(teacher && (teacher._id || typeof teacher === 'string'));
    });
  }, [children, chats]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 8}]}>
        <View style={{flex: 1, paddingHorizontal: 10}}>
          <Text style={styles.headerTitle}>Chat</Text>
          <Text style={styles.headerSub}>
            Message your child’s class teacher
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.startBtn, !(children || []).length && styles.startBtnOff]}
          disabled={!(children || []).length}
          onPress={() => setStartOpen(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Start chat">
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.startBtnText}>Start</Text>
        </TouchableOpacity>
      </View>
      <ChatList
        children={children}
        chats={chats}
        loading={loading}
        onOpen={openThread}
        onDelete={setChatToDelete}
        insets={insets}
      />
      <Modal
        visible={startOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setStartOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable
            style={styles.sheetDim}
            onPress={() => setStartOpen(false)}
          />
          <View
            style={[
              styles.sheet,
              {paddingBottom: Math.max(insets.bottom, 16)},
            ]}>
            <Text style={styles.sheetTitle}>Start chat</Text>
            {starters.length ? (
              starters.map(child => {
                const teacher = resolveTeacher(child, null);
                const label = personName(teacher, 'Teacher');
                return (
                  <TouchableOpacity
                    key={String(child._id)}
                    style={styles.sheetRow}
                    activeOpacity={0.85}
                    onPress={() => {
                      setStartOpen(false);
                      openThread({child, teacher, chat: null});
                    }}>
                    <Text style={styles.sheetLabel} numberOfLines={1}>
                      {label}
                    </Text>
                    <Text style={styles.sheetSub} numberOfLines={1}>
                      {childName(child)}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.sheetEmpty}>Every teacher already has a chat.</Text>
            )}
          </View>
        </View>
      </Modal>
      <SmallDialog
        visible={Boolean(chatToDelete)}
        title="Delete this chat?"
        message="It will leave your chat list. The teacher still has the conversation."
        onClose={() => {
          if (!deletingChat) setChatToDelete(null);
        }}
        actions={[
          {label: 'Keep', disabled: deletingChat, onPress: () => setChatToDelete(null)},
          {
            label: deletingChat ? 'Deleting' : 'Delete for me',
            danger: true,
            disabled: deletingChat,
            onPress: async () => {
              if (!chatToDelete?._id) return;
              setDeletingChat(true);
              try {
                const res = await callApi({
                  method: 'POST',
                  path: allApiPaths.getPath('deleteChat'),
                  body: {chatId: chatToDelete._id},
                });
                if (res?.status) {
                  removeChatFromList('parent', chatToDelete._id);
                  setChatToDelete(null);
                }
              } finally {
                setDeletingChat(false);
              }
            },
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: PAGE_BG},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E8EE',
  },
  headerTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 20,
    color: NAVY,
  },
  headerSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: BLUE,
    borderRadius: 18,
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  startBtnOff: {opacity: 0.4},
  startBtnText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sheetRoot: {flex: 1, justifyContent: 'flex-end'},
  sheetDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 31, 75, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sheetTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
    marginBottom: 8,
  },
  sheetRow: {paddingVertical: 12},
  sheetLabel: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  sheetSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  sheetEmpty: {
    paddingVertical: 16,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
  },
  skeletonWrap: {padding: 16, gap: 10},
  bone: {backgroundColor: '#E6EAF1', borderRadius: 8},
  boneAvatar: {width: 48, height: 48, borderRadius: 24},
  boneTitle: {height: 14, flex: 1, borderRadius: 7},
  boneTime: {width: 36, height: 10, borderRadius: 5},
  boneLine: {width: '46%', height: 12, marginTop: 8, borderRadius: 6},
  bonePreview: {width: '78%', height: 12, marginTop: 8, borderRadius: 6},
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  listCardDisabled: {opacity: 0.55},
  listUnreadDot: {
    position: 'absolute',
    right: -1,
    top: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E11D48',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  listCopy: {flex: 1, minWidth: 0},
  listTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  listTime: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: MUTED,
  },
  listSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: BLUE,
  },
  listPreview: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: '#5C6578',
  },
  listPreviewMuted: {
    fontStyle: 'italic',
    color: MUTED,
  },
  unreadPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 11,
    color: '#FFF',
  },
  emptyCard: {
    margin: 18,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BLUE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 12,
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
    lineHeight: 18,
  },
});

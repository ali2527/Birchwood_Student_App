import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {getImagePath} from '../../Service/axios';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {selectUserProfile} from '../../Stores/slices/user.slice';
import {asyncGetUnreadChatCount} from '../../Stores/actions/class.action';
import {getAppSocket} from '../../Service/socket';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F2F5FA';
const BLUE = '#035392';
const BLUE_SOFT = '#E8F1FA';

export function personName(person, fallback = 'Teacher') {
  if (!person || typeof person === 'string') return fallback;
  return (
    `${person.firstName || ''} ${person.lastName || ''}`.trim() || fallback
  );
}

export function childName(child) {
  return `${child?.firstName || ''} ${child?.lastName || ''}`.trim() || 'Child';
}

export function classLabel(classroom) {
  if (!classroom || typeof classroom === 'string') return '';
  return classroom.classroomName || classroom.classroomId || '';
}

export function resolveTeacher(child, chat) {
  const fromChat = chat?.teacher;
  if (fromChat && typeof fromChat === 'object' && (fromChat.firstName || fromChat.lastName || fromChat._id)) {
    return fromChat;
  }
  const fromClass = child?.classroom?.teacher;
  if (fromClass && typeof fromClass === 'object' && (fromClass.firstName || fromClass.lastName || fromClass._id)) {
    return fromClass;
  }
  return fromChat || fromClass || null;
}

export function photoUri(person) {
  if (!person?.image || typeof person === 'string') return null;
  return getImagePath(person.image);
}

export function Avatar({uri, label, size = 48}) {
  const initials = String(label || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
  if (uri) {
    return (
      <Image
        source={{uri}}
        style={{width: size, height: size, borderRadius: size / 2}}
      />
    );
  }
  return (
    <View
      style={[
        styles.avatarFallback,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
      <Text style={[styles.avatarInitials, size < 40 && {fontSize: 12}]}>
        {initials || '?'}
      </Text>
    </View>
  );
}

export default function TeacherChatThread() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector(selectUserProfile);
  const listRef = useRef(null);

  const child = route.params?.child || null;
  const teacher = resolveTeacher(child, {teacher: route.params?.teacher});
  const initialChatId = route.params?.chatId || null;

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeChat, setActiveChat] = useState(initialChatId);
  const [error, setError] = useState('');

  const teacherLabel = personName(teacher, 'Teacher');
  const teacherPhoto = photoUri(teacher);

  const openOrCreate = useCallback(async () => {
    if (initialChatId) return initialChatId;
    if (!child?._id) return null;
    const teacherId = teacher?._id || teacher;
    const parentId = userProfile?._id || child?.parent?._id || child?.parent;
    if (!teacherId) {
      setError('No class teacher assigned yet.');
      return null;
    }
    if (!parentId) {
      setError('Could not identify parent account.');
      return null;
    }
    const res = await callApi({
      method: 'POST',
      path: allApiPaths.getPath('createChat'),
      body: {
        teacher: teacherId,
        parent: parentId,
        children: child._id,
      },
    });
    const id = res?.data?._id || res?.data?.chat?._id;
    if (!id) {
      setError(res?.message || 'Could not start chat');
      return null;
    }
    return id;
  }, [child, initialChatId, teacher, userProfile?._id]);

  const loadMessages = useCallback(
    async id => {
      if (!id) return;
      const res = await callApi({
        path: allApiPaths.getPath('getMessagesByChatRoomId', {
          chatRoomId: id,
        }),
        options: {params: {page: 1, limit: 100}},
      });
      const docs = res?.data?.docs || [];
      setMessages([...docs].reverse());
      dispatch(asyncGetUnreadChatCount());
    },
    [dispatch],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const id = await openOrCreate();
        if (!alive) return;
        setActiveChat(id);
        if (id) await loadMessages(id);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadMessages, openOrCreate]);

  useEffect(() => {
    if (!activeChat) return undefined;
    const socket = getAppSocket();
    if (!socket) return undefined;
    const onMessage = record => {
      if (!record || String(record.chat) !== String(activeChat)) return;
      setMessages(prev => {
        if (prev.some(item => item?._id && item._id === record._id)) return prev;
        return [...prev, record];
      });
    };
    socket.emit('join chat', activeChat);
    socket.on('message', onMessage);
    return () => {
      socket.off('message', onMessage);
    };
  }, [activeChat]);

  useEffect(() => {
    if (!messages.length) return;
    const id = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({animated: false});
    });
    return () => cancelAnimationFrame(id);
  }, [messages.length, loading]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeChat || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await callApi({
        method: 'POST',
        path: allApiPaths.getPath('createChatRoomMessage'),
        body: {chatId: activeChat, content: body, senderType: 'parent'},
      });
      if (res?.data?.message) {
        setMessages(prev => [...prev, res.data.message]);
        setDraft('');
        requestAnimationFrame(() => {
          listRef.current?.scrollToEnd?.({animated: true});
        });
      } else {
        setError(res?.message || 'Could not send');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View
        style={[
          styles.header,
          {paddingTop: Math.max(insets.top, 10) + 6},
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <Avatar uri={teacherPhoto} label={teacherLabel} size={40} />
        <View style={styles.headerCopy}>
          <Text style={styles.teacherName} numberOfLines={1}>
            {teacherLabel}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {childName(child)}
            {classLabel(child?.classroom)
              ? ` · ${classLabel(child.classroom)}`
              : ''}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{marginTop: 40}} color={BLUE} />
      ) : (
        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item, index) => item._id || String(index)}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd?.({animated: false})
            }
            renderItem={({item, index}) => {
              const mine = item.senderType === 'parent';
              const prev = messages[index - 1];
              const showTime =
                !prev ||
                moment(item.createdAt).diff(moment(prev.createdAt), 'minutes') >
                  8;
              return (
                <View>
                  {showTime && item.createdAt ? (
                    <Text style={styles.timeLabel}>
                      {moment(item.createdAt).calendar(null, {
                        sameDay: 'h:mm A',
                        lastDay: '[Yesterday] h:mm A',
                        lastWeek: 'ddd h:mm A',
                        sameElse: 'D MMM h:mm A',
                      })}
                    </Text>
                  ) : null}
                  <View
                    style={[
                      styles.bubble,
                      mine ? styles.mine : styles.theirs,
                    ]}>
                    {!mine ? (
                      <Text style={styles.bubbleSender} numberOfLines={1}>
                        {teacherLabel}
                      </Text>
                    ) : null}
                    <Text style={[styles.msg, mine && styles.msgMine]}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.threadEmpty}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={24}
                    color={BLUE}
                  />
                </View>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyBody}>
                  Say hello to {teacherLabel}.
                </Text>
              </View>
            }
          />
          <View
            style={[
              styles.composer,
              {paddingBottom: Math.max(insets.bottom, 10)},
            ]}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={`Message ${teacherLabel}…`}
              placeholderTextColor={MUTED}
              multiline
              maxLength={2000}
              editable={Boolean(activeChat) && !sending}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.send,
                (!draft.trim() || sending || !activeChat) &&
                  styles.sendDisabled,
              ]}
              onPress={send}
              disabled={!draft.trim() || sending || !activeChat}
              accessibilityRole="button"
              accessibilityLabel="Send message">
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: PAGE_BG},
  body: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E8EE',
  },
  headerCopy: {flex: 1, minWidth: 0},
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: NAVY,
  },
  headerSub: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE_SOFT,
  },
  avatarInitials: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: BLUE,
  },
  error: {
    color: '#E11D48',
    paddingHorizontal: 16,
    paddingTop: 10,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
  },
  messageList: {flex: 1},
  messageListContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    flexGrow: 1,
  },
  timeLabel: {
    alignSelf: 'center',
    marginVertical: 10,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: MUTED,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: BLUE,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  bubbleSender: {
    marginBottom: 3,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 11,
    color: BLUE,
  },
  msg: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    lineHeight: 20,
    color: NAVY,
  },
  msgMine: {color: '#FFF'},
  threadEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
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
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E8EE',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    backgroundColor: PAGE_BG,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    color: NAVY,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {opacity: 0.4},
});

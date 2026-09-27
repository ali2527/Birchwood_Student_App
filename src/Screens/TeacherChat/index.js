import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {useAppSelector} from '../../Stores/hooks';
import {selectChildren} from '../../Stores/slices/class.slice';
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
  if (!latestMessage) return 'Open conversation';
  if (typeof latestMessage === 'string') return latestMessage;
  return latestMessage.content || 'Open conversation';
}

function ChatList({children, chats, loading, onOpen, insets}) {
  const rows = useMemo(() => {
    const byChild = new Map();
    (chats || []).forEach(chat => {
      const childId =
        chat.children?._id || chat.children || chat.child?._id || chat.child;
      if (!childId) return;
      byChild.set(String(childId), chat);
    });

    return (children || [])
      .map(child => {
        const chat = byChild.get(String(child._id));
        if (!chat) return null;
        const teacher = resolveTeacher(child, chat);
        return {
          key: String(child._id),
          child,
          teacher,
          chat,
        };
      })
      .filter(Boolean);
  }, [children, chats]);

  if (loading) {
    return <ActivityIndicator style={{marginTop: 40}} color={BLUE} />;
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
        const unread = Number(
          item.chat?.parentUnread ?? item.chat?.unreadMessage ?? 0,
        );
        const photo =
          photoUri(item.teacher) || photoUri(item.child) || null;
        const canOpen = Boolean(
          item.teacher &&
            (typeof item.teacher === 'object'
              ? item.teacher._id
              : item.teacher),
        );
        return (
          <TouchableOpacity
            style={[styles.listCard, !canOpen && styles.listCardDisabled]}
            activeOpacity={0.85}
            onPress={() => onOpen(item)}
            disabled={!canOpen}>
            <View>
              <Avatar uri={photo} label={teacherLabel} />
              {unread > 0 ? <View style={styles.listUnreadDot} /> : null}
            </View>
            <View style={styles.listCopy}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {teacherLabel}
              </Text>
              <Text style={styles.listSub} numberOfLines={1}>
                {childName(item.child)}
                {room ? ` · ${room}` : ''}
              </Text>
              <Text style={styles.listPreview} numberOfLines={1}>
                {canOpen
                  ? previewText(item.chat?.latestMessage)
                  : 'Teacher not assigned yet'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={MUTED} />
          </TouchableOpacity>
        );
      }}
    />
  );
}

export default function TeacherChat() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startOpen, setStartOpen] = useState(false);

  const loadChats = useCallback(async () => {
    const res = await callApi({
      path: allApiPaths.getPath('getMyChats'),
      options: {params: {type: 'parent'}},
    });
    setChats(res?.data?.docs || res?.data || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        setLoading(true);
        try {
          await loadChats();
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [loadChats]),
  );

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
        insets={insets}
      />
      <Modal
        visible={startOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStartOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetDim} onPress={() => setStartOpen(false)} />
          <View style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 16)}]}>
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
  sheetDim: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 31, 75, 0.35)'},
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
  listTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
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
    fontSize: 12,
    color: MUTED,
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

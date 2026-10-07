import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  InteractionManager,
  Keyboard,
  Linking,
  Modal,
  PanResponder,
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
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {EmojiKeyboard} from 'rn-emoji-keyboard';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import ChatLibrary, {ChatDocument, ChatPhoto, ChatVoice, isChatAudio, isChatImage} from '../../Components/ChatLibrary';
import SmallDialog from '../../Components/SmallDialog';
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {getImagePath} from '../../Service/axios';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {selectUserProfile, selectUserToken} from '../../Stores/slices/user.slice';
import {asyncMarkChatRead} from '../../Stores/actions/class.action';
import {asyncShowError} from '../../Stores/actions/common.action';
import {setReadingChatId} from '../../Stores/slices/class.slice';
import {connectAppSocket, getAppSocket} from '../../Service/socket';
import {normalizeFileUri, uploadChatFile} from '../../Utils/chunkUpload';
import {
  applyIncomingChatMessage,
  chatKeys,
  markChatListRead,
  messageChatId,
  patchChatMessages,
  removeChatFromList,
  useChatMessages,
} from '../../Query/chats';
import {queryClient} from '../../Query/client';
import {startVoice, stopVoice, takeVoiceWave, voiceUpload} from '../../Utils/voiceNote';
import {errorCodes, isErrorWithCode, keepLocalCopy, pick, types} from '@react-native-documents/picker';
import {useChatDownloads} from '../../Utils/chatDownloads';
import {ensureCameraPermission, ensureGalleryPermission} from '../../Utils/mediaPermissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F2F5FA';
const BLUE = '#035392';
const BLUE_SOFT = '#E8F1FA';
const DELETE_FOR_EVERYONE_MS = 48 * 60 * 60 * 1000;

function senderIdOf(item) {
  const sender = item?.sender;
  if (!sender) return '';
  if (typeof sender === 'object') return String(sender._id || sender.id || '');
  return String(sender);
}

function ownsMessage(item, userId, role) {
  if (!item || item.deletedForEveryone || !item.createdAt) return false;
  if (Date.now() - new Date(item.createdAt).getTime() >= DELETE_FOR_EVERYONE_MS) return false;
  const senderId = senderIdOf(item);
  if (userId && senderId) return senderId === String(userId);
  return item.senderType === role || item.mine === true;
}
const COMPOSER_ICON = '#5C6B86';
const emojiTheme = {
  container: '#FFFFFF',
  header: NAVY,
  category: {
    icon: MUTED,
    iconActive: BLUE,
    container: PAGE_BG,
    containerActive: '#E8F1FA',
  },
  search: {
    background: PAGE_BG,
    text: NAVY,
    placeholder: MUTED,
    icon: MUTED,
  },
  emoji: {selected: '#E8F1FA'},
};

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

export function parentDisplayName(person) {
  if (!person || typeof person === 'string') return 'Parent';
  const father = `${person.fatherFirstName || ''} ${person.fatherLastName || ''}`.trim();
  const mother = `${person.motherFirstName || ''} ${person.motherLastName || ''}`.trim();
  if (father && mother && father !== mother) {
    return `${father} & ${mother}`;
  }
  return father || mother || personName(person, 'Parent');
}

function keyboardOverlap(event) {
  const screenY = event?.endCoordinates?.screenY;
  const reported = event?.endCoordinates?.height || 0;
  if (typeof screenY !== 'number') return reported;
  const overlap = Math.round(Dimensions.get('window').height - screenY);
  return overlap > 0 ? overlap : 0;
}

function chatIdOf(record) {
  const chat = record?.chat;
  if (!chat) return '';
  return typeof chat === 'string' ? chat : String(chat._id || '');
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

function TypingDots() {
  const first = useRef(new Animated.Value(0.35)).current;
  const second = useRef(new Animated.Value(0.35)).current;
  const third = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const fade = (dot, hold) =>
      Animated.sequence([
        Animated.delay(hold),
        Animated.timing(dot, {toValue: 1, duration: 220, useNativeDriver: true}),
        Animated.timing(dot, {toValue: 0.35, duration: 220, useNativeDriver: true}),
      ]);
    const loop = Animated.loop(
      Animated.parallel([fade(first, 0), fade(second, 160), fade(third, 320)]),
    );
    loop.start();
    return () => loop.stop();
  }, [first, second, third]);

  return (
    <View style={styles.typingDots}>
      {[first, second, third].map((opacity, index) => (
        <Animated.View key={index} style={[styles.typingDot, {opacity}]} />
      ))}
    </View>
  );
}

const THREAD_SKELETON = [
  {mine: false, width: '62%'},
  {mine: true, width: '48%'},
  {mine: false, width: '74%'},
  {mine: true, width: '56%'},
  {mine: false, width: '40%'},
  {mine: true, width: '68%'},
  {mine: false, width: '52%'},
];

function ThreadMessagesSkeleton() {
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

  return (
    <View style={styles.threadSkeleton}>
      {THREAD_SKELETON.map((row, index) => (
        <Animated.View
          key={index}
          style={[
            styles.threadBone,
            row.mine ? styles.threadBoneMine : styles.threadBoneTheirs,
            {width: row.width, opacity: pulse},
          ]}
        />
      ))}
    </View>
  );
}

export default function TeacherChatThread() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector(selectUserProfile);
  const token = useAppSelector(selectUserToken);
  const listRef = useRef(null);
  const followLatest = useRef(true);
  const scrollToken = useRef(0);
  const scrollToLatest = useCallback(() => {
    const token = (scrollToken.current += 1);
    followLatest.current = true;
    const jump = () => {
      if (scrollToken.current !== token) return;
      listRef.current?.scrollToOffset?.({offset: 0, animated: false});
    };
    jump();
    requestAnimationFrame(jump);
    setTimeout(jump, 80);
    setTimeout(jump, 240);
    setTimeout(() => {
      if (scrollToken.current === token) followLatest.current = false;
    }, 500);
  }, []);
  const typingTimer = useRef(null);
  const peerTypingTimer = useRef(null);
  const lastTypingEmit = useRef(0);
  const typingOn = useRef(false);

  const child = route.params?.child || null;
  const teacher = resolveTeacher(child, {teacher: route.params?.teacher});
  const initialChatId = route.params?.chatId || null;

  const [menuMessage, setMenuMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendingPhoto, setSendingPhoto] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [roomMenu, setRoomMenu] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordLabel, setRecordLabel] = useState('0:00');
  const [voiceLocked, setVoiceLocked] = useState(false);
  const [voiceDrag, setVoiceDrag] = useState({x: 0, y: 0});
  const [photoAsk, setPhotoAsk] = useState(false);
  const recordingRef = useRef(false);
  const recordSecondsRef = useRef(0);
  const recordStartedAt = useRef(0);
  const voiceLockedRef = useRef(false);
  const voiceTicket = useRef(0);
  const voiceGate = useRef({action: ''});
  const holdAt = useRef(0);
  const draftRef = useRef('');
  const voiceApi = useRef({});
  const voicePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !draftRef.current.trim() && !voiceLockedRef.current,
      onMoveShouldSetPanResponder: () => recordingRef.current && !voiceLockedRef.current,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        holdAt.current = Date.now();
        voiceGate.current = {action: ''};
        voiceApi.current.beginVoice?.();
      },
      onPanResponderMove: (_, gesture) => {
        if (!recordingRef.current || voiceLockedRef.current) return;
        setVoiceDrag({
          x: Math.max(-140, Math.min(0, gesture.dx)),
          y: Math.max(-88, Math.min(0, gesture.dy)),
        });
      },
      onPanResponderRelease: (_, gesture) => {
        const x = Math.min(0, gesture.dx);
        const y = Math.min(0, gesture.dy);
        setVoiceDrag({x: 0, y: 0});
        if (voiceLockedRef.current) return;
        let action = 'send';
        if (x < -90) action = 'cancel';
        else if (y < -64) action = 'lock';
        else if (Date.now() - holdAt.current < 400) action = 'cancel';
        if (!recordingRef.current) {
          voiceGate.current.action = action;
          if (action === 'cancel') voiceTicket.current += 1;
          return;
        }
        if (action === 'cancel') voiceApi.current.cancelVoice?.();
        else if (action === 'lock') voiceApi.current.lockVoice?.();
        else voiceApi.current.finishVoice?.();
      },
      onPanResponderTerminate: () => {
        setVoiceDrag({x: 0, y: 0});
        if (!voiceLockedRef.current) voiceApi.current.cancelVoice?.();
      },
    }),
  ).current;
  const [outgoing, setOutgoing] = useState([]);
  const dotsRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [threadReady, setThreadReady] = useState(false);
  const threadReadyRef = useRef(false);
  const sawMessageLoad = useRef(false);
  const {downloading, downloadFile, finishDownload, forgetDownload, isSaved} = useChatDownloads();
  const [activeChat, setActiveChat] = useState(initialChatId);
  const messagesQuery = useChatMessages(activeChat);
  const messages = Array.isArray(messagesQuery.data) ? messagesQuery.data : [];
  const messagesLoader =
    Boolean(activeChat) &&
    (messagesQuery.isPending ||
      (messagesQuery.isFetching && messagesQuery.data === undefined));
  const awaitingMessages = loading || messagesLoader;
  const shown = useMemo(() => [...messages, ...outgoing], [messages, outgoing]);
  const threadData = useMemo(() => [...shown].reverse(), [shown]);
  const setMessages = useCallback(
    updater => {
      if (!activeChat) return;
      patchChatMessages(activeChat, prev =>
        typeof updater === 'function' ? updater(prev) : updater,
      );
    },
    [activeChat],
  );
  const [peerTyping, setPeerTyping] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const teacherLabel = personName(teacher, 'Teacher');
  const teacherPhoto = photoUri(teacher);
  const myName = parentDisplayName(userProfile);

  const stopTyping = useCallback(
    chatId => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
      if (!typingOn.current || !chatId) {
        typingOn.current = false;
        return;
      }
      typingOn.current = false;
      getAppSocket()?.emit('chat:typing', {chatId, typing: false, name: myName});
    },
    [myName],
  );

  const openOrCreate = useCallback(async () => {
    if (initialChatId) return initialChatId;
    if (!child?._id) return null;
    const teacherId = teacher?._id || teacher;
    const parentId = userProfile?._id || child?.parent?._id || child?.parent;
    if (!teacherId) {
      dispatch(asyncShowError('No class teacher assigned yet.'));
      return null;
    }
    if (!parentId) {
      dispatch(asyncShowError('Could not identify parent account.'));
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
      dispatch(asyncShowError(res?.message || 'Could not start chat'));
      return null;
    }
    return id;
  }, [child, initialChatId, teacher, userProfile?._id]);

  useEffect(() => {
    threadReadyRef.current = false;
    sawMessageLoad.current = false;
    setThreadReady(false);
  }, [activeChat]);

  useEffect(() => {
    if (messagesLoader) {
      sawMessageLoad.current = true;
    }
  }, [messagesLoader]);

  useEffect(() => {
    if (loading || messagesLoader || messages.length) return;
    // Wait until messages have actually been requested before showing empty state.
    if (activeChat && !sawMessageLoad.current) return;
    threadReadyRef.current = true;
    setThreadReady(true);
  }, [loading, messagesLoader, messages.length, activeChat]);

  useEffect(() => {
    if (!activeChat) return undefined;
    const roomId = String(activeChat);
    dispatch(setReadingChatId(roomId));
    markChatListRead('parent', roomId);
    dispatch(asyncMarkChatRead(roomId));
    return () => {
      dispatch(asyncMarkChatRead(roomId)).finally(() => {
        dispatch(setReadingChatId(null));
        queryClient.invalidateQueries({queryKey: chatKeys.list('parent')});
      });
    };
  }, [activeChat, dispatch]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const id = await openOrCreate();
        if (!alive) return;
        setActiveChat(id);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [openOrCreate]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = event => {
      setKeyboardHeight(keyboardOverlap(event));
      requestAnimationFrame(() => scrollToLatest());
    };
    const onHide = () => setKeyboardHeight(0);
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!activeChat) return undefined;
    const socket = connectAppSocket(token) || getAppSocket();
    if (!socket) return undefined;
    const roomId = String(activeChat);
    const join = () => {
      socket.emit('join chat', roomId);
    };
    const onMessage = record => {
      const body = record?.message?._id && !record?._id ? record.message : record;
      const incomingChat = messageChatId(body) || chatIdOf(body);
      if (!body?._id || incomingChat !== roomId) return;
      applyIncomingChatMessage('parent', {...body, chat: roomId});
      if (body.senderType !== 'parent') {
        if (peerTypingTimer.current) {
          clearTimeout(peerTypingTimer.current);
          peerTypingTimer.current = null;
        }
        setPeerTyping('');
      }
      scrollToLatest();
      if (body.attachment?.file && body.senderType === 'parent') {
        const audio = isChatAudio(body.attachment);
        const image = isChatImage(body.attachment);
        if (audio || image) {
          setOutgoing(prev => {
            const index = prev.findIndex(row => {
              if (row.status !== 'sending') return false;
              return audio ? isChatAudio(row.attachment) : isChatImage(row.attachment);
            });
            return index < 0 ? prev : prev.filter((_, i) => i !== index);
          });
        }
      }
      dispatch(setReadingChatId(roomId));
      markChatListRead('parent', roomId);
      dispatch(asyncMarkChatRead(roomId));
    };
    const onTyping = payload => {
      if (String(payload?.chatId || '') !== roomId) return;
      if (String(payload?.userId || '') === String(userProfile?._id || '')) return;
      if (peerTypingTimer.current) {
        clearTimeout(peerTypingTimer.current);
        peerTypingTimer.current = null;
      }
      if (!payload?.typing) {
        setPeerTyping('');
        return;
      }
      setPeerTyping('typing');
      scrollToLatest();
      peerTypingTimer.current = setTimeout(() => setPeerTyping(''), 2200);
    };
    const onDeleted = record => {
      const incomingChat = chatIdOf(record);
      if (!record?._id || incomingChat !== roomId) return;
      if (record.deletedForMe) {
        setMessages(prev => prev.filter(item => item?._id !== record._id));
        return;
      }
      if (record.deletedForEveryone) {
        setMessages(prev =>
          prev.map(item =>
            item?._id === record._id
              ? {...item, content: '', deletedForEveryone: true, attachment: undefined}
              : item,
          ),
        );
      }
    };
    socket.on('connect', join);
    socket.on('message', onMessage);
    socket.on('message:deleted', onDeleted);
    socket.on('chat:typing', onTyping);
    if (socket.connected) join();
    return () => {
      stopTyping(roomId);
      socket.off('connect', join);
      socket.off('message', onMessage);
      socket.off('message:deleted', onDeleted);
      socket.off('chat:typing', onTyping);
      setPeerTyping('');
    };
  }, [activeChat, dispatch, stopTyping, token, userProfile?._id]);

  const canDeleteForEveryone = Boolean(
    menuMessage?._id && ownsMessage(menuMessage, userProfile?._id, 'parent'),
  );

  const runDelete = async () => {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      if (confirmDelete === 'chat') {
        if (!activeChat) return;
        const res = await callApi({
          method: 'POST',
          path: allApiPaths.getPath('deleteChat'),
          body: {chatId: activeChat},
        });
        if (res?.status) {
          removeChatFromList('parent', activeChat);
          setConfirmDelete(null);
          navigation.goBack();
        } else {
          dispatch(asyncShowError(res?.message || 'Could not delete chat'));
        }
        return;
      }
      if (!menuMessage?._id) return;
      const res = await callApi({
        method: 'POST',
        path: allApiPaths.getPath('deleteChatMessage'),
        body: {messageId: menuMessage._id, scope: confirmDelete},
      });
      if (!res?.status) {
        dispatch(asyncShowError(res?.message || 'Could not delete message'));
        return;
      }
      if (confirmDelete === 'me') {
        setMessages(prev => prev.filter(item => item?._id !== menuMessage._id));
      } else {
        setMessages(prev =>
          prev.map(item =>
            item?._id === menuMessage._id
              ? {...item, content: '', deletedForEveryone: true, attachment: undefined}
              : item,
          ),
        );
      }
      setConfirmDelete(null);
      setMenuMessage(null);
    } finally {
      setDeleting(false);
    }
  };

  const deleteLibraryItems = async (items, scope) => {
    const allowed =
      scope === 'everyone'
        ? items.filter(item => ownsMessage(item, userProfile?._id, 'parent'))
        : items;
    if (!allowed.length) return false;
    const ids = allowed.map(item => item._id || item.id).filter(Boolean);
    for (const messageId of ids) {
      const res = await callApi({
        method: 'POST',
        path: allApiPaths.getPath('deleteChatMessage'),
        body: {messageId, scope},
      });
      if (!res?.status) {
        dispatch(asyncShowError(res?.message || 'Could not delete'));
        return false;
      }
    }
    const idSet = new Set(ids);
    setMessages(prev =>
      scope === 'me'
        ? prev.filter(item => !idSet.has(item._id))
        : prev.map(item =>
            idSet.has(item._id)
              ? {...item, content: '', deletedForEveryone: true, attachment: undefined}
              : item,
          ),
    );
    return true;
  };

  const openPhotoPicker = fromCamera => {
    setPhotoAsk(false);
    // Wait for SmallDialog's Modal to finish dismissing before presenting camera/library.
    const run = () => {
      sendPhoto(fromCamera);
    };
    InteractionManager.runAfterInteractions(() => {
      setTimeout(run, Platform.OS === 'ios' ? 400 : 250);
    });
  };

  const denyMedia = (fromCamera, forever) => {
    dispatch(
      asyncShowError(
        fromCamera
          ? forever
            ? 'Camera access is off. Enable it in Settings to take a photo.'
            : 'Allow camera access to take a photo.'
          : forever
            ? 'Photo access is off. Enable it in Settings to choose a photo.'
            : 'Allow photo access to choose an image.',
      ),
    );
    if (forever) {
      Linking.openSettings().catch(() => {});
    }
  };

  const sendPhoto = async (fromCamera = false) => {
    if (!activeChat || sendingPhoto || recordingRef.current) return;
    if (fromCamera) {
      const camera = await ensureCameraPermission();
      if (!camera.ok) {
        denyMedia(true, camera.forever);
        return;
      }
    } else {
      const gallery = await ensureGalleryPermission();
      if (!gallery.ok) {
        denyMedia(false, gallery.forever);
        return;
      }
    }
    let picked;
    try {
      const shared = {
        mediaType: 'photo',
        quality: 1,
        presentationStyle: 'fullScreen',
      };
      picked = fromCamera
        ? await launchCamera({
            ...shared,
            saveToPhotos: false,
            cameraType: 'back',
          })
        : await launchImageLibrary({
            ...shared,
            selectionLimit: 1,
          });
    } catch (error) {
      dispatch(asyncShowError(error instanceof Error ? error.message : 'Could not open the camera'));
      return;
    }
    if (picked?.didCancel) return;
    if (picked?.errorCode) {
      if (picked.errorCode === 'permission') {
        denyMedia(fromCamera, true);
        return;
      }
      if (picked.errorCode === 'camera_unavailable') {
        dispatch(asyncShowError('Camera is not available on this device.'));
        return;
      }
      dispatch(asyncShowError(picked.errorMessage || 'Could not open the camera'));
      return;
    }
    const asset = picked?.assets?.[0];
    const photoUri = normalizeFileUri(asset?.uri || asset?.originalPath);
    if (!photoUri) return;
    queueOutgoing({
      _id: `local-${Date.now()}`,
      local: true,
      status: 'sending',
      senderType: 'parent',
      createdAt: new Date().toISOString(),
      attachment: {
        file: photoUri,
        name: asset.fileName || 'photo.jpg',
        mime: asset.type || 'image/jpeg',
        duration: 0,
        local: true,
      },
    });
  };

  const sendOutgoing = item => {
    if (!activeChat || !item?._id) return;
    setOutgoing(prev => prev.map(row => (row._id === item._id ? {...row, status: 'sending'} : row)));
    uploadChatFile(String(activeChat), {
      uri: item.attachment.file,
      name: item.attachment.name,
      type: item.attachment.mime,
      duration: item.attachment.duration,
      waveform: item.attachment.waveform,
    })
      .then(saved => {
        if (!saved?._id) throw new Error('Could not send');
        applyIncomingChatMessage('parent', {...saved, chat: String(activeChat), senderType: saved.senderType || 'parent'});
        setOutgoing(prev => prev.filter(row => row._id !== item._id));
        scrollToLatest();
      })
      .catch(error => {
        setOutgoing(prev => prev.map(row => (row._id === item._id ? {...row, status: 'failed'} : row)));
        dispatch(asyncShowError(error instanceof Error ? error.message : 'Could not send'));
      });
  };

  const queueOutgoing = item => {
    setOutgoing(prev => [...prev, item]);
    scrollToLatest();
    sendOutgoing(item);
  };

  const openDocument = async (file, own) => {
    if (!file) return;
    try {
      if (!isSaved(file, own)) {
        await downloadFile(file);
        finishDownload(file);
      }
      await Linking.openURL(getImagePath(file));
    } catch (error) {
      dispatch(asyncShowError('Could not open the document'));
    }
  };

  const sendDocument = async () => {
    if (!activeChat || sendingPhoto || recordingRef.current) return;
    try {
      const [file] = await pick({
        allowMultiSelection: false,
        type: [types.pdf, types.doc, types.docx, types.plainText, types.xls, types.xlsx, types.ppt, types.pptx],
      });
      if (!file?.uri) return;
      // v12 picker returns content:// on Android — copy into app cache before upload.
      const [local] = await keepLocalCopy({
        files: [
          {
            uri: file.uri,
            fileName: file.name || 'document.bin',
            convertVirtualFileToType: file.isVirtual
              ? file.convertibleToMimeTypes?.[0]?.mimeType || file.type || undefined
              : undefined,
          },
        ],
        destination: 'cachesDirectory',
      });
      if (local?.status !== 'success' || !local.localUri) {
        dispatch(asyncShowError(local?.copyError || 'Could not read the file'));
        return;
      }
      const uri = normalizeFileUri(local.localUri);
      if (!uri) {
        dispatch(asyncShowError('Could not read the file'));
        return;
      }
      setSendingPhoto(true);
      const saved = await uploadChatFile(String(activeChat), {
        uri,
        name: file.name || undefined,
        type: file.type || undefined,
      });
      if (saved?._id) {
        applyIncomingChatMessage('parent', {
          ...saved,
          chat: String(activeChat),
          senderType: saved.senderType || 'parent',
        });
        scrollToLatest();
      } else {
        dispatch(asyncShowError('Could not send the document'));
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return;
      dispatch(asyncShowError(error instanceof Error ? error.message : 'Could not send the document'));
    } finally {
      setSendingPhoto(false);
    }
  };

  useEffect(() => {
    if (!recording) return undefined;
    const timer = setInterval(() => {
      const secs = Math.max(0, Math.floor((Date.now() - recordStartedAt.current) / 1000));
      recordSecondsRef.current = secs;
      setRecordLabel(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
    }, 400);
    return () => clearInterval(timer);
  }, [recording]);

  useEffect(
    () => () => {
      if (recordingRef.current) stopVoice().catch(() => {});
    },
    [],
  );

  const resetVoiceHold = () => {
    voiceLockedRef.current = false;
    setVoiceLocked(false);
    setVoiceDrag({x: 0, y: 0});
  };

  const beginVoice = async () => {
    if (!activeChat || sendingPhoto || recordingRef.current) return;
    const ticket = (voiceTicket.current += 1);
    voiceGate.current = {action: ''};
    setEmojiOpen(false);
    try {
      await startVoice();
      if (voiceTicket.current !== ticket) {
        await stopVoice().catch(() => {});
        return;
      }
      const action = voiceGate.current.action;
      if (action === 'cancel') {
        await stopVoice().catch(() => {});
        resetVoiceHold();
        return;
      }
      recordingRef.current = true;
      recordStartedAt.current = Date.now();
      recordSecondsRef.current = 0;
      setRecordLabel('0:00');
      setRecording(true);
      if (action === 'lock') {
        voiceLockedRef.current = true;
        setVoiceLocked(true);
        return;
      }
      if (action === 'send') finishVoice();
    } catch (error) {
      recordingRef.current = false;
      setRecording(false);
      resetVoiceHold();
      dispatch(asyncShowError(error instanceof Error ? error.message : 'Could not record'));
    }
  };

  const cancelVoice = async () => {
    voiceTicket.current += 1;
    recordingRef.current = false;
    resetVoiceHold();
    setRecording(false);
    await stopVoice().catch(() => {});
  };

  const lockVoice = () => {
    voiceLockedRef.current = true;
    setVoiceLocked(true);
    setVoiceDrag({x: 0, y: 0});
  };

  const finishVoice = async () => {
    if (!recordingRef.current || !activeChat) return;
    const seconds = Math.max(
      1,
      Math.floor((Date.now() - (recordStartedAt.current || Date.now())) / 1000),
    );
    recordingRef.current = false;
    resetVoiceHold();
    setRecording(false);
    try {
      const file = voiceUpload(await stopVoice());
      if (!file) return;
      queueOutgoing({
        _id: `local-${Date.now()}`,
        local: true,
        status: 'sending',
        senderType: 'parent',
        createdAt: new Date().toISOString(),
        attachment: {
          file: file.uri,
          name: file.name,
          mime: file.type,
          duration: seconds,
          waveform: takeVoiceWave(),
          local: true,
        },
      });
    } catch (error) {
      dispatch(asyncShowError(error instanceof Error ? error.message : 'Could not send the voice message'));
    }
  };

  voiceApi.current = {beginVoice, cancelVoice, finishVoice, lockVoice};

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeChat || sending) return;
    stopTyping(String(activeChat));
    const tempId = `local-text-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        _id: tempId,
        content: body,
        senderType: 'parent',
        createdAt: new Date().toISOString(),
        pending: true,
        chat: String(activeChat),
      },
    ]);
    draftRef.current = '';
    setDraft('');
    scrollToLatest();
    setSending(true);
    try {
      const res = await callApi({
        method: 'POST',
        path: allApiPaths.getPath('createChatRoomMessage'),
        body: {chatId: activeChat, content: body, senderType: 'parent'},
      });
      if (res?.data?.message) {
        setMessages(prev => prev.filter(item => item?._id !== tempId));
        applyIncomingChatMessage('parent', {...res.data.message, chat: String(activeChat)});
        scrollToLatest();
      } else {
        setMessages(prev => prev.filter(item => item?._id !== tempId));
        draftRef.current = body;
        setDraft(body);
        dispatch(asyncShowError(res?.message || 'Could not send'));
      }
    } catch (error) {
      setMessages(prev => prev.filter(item => item?._id !== tempId));
      draftRef.current = body;
      setDraft(body);
      dispatch(asyncShowError(error instanceof Error ? error.message : 'Could not send'));
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
        <TouchableOpacity
          style={styles.headerCopy}
          onPress={() => setLibraryOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Photos, links and documents">
          <Text style={styles.teacherName} numberOfLines={1}>
            {teacherLabel}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {childName(child)}
            {classLabel(child?.classroom)
              ? ` · ${classLabel(child.classroom)}`
              : ''}
          </Text>
        </TouchableOpacity>
        {activeChat ? (
          <TouchableOpacity
            ref={dotsRef}
            onPress={() => {
              dotsRef.current?.measureInWindow((x, y, width, height) => {
                setMenuAnchor({x, y, width, height});
                setRoomMenu(true);
              });
            }}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Chat options">
            <Ionicons name="ellipsis-horizontal" size={22} color={NAVY} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.body, keyboardHeight > 0 && {paddingBottom: keyboardHeight}]}>
          <FlatList
            ref={listRef}
            data={peerTyping ? [{_id: 'typing-bubble', typing: true}, ...threadData] : threadData}
            inverted={(peerTyping ? threadData.length + 1 : threadData.length) > 0}
            keyExtractor={(item, index) => item._id || String(index)}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (!threadReadyRef.current || followLatest.current) {
                listRef.current?.scrollToOffset?.({offset: 0, animated: false});
              }
              if (threadReadyRef.current) {
                return;
              }
              requestAnimationFrame(() => {
                listRef.current?.scrollToOffset?.({offset: 0, animated: false});
                requestAnimationFrame(() => {
                  if (threadReadyRef.current) {
                    return;
                  }
                  threadReadyRef.current = true;
                  followLatest.current = false;
                  setThreadReady(true);
                });
              });
            }}
            renderItem={({item, index}) => {
              if (item.typing) {
                return (
                  <View style={[styles.bubble, styles.theirs, styles.typingBubble]}>
                    <TypingDots />
                  </View>
                );
              }
              const mine = item.senderType === 'parent';
              const local = Boolean(item.local);
              const audio = Boolean(
                item.attachment?.file && !item.deletedForEveryone && isChatAudio(item.attachment),
              );
              const sendingNow = item.status === 'sending';
              const failed = item.status === 'failed';
              const older = peerTyping ? threadData[index] : threadData[index + 1];
              const showDay =
                item.createdAt &&
                (!older?.createdAt ||
                  !moment(item.createdAt).isSame(moment(older.createdAt), 'day'));
              const dayText = item.createdAt
                ? moment(item.createdAt).calendar(null, {
                    sameDay: '[Today]',
                    lastDay: '[Yesterday]',
                    lastWeek: 'dddd',
                    sameElse: 'D MMM YYYY',
                  })
                : '';
              return (
                <View>
                  {showDay ? (
                    <Text style={styles.timeLabel}>{dayText}</Text>
                  ) : null}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    delayLongPress={280}
                    disabled={!item._id || local}
                    onLongPress={() => setMenuMessage(item)}
                    style={[
                      styles.bubble,
                      mine ? styles.mine : styles.theirs,
                      item.deletedForEveryone && styles.bubbleDeleted,
                    ]}>
                    {item.attachment?.file && !item.deletedForEveryone ? (
                      isChatImage(item.attachment) ? (
                        <ChatPhoto
                          file={item.attachment.file}
                          saved={isSaved(item.attachment.file, mine)}
                          busy={downloading === item.attachment.file}
                          sending={sendingNow}
                          local={local}
                          onDownload={downloadFile}
                          onLoad={finishDownload}
                          onError={forgetDownload}
                          onLongPress={() => setMenuMessage(item)}
                          style={styles.attachImage}
                        />
                      ) : isChatAudio(item.attachment) ? (
                        <ChatVoice
                          file={item.attachment.file}
                          saved={local || isSaved(item.attachment.file, mine)}
                          light={mine}
                          seconds={item.attachment.duration}
                          waveform={item.attachment.waveform}
                          stamp={item.createdAt ? moment(item.createdAt).format('h:mm A') : ''}
                          sending={sendingNow}
                          onDownload={async file => {
                            await downloadFile(file);
                            finishDownload(file);
                          }}
                          onLongPress={() => setMenuMessage(item)}
                        />
                      ) : (
                        <ChatDocument
                          name={item.attachment.name}
                          saved={isSaved(item.attachment.file, mine)}
                          busy={downloading === item.attachment.file}
                          light={mine}
                          onPress={() => openDocument(item.attachment.file, mine)}
                          onLongPress={() => setMenuMessage(item)}
                        />
                      )
                    ) : null}
                    {item.deletedForEveryone || item.content ? (
                      <Text
                        style={[
                          styles.msg,
                          mine && styles.msgMine,
                          item.deletedForEveryone && styles.msgDeleted,
                        ]}>
                        {item.deletedForEveryone ? 'This message was deleted' : item.content}
                      </Text>
                    ) : null}
                    {item.createdAt && !audio ? (
                      <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                        {moment(item.createdAt).format('h:mm A')}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                  {failed ? (
                    <View style={[styles.failRow, mine && styles.failRowMine]}>
                      <TouchableOpacity onPress={() => sendOutgoing(item)} accessibilityRole="button">
                        <Text style={styles.failText}>Resend</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setOutgoing(prev => prev.filter(row => row._id !== item._id))}
                        accessibilityRole="button">
                        <Text style={styles.failText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            }}
            ListEmptyComponent={
              awaitingMessages ? (
                <ThreadMessagesSkeleton />
              ) : (
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
                    Say hello to {teacherLabel}. Hold a message to delete it for you, or for everyone.
                  </Text>
                </View>
              )
            }
          />
          {emojiOpen && !recording ? (
            <View style={styles.emojiPanel}>
              <EmojiKeyboard
                onEmojiSelected={emoji =>
                  setDraft(prev => {
                    const next = `${prev}${emoji.emoji}`.slice(0, 2000);
                    draftRef.current = next;
                    return next;
                  })
                }
                enableSearchBar
                categoryPosition="bottom"
                emojiSize={26}
                enableRecentlyUsed
                disableSafeArea
                theme={emojiTheme}
              />
            </View>
          ) : null}
          <View
            style={[
              styles.composer,
              recording && styles.composerRecording,
              {paddingBottom: keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 10)},
            ]}>
            {recording ? (
              <View style={styles.recordBar}>
                <View style={styles.recordClock}>
                  <View style={styles.recordDot} />
                  <Text style={styles.recordTime}>{recordLabel}</Text>
                </View>
                {voiceLocked ? (
                  <TouchableOpacity
                    onPress={cancelVoice}
                    style={styles.cancelHit}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel recording">
                    <Text style={styles.cancelRecord}>Cancel</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.slideCancel} pointerEvents="none">
                    <Ionicons name="chevron-back" size={16} color={MUTED} />
                    <Text style={[styles.cancelRecord, {opacity: Math.max(0.3, 1 + voiceDrag.x / 120)}]}>
                      Slide to cancel
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.field}>
                <TouchableOpacity
                  style={styles.fieldIcon}
                  onPress={() => setEmojiOpen(open => !open)}
                  accessibilityRole="button"
                  accessibilityLabel="Emoji">
                  <Feather name="smile" size={20} color={emojiOpen ? BLUE : COMPOSER_ICON} />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={draft}
                  onChangeText={text => {
                    draftRef.current = text;
                    setDraft(text);
                    const chatId = String(activeChat || '');
                    const socket = getAppSocket();
                    if (!socket || !chatId) return;
                    if (!text.trim()) {
                      stopTyping(chatId);
                      return;
                    }
                    if (!typingOn.current || Date.now() - lastTypingEmit.current > 800) {
                      typingOn.current = true;
                      lastTypingEmit.current = Date.now();
                      socket.emit('chat:typing', {
                        chatId,
                        typing: true,
                        name: myName,
                      });
                    }
                    if (typingTimer.current) clearTimeout(typingTimer.current);
                    typingTimer.current = setTimeout(() => stopTyping(chatId), 1200);
                  }}
                  placeholder="Write a message"
                  placeholderTextColor={MUTED}
                  multiline
                  maxLength={2000}
                  editable={Boolean(activeChat) && !sending}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={styles.fieldIcon}
                  onPress={sendDocument}
                  disabled={!activeChat || sendingPhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Send a document">
                  <Feather name="paperclip" size={20} color={COMPOSER_ICON} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fieldIcon, styles.cameraIcon]}
                  onPress={() => setPhotoAsk(true)}
                  disabled={!activeChat || sendingPhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Send a photo">
                  <Feather name="camera" size={20} color={COMPOSER_ICON} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.micSlot}>
              {recording && !voiceLocked ? (
                <View style={[styles.lockPill, voiceDrag.y < -36 && styles.lockPillOn]} pointerEvents="none">
                  <Feather name="lock" size={15} color={voiceDrag.y < -36 ? BLUE : NAVY} />
                </View>
              ) : null}
              {draft.trim() && !recording ? (
                <TouchableOpacity
                  style={[styles.send, (!activeChat || sending || sendingPhoto) && styles.sendDisabled]}
                  onPress={send}
                  disabled={!activeChat || sending || sendingPhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Send message">
                  <Ionicons name="send" size={18} color="#FFF" />
                </TouchableOpacity>
              ) : voiceLocked ? (
                <TouchableOpacity
                  style={styles.send}
                  onPress={finishVoice}
                  accessibilityRole="button"
                  accessibilityLabel="Send voice message">
                  <Ionicons name="send" size={18} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <View
                  {...voicePan.panHandlers}
                  style={[
                    styles.send,
                    (!activeChat || sending || sendingPhoto) && styles.sendDisabled,
                    {transform: [{translateX: voiceDrag.x}, {translateY: voiceDrag.y}]},
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Hold to record a voice message">
                  <Ionicons name="mic" size={18} color="#FFF" />
                </View>
              )}
            </View>
          </View>
      </View>
      <Modal
        visible={roomMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setRoomMenu(false)}>
        <Pressable style={styles.menuScrim} onPress={() => setRoomMenu(false)}>
          <Pressable
            style={[
              styles.menuPop,
              {
                top: (menuAnchor?.y || 0) + (menuAnchor?.height || 40) + 6,
                right: Math.max(
                  8,
                  Dimensions.get('window').width - ((menuAnchor?.x || 0) + (menuAnchor?.width || 40)),
                ),
              },
            ]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setRoomMenu(false);
                setLibraryOpen(true);
              }}
              accessibilityRole="button">
              <Text style={styles.menuItemText}>Photos, links and documents</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setRoomMenu(false);
                setConfirmDelete('chat');
              }}
              accessibilityRole="button">
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Delete chat</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      <SmallDialog
        compact
        visible={photoAsk}
        title="Photo"
        onClose={() => setPhotoAsk(false)}
        actions={[
          {
            label: 'Take a photo',
            onPress: () => openPhotoPicker(true),
          },
          {
            label: 'Choose a photo',
            onPress: () => openPhotoPicker(false),
          },
          {label: 'Cancel', onPress: () => setPhotoAsk(false)},
        ]}
      />
      <ChatLibrary
        visible={libraryOpen}
        title={teacherLabel}
        records={messages.map(item => ({
          ...item,
          id: item._id,
          mine: item.senderType === 'parent',
        }))}
        isSaved={isSaved}
        downloading={downloading}
        onDownload={downloadFile}
        onLoad={finishDownload}
        onError={forgetDownload}
        onDelete={deleteLibraryItems}
        onClose={() => setLibraryOpen(false)}
        userId={userProfile?._id}
      />
      <SmallDialog
        compact
        visible={Boolean(menuMessage) && !confirmDelete}
        title="Delete message"
        message={
          canDeleteForEveryone
            ? 'For you, or for everyone?'
            : 'This leaves your chat. The other person still sees it.'
        }
        onClose={() => setMenuMessage(null)}
        actions={[
          {label: 'Delete for me', danger: true, onPress: () => setConfirmDelete('me')},
          ...(canDeleteForEveryone
            ? [{label: 'Delete for everyone', danger: true, onPress: () => setConfirmDelete('everyone')}]
            : []),
          {label: 'Cancel', onPress: () => setMenuMessage(null)},
        ]}
      />
      <SmallDialog
        compact={confirmDelete !== 'chat'}
        visible={Boolean(confirmDelete)}
        title={
          confirmDelete === 'chat'
            ? 'Delete this chat?'
            : confirmDelete === 'everyone'
              ? 'Delete for everyone?'
              : 'Delete for you?'
        }
        message={
          confirmDelete === 'chat'
            ? 'It will leave your chat list. The teacher still has the conversation.'
            : confirmDelete === 'everyone'
              ? 'This message will disappear for both of you. You can do this for 48 hours after sending it.'
              : 'This message will leave your chat. The other person will still see it.'
        }
        onClose={() => {
          if (!deleting) setConfirmDelete(null);
        }}
        actions={[
          {label: 'Keep', disabled: deleting, onPress: () => setConfirmDelete(null)},
          {
            label: deleting ? 'Deleting' : confirmDelete === 'everyone' ? 'Delete for everyone' : 'Delete for me',
            danger: true,
            disabled: deleting,
            onPress: runDelete,
          },
        ]}
      />
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
  menuScrim: {flex: 1},
  menuPop: {
    position: 'absolute',
    minWidth: 248,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#0F1F4B',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
  },
  menuItem: {paddingHorizontal: 16, paddingVertical: 14},
  menuItemText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  menuItemDanger: {color: '#E11D48'},
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
  messageList: {flex: 1},
  threadHidden: {opacity: 0},
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
  msg: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    lineHeight: 20,
    color: NAVY,
  },
  msgMine: {color: '#FFF'},
  bubbleDeleted: {backgroundColor: '#EEF1F6'},
  msgDeleted: {fontStyle: 'italic', color: MUTED},
  bubbleTime: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 10,
    color: MUTED,
  },
  bubbleTimeMine: {color: 'rgba(255,255,255,0.78)'},
  choiceRoot: {flex: 1, justifyContent: 'flex-end'},
  choiceDim: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 31, 75, 0.46)'},
  choiceSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  choiceTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
    marginBottom: 8,
  },
  choiceRow: {paddingVertical: 14},
  choiceDanger: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 16,
    color: '#E11D48',
  },
  threadEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  threadSkeleton: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  threadBone: {
    height: 42,
    borderRadius: 16,
    backgroundColor: '#E6EAF1',
  },
  threadBoneTheirs: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  threadBoneMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#D7E6F6',
    borderBottomRightRadius: 6,
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
  typingBubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 10,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: MUTED,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E8EE',
  },
  emojiPanel: {
    height: 292,
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E8EE',
  },
  field: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    backgroundColor: PAGE_BG,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fieldIcon: {
    width: 34,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {marginRight: 8},
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingLeft: 4,
    paddingRight: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    color: NAVY,
  },
  composerRecording: {alignItems: 'center'},
  recordBar: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: PAGE_BG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
  },
  recordClock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
  },
  recordTime: {
    minWidth: 36,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: '#E11D48',
  },
  slideCancel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  cancelHit: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRecord: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: MUTED,
  },
  micSlot: {
    width: 44,
    height: 44,
    overflow: 'visible',
  },
  lockPill: {
    position: 'absolute',
    bottom: 52,
    left: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6E8EE',
  },
  lockPillOn: {
    borderColor: BLUE,
    backgroundColor: BLUE_SOFT,
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
  attachImage: {
    width: 180,
    height: 140,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#E6EEF6',
  },
  failRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  failRowMine: {alignSelf: 'flex-end'},
  failText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#E11D48',
  },
});

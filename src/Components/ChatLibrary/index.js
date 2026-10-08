import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TurboModuleRegistry,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import {getImagePath} from '../../Service/axios';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const BLUE = '#035392';
const LINK_RE = /(?:https?:\/\/|www\.)[^\s]+/gi;
const DELETE_FOR_EVERYONE_MS = 48 * 60 * 60 * 1000;

export function isChatImage(attachment) {
  if (!attachment) return false;
  const mime = String(attachment.mime || '').toLowerCase();
  const name = String(attachment.name || attachment.file || '');
  if (/\.pdf($|\?)/i.test(name) || mime === 'application/pdf' || mime === 'image/pdf') return false;
  if (mime.startsWith('image/')) return true;
  if (mime && !mime.startsWith('image/')) return false;
  if (!attachment.file && !attachment.expired) return false;
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

export function isAttachmentGone(attachment) {
  if (!attachment) return false;
  return Boolean(attachment.expired || (!attachment.file && (attachment.name || attachment.mime)));
}

export function isChatAudio(attachment) {
  if (!attachment?.file) return false;
  const mime = String(attachment.mime || '').toLowerCase();
  if (mime.startsWith('audio/')) return true;
  return /\.(m4a|aac|mp3|wav|caf)$/i.test(`${attachment.file} ${attachment.name || ''}`);
}

let soundModule;
function getSound() {
  if (soundModule !== undefined) {
    return soundModule;
  }
  if (!TurboModuleRegistry.get('NitroModules')) {
    soundModule = null;
    return null;
  }
  try {
    soundModule = require('react-native-nitro-sound').default;
  } catch {
    soundModule = null;
  }
  return soundModule;
}

const voiceListeners = new Set();
const WAVE_BARS = 28;
let waveOwner = null;

function releaseWave(owner) {
  if (waveOwner !== owner) return;
  waveOwner = null;
  const sound = getSound();
  if (!sound) return;
  try {
    sound.removePlayBackListener();
  } catch {
    // no playback listener was attached
  }
  try {
    sound.removePlaybackEndListener();
  } catch {
    // no end listener was attached
  }
}

function waveFrom(seed) {
  let n = 2166136261;
  const text = String(seed || 'voice');
  for (let i = 0; i < text.length; i += 1) {
    n ^= text.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  const bars = [];
  for (let i = 0; i < WAVE_BARS; i += 1) {
    n = Math.imul(n ^ (n >>> 15), 2246822519);
    const unit = ((n >>> 0) % 1000) / 1000;
    const shape = 0.35 + 0.65 * Math.abs(Math.sin((i / (WAVE_BARS - 1)) * Math.PI * 2.4));
    bars.push(0.18 + unit * 0.82 * shape);
  }
  return bars;
}

function barsFor(file, waveform) {
  if (Array.isArray(waveform) && waveform.length) {
    const bars = [];
    for (let i = 0; i < WAVE_BARS; i += 1) {
      const at =
        waveform.length === 1 ? 0 : Math.round((i * (waveform.length - 1)) / (WAVE_BARS - 1));
      let value = Number(waveform[at]) || 0;
      if (value > 1) value /= 100;
      bars.push(Math.max(0.12, Math.min(1, value)));
    }
    return bars;
  }
  return waveFrom(file);
}

export function liveWaveBars(levels, count = WAVE_BARS) {
  const source = Array.isArray(levels) ? levels.slice(-count) : [];
  return Array(Math.max(0, count - source.length)).fill(0.14).concat(source);
}

function normalizeSeconds(value) {
  let total = Number(value) || 0;
  if (total >= 1000) total /= 1000;
  return Math.max(0, Math.round(total));
}

function voiceClock(seconds) {
  const total = normalizeSeconds(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function secondsFrom(meta) {
  return normalizeSeconds(meta?.duration);
}

function playRatio(meta) {
  let duration = Number(meta?.duration) || 0;
  let position = Number(meta?.currentPosition) || 0;
  if (!(duration > 0)) return 0;
  if (duration >= 1000) {
    duration /= 1000;
    position /= 1000;
  }
  return Math.max(0, Math.min(1, position / duration));
}

export function VoiceBars({bars, progress = 0, color = NAVY}) {
  const played = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.wave}>
      {bars.map((height, index) => {
        const heard = played > 0 && index / Math.max(1, bars.length - 1) <= played;
        return (
          <View
            key={index}
            style={[
              styles.waveBar,
              {
                height: 4 + height * 16,
                backgroundColor: color,
                opacity: played > 0 ? (heard ? 1 : 0.32) : 0.82,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function linksIn(text) {
  const found = String(text || '').match(LINK_RE) || [];
  return found.map(link => link.replace(/[),.;]+$/, ''));
}

function senderIdOf(item) {
  const sender = item?.sender;
  if (!sender) return '';
  if (typeof sender === 'object') return String(sender._id || sender.id || '');
  return String(sender);
}

function ownsItem(item, userId) {
  const senderId = senderIdOf(item);
  if (userId && senderId) return senderId === String(userId);
  return item?.mine === true;
}

function canDeleteForEveryone(item, userId) {
  return Boolean(
    ownsItem(item, userId) &&
      item?.createdAt &&
      !item.deletedForEveryone &&
      Date.now() - new Date(item.createdAt).getTime() < DELETE_FOR_EVERYONE_MS,
  );
}

function documentTypeLabel(name, mime) {
  const file = String(name || '');
  const ext = file.match(/\.([a-z0-9]{2,5})$/i);
  if (ext) return ext[1].toUpperCase();
  const type = String(mime || '').toLowerCase();
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('wordprocessingml')) return 'DOCX';
  if (type.includes('msword')) return 'DOC';
  if (type.includes('spreadsheetml')) return 'XLSX';
  if (type.includes('ms-excel')) return 'XLS';
  if (type.includes('presentationml')) return 'PPTX';
  if (type.includes('ms-powerpoint')) return 'PPT';
  if (type.startsWith('text/')) return 'TXT';
  return 'FILE';
}

const DOC_COLORS = {
  PDF: '#E11D48',
  DOC: '#2563EB',
  DOCX: '#2563EB',
  XLS: '#059669',
  XLSX: '#059669',
  CSV: '#059669',
  PPT: '#EA580C',
  PPTX: '#EA580C',
  TXT: '#475569',
  FILE: '#035392',
};

export function ChatDocument({name, mime, saved, busy, sending, light, unavailable, onPress, onLongPress}) {
  const kind = documentTypeLabel(name, mime);
  const accent = unavailable ? '#8B93A7' : DOC_COLORS[kind] || DOC_COLORS.FILE;
  const title = unavailable
    ? 'No longer available'
    : sending
      ? name || 'Document'
      : busy
        ? 'Downloading'
        : saved
          ? name || 'Document'
          : 'Download';
  return (
    <TouchableOpacity
      style={[styles.docCard, light && styles.docCardLight]}
      onPress={sending || unavailable || busy ? undefined : onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      disabled={(unavailable || sending || busy) && !onLongPress}
      accessibilityRole="button"
      accessibilityLabel={sending ? `Sending ${kind}` : `${kind} ${title}`}>
      <View style={[styles.docBadge, {backgroundColor: accent}]}>
        {busy && !sending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="document-text" size={26} color="#FFFFFF" />
        )}
        <Text style={styles.docKind}>{kind}</Text>
      </View>
      <Text style={[styles.docName, light && styles.docNameLight]} numberOfLines={2}>
        {title}
      </Text>
      {sending ? (
        <View style={styles.sendDot} pointerEvents="none">
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export function ChatVoice({file, saved, light, seconds, stamp, waveform, sending, onDownload, onLongPress}) {
  const known = normalizeSeconds(seconds);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [length, setLength] = useState(known);
  const id = useRef({});
  const playingRef = useRef(false);
  const bars = useMemo(() => barsFor(file, waveform), [file, waveform]);
  const color = light ? '#FFFFFF' : NAVY;
  const clock = voiceClock(known || length);

  useEffect(() => {
    setLength(normalizeSeconds(seconds));
  }, [seconds]);

  useEffect(() => {
    const notice = owner => {
      if (owner !== id.current) {
        playingRef.current = false;
        setPlaying(false);
        setProgress(0);
        releaseWave(id.current);
      }
    };
    voiceListeners.add(notice);
    return () => {
      voiceListeners.delete(notice);
      if (playingRef.current) {
        playingRef.current = false;
        releaseWave(id.current);
        getSound()?.stopPlayer().catch(() => {});
      }
    };
  }, []);

  const stop = async () => {
    playingRef.current = false;
    setPlaying(false);
    setProgress(0);
    releaseWave(id.current);
    await getSound()?.stopPlayer().catch(() => {});
  };

  const toggle = async () => {
    if (sending) return;
    if (!saved) {
      onDownload?.(file);
      return;
    }
    if (playing) {
      await stop();
      return;
    }
    voiceListeners.forEach(notice => notice(id.current));
    playingRef.current = true;
    waveOwner = id.current;
    setPlaying(true);
    setProgress(0);
    try {
      const sound = getSound();
      if (!sound) {
        playingRef.current = false;
        setPlaying(false);
        return;
      }
      sound.setSubscriptionDuration(0.1);
      await sound.startPlayer(photoUri(file, false));
      if (waveOwner !== id.current) return;
      sound.addPlayBackListener(meta => {
        if (waveOwner !== id.current) return;
        const heard = secondsFrom(meta);
        if (!known && heard > 0 && heard < 600) setLength(heard);
        const ratio = playRatio(meta);
        setProgress(ratio >= 0.98 ? 1 : ratio);
      });
      sound.addPlaybackEndListener(() => {
        if (waveOwner !== id.current) return;
        playingRef.current = false;
        setPlaying(false);
        setProgress(0);
        releaseWave(id.current);
      });
    } catch {
      playingRef.current = false;
      setPlaying(false);
      setProgress(0);
      releaseWave(id.current);
    }
  };

  return (
    <TouchableOpacity
      style={styles.voice}
      onPress={toggle}
      onLongPress={onLongPress}
      delayLongPress={280}
      accessibilityRole="button"
      accessibilityLabel={sending ? 'Sending voice message' : saved ? (playing ? 'Pause voice message' : 'Play voice message') : 'Download voice message'}>
      <View style={styles.voiceRow}>
        {sending ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Ionicons name={!saved ? 'arrow-down' : playing ? 'pause' : 'play'} size={18} color={color} />
        )}
        <VoiceBars bars={bars} progress={saved && !sending ? progress : 0} color={color} />
      </View>
      <View style={styles.voiceMeta}>
        <Text style={[styles.voiceTime, {color}]}>{clock}</Text>
        {stamp ? <Text style={[styles.voiceTime, {color}]}>{stamp}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function photoUri(file, local) {
  const value = String(file || '');
  if (local || value.startsWith('file:') || value.startsWith('content:')) return value;
  return getImagePath(value);
}

export function ChatLightbox({uri, onClose}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={Boolean(uri)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.lightbox}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close photo" />
        {uri ? (
          <Image
            source={{uri}}
            style={styles.lightboxImage}
            resizeMode="contain"
            pointerEvents="none"
          />
        ) : null}
        <TouchableOpacity
          style={[styles.lightboxClose, {top: Math.max(insets.top, 12) + 8}]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close photo">
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export function ChatPhoto({
  file,
  saved,
  busy,
  sending,
  local,
  missing,
  restoring,
  localSource,
  onDownload,
  onPress,
  onLongPress,
  onLoad,
  onError,
  style,
}) {
  const [failed, setFailed] = useState(false);
  const [fellBack, setFellBack] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setFailed(false);
    setFellBack(false);
  }, [file, localSource]);
  const gone = Boolean(missing || /\.pdf($|\?)/i.test(String(file || '')));
  // Prefer an on-device copy. Remote URLs are only used while the server still has the file.
  const hasLocal = Boolean(!failed && (local || localSource || (saved && file && !gone)));

  if (gone && !hasLocal && !sending) {
    return (
      <View style={[styles.photo, styles.pending, styles.missing, style]}>
        <Ionicons name="image-outline" size={30} color="#FFFFFF" />
        <Text style={styles.pendingLabel}>No longer available</Text>
      </View>
    );
  }

  if (restoring && !sending) {
    return (
      <View style={[styles.photo, styles.pending, style]}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  if (!hasLocal && !sending) {
    return (
      <TouchableOpacity
        style={[styles.photo, styles.pending, style]}
        disabled={busy}
        onPress={() => {
          if (busy) return;
          if (onPress) onPress();
          else onDownload?.(file);
        }}
        onLongPress={onLongPress}
        delayLongPress={280}
        accessibilityRole="button"
        accessibilityLabel={busy ? 'Downloading photo' : 'Download photo'}>
        {busy ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="arrow-down-circle" size={34} color="#FFFFFF" />
        )}
        <Text style={styles.pendingLabel}>{busy ? 'Downloading' : 'Download'}</Text>
      </TouchableOpacity>
    );
  }

  const uri = !fellBack && localSource ? localSource : photoUri(file, local);
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={
          sending
            ? undefined
            : () => {
                if (onPress) onPress();
                else setOpen(true);
              }
        }
        onLongPress={onLongPress}
        delayLongPress={280}
        accessibilityRole="button"
        accessibilityLabel="View photo">
        <Image
          source={{uri}}
          style={[styles.photo, style]}
          onLoad={() => {
            setFailed(false);
            onLoad?.(file);
          }}
          onError={() => {
            if (localSource && !fellBack) {
              setFellBack(true);
              onError?.(file);
              return;
            }
            setFailed(true);
          }}
        />
        {sending ? (
          <View style={styles.sendDot} pointerEvents="none">
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        ) : null}
        {busy && !sending ? (
          <View style={[styles.pending, styles.busy, style]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.pendingLabel}>Downloading</Text>
          </View>
        ) : null}
      </TouchableOpacity>
      <ChatLightbox uri={open ? uri : ''} onClose={() => setOpen(false)} />
    </>
  );
}

export default function ChatLibrary({
  visible,
  title,
  records,
  isSaved,
  downloading,
  restoring,
  onDownload,
  onLoad,
  onError,
  onDelete,
  onClose,
  userId,
}) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const tile = Math.floor((width - 16) / 3);
  const [tab, setTab] = useState('media');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState({});
  const [askDelete, setAskDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const rows = records || [];
  const media = useMemo(
    () =>
      rows.filter(
        item =>
          !item.deletedForEveryone &&
          isChatImage(item.attachment) &&
          (item.attachment?.file || isAttachmentGone(item.attachment)),
      ),
    [rows],
  );
  const docs = useMemo(
    () =>
      rows.filter(
        item =>
          !item.deletedForEveryone &&
          !isChatImage(item.attachment) &&
          !isChatAudio(item.attachment) &&
          (item.attachment?.file || isAttachmentGone(item.attachment)),
      ),
    [rows],
  );
  const links = useMemo(() => {
    const list = [];
    rows.forEach(item => {
      if (item.deletedForEveryone) return;
      linksIn(item.content).forEach(url => {
        list.push({id: `${item.id}-${url}`, url, messageId: item.id, record: item});
      });
    });
    return list;
  }, [rows]);

  useEffect(() => {
    if (visible) return;
    setSelecting(false);
    setSelected({});
    setAskDelete(false);
    setDeleting(false);
  }, [visible]);

  const selectedItems = Object.values(selected);
  const everyoneOk =
    selectedItems.length > 0 && selectedItems.every(item => canDeleteForEveryone(item, userId));
  const othersSelected = selectedItems.some(item => !ownsItem(item, userId));

  const openLink = url => {
    const href = url.startsWith('www.') ? `https://${url}` : url;
    Linking.openURL(href).catch(() => {});
  };

  const leaveSelect = () => {
    setSelecting(false);
    setSelected({});
    setAskDelete(false);
  };

  const switchTab = key => {
    setTab(key);
    leaveSelect();
  };

  const toggle = item => {
    const id = String(item.id);
    setSelected(prev => {
      const next = {...prev};
      if (next[id]) delete next[id];
      else next[id] = item;
      return next;
    });
  };

  const beginSelect = item => {
    const id = String(item.id);
    setSelecting(true);
    setSelected(prev => ({...prev, [id]: item}));
  };

  const runDelete = async scope => {
    const targets =
      scope === 'everyone' ? selectedItems.filter(item => canDeleteForEveryone(item, userId)) : selectedItems;
    if (!onDelete || deleting || !targets.length) return;
    if (scope === 'everyone' && targets.length !== selectedItems.length) return;
    setDeleting(true);
    try {
      const ok = await onDelete(targets, scope);
      if (ok !== false) leaveSelect();
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    ['media', 'Media', media.length],
    ['links', 'Links', links.length],
    ['docs', 'Docs', docs.length],
  ];

  return (
    <>
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.screen, {paddingTop: insets.top}]}>
        <View style={styles.top}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={selecting ? leaveSelect : onClose}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel={selecting ? 'Cancel selection' : 'Close'}>
              <Ionicons name={selecting ? 'close' : 'chevron-back'} size={22} color={NAVY} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {selecting ? `${selectedItems.length} selected` : title || 'Chat'}
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {selecting ? 'Tap more to add them' : 'Shared in this chat'}
              </Text>
            </View>
            <View style={styles.backSlot} />
          </View>
          <View style={styles.tabs}>
            {tabs.map(([key, label, count]) => {
              const on = tab === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.tab, on && styles.tabOn]}
                  onPress={() => switchTab(key)}
                  accessibilityRole="tab"
                  accessibilityState={{selected: on}}>
                  <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{label}</Text>
                  <Text style={[styles.tabCount, on && styles.tabCountOn]}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {tab === 'media' ? (
          <FlatList
            data={media}
            keyExtractor={item => String(item.id)}
            numColumns={3}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={<Empty label="No photos in this chat yet" />}
            renderItem={({item}) => {
              const on = Boolean(selected[String(item.id)]);
              return (
                <View style={[styles.tileWrap, {width: tile, height: tile}]}>
                  <ChatPhoto
                    file={item.attachment.file}
                    saved={isSaved(item.attachment.file, item.mine, item.attachment)}
                    busy={downloading === item.attachment.file}
                    restoring={restoring}
                    missing={isAttachmentGone(item.attachment)}
                    onDownload={onDownload}
                    onLoad={onLoad}
                    onError={onError}
                    onPress={selecting ? () => toggle(item) : undefined}
                    onLongPress={() => beginSelect(item)}
                    style={styles.tile}
                  />
                  {selecting ? <Check on={on} /> : null}
                </View>
              );
            }}
          />
        ) : null}
        {tab === 'links' ? (
          <FlatList
            data={links}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Empty label="No links in this chat yet" />}
            renderItem={({item}) => (
              <TouchableOpacity style={styles.row} onPress={() => openLink(item.url)}>
                <Text style={styles.rowText} numberOfLines={2}>{item.url}</Text>
              </TouchableOpacity>
            )}
          />
        ) : null}
        {tab === 'docs' ? (
          <FlatList
            data={docs}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Empty label="No documents in this chat yet" />}
            renderItem={({item}) => {
              const on = Boolean(selected[String(item.id)]);
              const gone = isAttachmentGone(item.attachment);
              const saved = isSaved(item.attachment.file, item.mine, item.attachment);
              return (
                <TouchableOpacity
                  style={[styles.row, on && styles.rowOn]}
                  onPress={() => {
                    if (selecting) {
                      toggle(item);
                      return;
                    }
                    if (gone && !saved) return;
                    const file = item.attachment.file;
                    if (downloading === file) return;
                    if (!saved) {
                      Promise.resolve(onDownload?.(file)).catch(() => {});
                      return;
                    }
                    Linking.openURL(getImagePath(file)).catch(() => {});
                  }}
                  onLongPress={() => beginSelect(item)}>
                  {selecting ? <Check on={on} inline /> : null}
                  {downloading === item.attachment.file ? (
                    <ActivityIndicator size="small" color={NAVY} />
                  ) : null}
                  <Text style={styles.rowText} numberOfLines={2}>
                    {downloading === item.attachment.file
                      ? 'Downloading'
                      : gone && !saved
                        ? 'No longer available'
                        : saved
                          ? item.attachment.name || 'Document'
                          : 'Download document'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : null}
        {selecting && selectedItems.length ? (
          <View style={[styles.deleteBar, {paddingBottom: Math.max(insets.bottom, 12)}]}>
            <Text style={styles.deleteCount}>
              {selectedItems.length} selected
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setAskDelete(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete selected">
              <Ionicons name="trash-outline" size={16} color="#FFF" />
              <Text style={styles.deleteBtnLabel}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Modal>
    <DeleteAsk
      visible={Boolean(visible && askDelete)}
      count={selectedItems.length}
      everyoneOk={everyoneOk}
      othersSelected={othersSelected}
      deleting={deleting}
      onClose={() => {
        if (!deleting) setAskDelete(false);
      }}
      onDelete={runDelete}
    />
    </>
  );
}

function DeleteAsk({visible, count, everyoneOk, othersSelected, deleting, onClose, onDelete}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.setValue(0);
      scale.setValue(0.94);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {toValue: 1, friction: 7, tension: 90, useNativeDriver: true}),
      ]).start();
      return;
    }
    if (!mounted) return;
    Animated.parallel([
      Animated.timing(opacity, {toValue: 0, duration: 150, useNativeDriver: true}),
      Animated.timing(scale, {toValue: 0.96, duration: 150, useNativeDriver: true}),
    ]).start(({finished}) => {
      if (finished) setMounted(false);
    });
  }, [mounted, opacity, scale, visible]);

  const title = count === 1 ? 'Delete this item?' : `Delete ${count} items?`;

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.dialogRoot}>
        <Animated.View pointerEvents="none" style={[styles.dialogScrim, {opacity}]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} disabled={deleting} />
        <Animated.View style={[styles.dialog, {opacity, transform: [{scale}]}]}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {othersSelected ? (
            <Text style={styles.dialogNote}>Items you did not send can only be deleted for you.</Text>
          ) : null}
          <TouchableOpacity style={styles.dialogAction} disabled={deleting} onPress={() => onDelete('me')}>
            <Text style={styles.dialogDanger}>{deleting ? 'Deleting' : 'Delete for me'}</Text>
          </TouchableOpacity>
          {everyoneOk ? (
            <TouchableOpacity style={styles.dialogAction} disabled={deleting} onPress={() => onDelete('everyone')}>
              <Text style={styles.dialogDanger}>Delete for everyone</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.dialogAction} disabled={deleting} onPress={onClose}>
            <Text style={styles.dialogCancel}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Check({on, inline}) {
  return (
    <View style={[styles.check, inline && styles.checkInline, on && styles.checkOn]} pointerEvents="none">
      {on ? <Ionicons name="checkmark" size={13} color="#FFF" /> : null}
    </View>
  );
}

function Empty({label}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F2F5FA'},
  top: {
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F5FA',
  },
  backSlot: {width: 36, height: 36},
  headerCopy: {flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 8},
  headerTitle: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 18, color: NAVY, textAlign: 'center'},
  headerSub: {marginTop: 2, fontFamily: fonts.euclidCircularA.regular, fontSize: 12, color: MUTED, textAlign: 'center'},
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  tabOn: {borderBottomWidth: 2, borderBottomColor: BLUE},
  tabLabel: {fontFamily: fonts.euclidCircularA.medium, fontSize: 15, color: MUTED},
  tabLabelOn: {color: NAVY, fontFamily: fonts.euclidCircularA.semiBold},
  tabCount: {fontFamily: fonts.euclidCircularA.regular, fontSize: 13, color: MUTED},
  tabCountOn: {color: BLUE, fontFamily: fonts.euclidCircularA.medium},
  grid: {padding: 6},
  tileWrap: {padding: 3},
  tile: {width: '100%', height: '100%', margin: 0, borderRadius: 10},
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFF',
    backgroundColor: 'rgba(15, 31, 75, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInline: {position: 'relative', top: 0, right: 0, borderColor: '#C5CEDB', backgroundColor: '#FFF'},
  checkOn: {backgroundColor: BLUE, borderColor: BLUE},
  list: {padding: 16},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rowOn: {backgroundColor: '#E8F1FA'},
  rowText: {flex: 1, fontFamily: fonts.euclidCircularA.regular, fontSize: 15, color: NAVY},
  empty: {paddingTop: 48, alignItems: 'center'},
  emptyText: {fontFamily: fonts.euclidCircularA.regular, fontSize: 14, color: MUTED},
  deleteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E8EE',
  },
  deleteCount: {fontFamily: fonts.euclidCircularA.medium, fontSize: 14, color: NAVY},
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E11D48',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  deleteBtnLabel: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 13, color: '#FFF'},
  dialogRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  dialogScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 31, 75, 0.5)',
  },
  dialog: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 8,
    elevation: 8,
  },
  dialogTitle: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 17, color: NAVY},
  dialogNote: {
    marginTop: 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  dialogAction: {paddingVertical: 12},
  dialogDanger: {fontFamily: fonts.euclidCircularA.medium, fontSize: 15, color: '#E11D48'},
  dialogCancel: {fontFamily: fonts.euclidCircularA.medium, fontSize: 15, color: NAVY},
  photo: {width: 180, height: 140, borderRadius: 12, backgroundColor: '#D5DEEA'},
  pending: {alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B2433'},
  missing: {backgroundColor: '#3F4654'},
  busy: {...StyleSheet.absoluteFillObject, borderRadius: 12},
  docCard: {
    width: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F4F7FB',
    marginBottom: 4,
    position: 'relative',
  },
  docCardLight: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  docBadge: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  docKind: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  voice: {
    width: 220,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wave: {
    flex: 1,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  voiceTime: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  docName: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    lineHeight: 17,
    color: NAVY,
  },
  docNameLight: {
    color: '#FFFFFF',
  },
  sendDot: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 31, 75, 0.55)',
  },
  pendingLabel: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: '#FFF',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 24, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
  lightboxClose: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});

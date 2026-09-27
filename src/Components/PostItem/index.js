import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  NativeModules,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fonts from '../../Assets/fonts';
import {featureIcons} from '../../Assets';
import profile_icon from '../../Assets/images/profile_bg.png';
import routes from '../../Navigation/routes';
import {getImagePath} from '../../Service/axios';
import AppVideoPlayer from '../AppVideoPlayer';
import {
  asyncCreatePostComment,
  asyncGetCommentsByPostId,
  asyncLikePost,
} from '../../Stores/actions/post.action';
import {useAppDispatch, useAppSelector} from '../../Stores/hooks';
import {selectPostComments} from '../../Stores/slices/post.slice';
import {selectUserProfile} from '../../Stores/slices/user.slice';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');
const MEDIA_H = 210;
const VIDEO_H = 268;
const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PRIMARY = '#035392';
const LOVE = '#F33E58';
const CARD_BG = '#FFFFFF';
const TAG_BG = '#EEF5FB';
const SAVED_POSTS_KEY = 'birchwood_saved_posts';

const REACTION_ONLY = new Set(['❤️', '❤', '👍']);

function isReactionOnlyComment(content) {
  const text = String(content || '').trim();
  if (!text) {
    return true;
  }
  return REACTION_ONLY.has(text);
}

function formatCommentTime(createdAt) {
  if (!createdAt) {
    return '';
  }
  const when = moment(createdAt);
  if (!when.isValid()) {
    return '';
  }
  const mins = moment().diff(when, 'minutes');
  if (mins < 1) {
    return 'Just now';
  }
  if (mins < 60) {
    return `${mins}m`;
  }
  const hours = moment().diff(when, 'hours');
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = moment().diff(when, 'days');
  if (days < 7) {
    return `${days}d`;
  }
  return when.format('D MMM');
}

function playReactionSound(kind = 'pop') {
  try {
    NativeModules.SplashSystemUi?.playReactionSound?.(kind);
  } catch (_) {
    // ignore missing native sound module / rebuild needed
  }
}

function isVideo(path = '') {
  return /\.(mp4|mov|m4v|webm|avi)(\?|$)/i.test(String(path));
}

function authorLabel(author) {
  if (!author || typeof author === 'string') {
    return 'Teacher';
  }
  const name = `${author.firstName || ''} ${author.lastName || ''}`.trim();
  return name || 'Teacher';
}

function authorInitials(author) {
  if (!author || typeof author === 'string') {
    return 'T';
  }
  const first = (author.firstName || '').trim();
  const last = (author.lastName || '').trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return initials || 'T';
}

function authorPhoto(author) {
  if (author?.image) {
    return {uri: getImagePath(author.image)};
  }
  return null;
}

function activityBadgeSource(item) {
  const image = item?.activity?.image;
  if (image) {
    return {uri: getImagePath(image)};
  }
  return featureIcons.activity;
}

function classLabel(item) {
  const room = item?.classroom;
  if (!room || typeof room === 'string') {
    return '';
  }
  return (
    room.classroomName ||
    room.name ||
    room.title ||
    room.className ||
    room.classroomId ||
    ''
  );
}

function collectMedia(item) {
  const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
  const videos = Array.isArray(item?.videos) ? item.videos.filter(Boolean) : [];
  const single = item?.image ? [item.image] : [];
  const photoList = images.length ? images : single;
  // One cover + one video → show a single video tile (cover used as poster).
  if (videos.length === 1 && photoList.length === 1) {
    return videos;
  }
  // Surface videos first so the play tile is visible in the grid.
  return [...videos, ...photoList];
}

function videoPosterFor(item, videoPath) {
  const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
  if (!images.length) {
    return null;
  }
  // Dedicated cover when post is one video + one image.
  if (item?.videos?.length === 1 && images.length === 1) {
    return getImagePath(images[0]);
  }
  // Prefer music/cover-style filenames, else first image.
  const cover =
    images.find(path => /cover|music|thumb/i.test(String(path))) || images[0];
  return cover ? getImagePath(cover) : null;
}

function cleanCaption(text = '') {
  return String(text).replace(/^\[James William\]\s*/i, '').trim();
}

async function readSavedIds() {
  try {
    const raw = await AsyncStorage.getItem(SAVED_POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSavedIds(ids) {
  try {
    await AsyncStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function MediaTile({
  uri,
  style,
  onPress,
  showPlay,
  posterUri,
  playing,
  onVideoEnd,
}) {
  return (
    <View style={[styles.tile, style]}>
      {showPlay && playing ? (
        <AppVideoPlayer
          inline
          uri={uri}
          poster={posterUri || undefined}
          onEnd={onVideoEnd}
          onClose={onVideoEnd}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={onPress}
          style={StyleSheet.absoluteFill}>
          {showPlay ? (
            <View style={styles.videoTile}>
              {posterUri ? (
                <Image
                  source={{uri: posterUri}}
                  style={styles.tileImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.playBadge}>
                <Ionicons name="play" size={20} color="#FFFFFF" />
              </View>
            </View>
          ) : (
            <Image source={{uri}} style={styles.tileImage} resizeMode="cover" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

function MediaGallery({media, onOpen, videoPoster, playingIndex, onVideoEnd}) {
  if (!media.length) {
    return null;
  }

  const posterFor = path => (isVideo(path) ? videoPoster : null);
  const tileStyleFor = (path, baseStyle, playing) => {
    if (!isVideo(path)) {
      return baseStyle;
    }
    return [
      baseStyle,
      styles.videoSizedTile,
      playing && styles.videoPlayingTile,
    ];
  };

  if (media.length === 1) {
    return (
      <MediaTile
        uri={getImagePath(media[0])}
        posterUri={posterFor(media[0])}
        style={tileStyleFor(
          media[0],
          isVideo(media[0]) ? styles.videoFullTile : styles.fullTile,
          playingIndex === 0,
        )}
        showPlay={isVideo(media[0])}
        playing={playingIndex === 0}
        onVideoEnd={onVideoEnd}
        onPress={() => onOpen(0)}
      />
    );
  }

  if (media.length === 2) {
    return (
      <View
        style={[
          styles.row,
          media.some(isVideo) && styles.videoRow,
          playingIndex != null && styles.videoPlayingRow,
        ]}>
        {media.map((path, index) => (
          <MediaTile
            key={`${path}_${index}`}
            uri={getImagePath(path)}
            posterUri={posterFor(path)}
            style={tileStyleFor(path, styles.halfTile, playingIndex === index)}
            showPlay={isVideo(path)}
            playing={playingIndex === index}
            onVideoEnd={onVideoEnd}
            onPress={() => onOpen(index)}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.grid3,
        isVideo(media[0]) && styles.videoRow,
        playingIndex != null && styles.videoPlayingRow,
      ]}>
      <MediaTile
        uri={getImagePath(media[0])}
        posterUri={posterFor(media[0])}
        style={tileStyleFor(media[0], styles.grid3Main, playingIndex === 0)}
        showPlay={isVideo(media[0])}
        playing={playingIndex === 0}
        onVideoEnd={onVideoEnd}
        onPress={() => onOpen(0)}
      />
      <View style={styles.grid3Side}>
        <MediaTile
          uri={getImagePath(media[1])}
          posterUri={posterFor(media[1])}
          style={tileStyleFor(media[1], styles.grid3SideTile, playingIndex === 1)}
          showPlay={isVideo(media[1])}
          playing={playingIndex === 1}
          onVideoEnd={onVideoEnd}
          onPress={() => onOpen(1)}
        />
        <View style={styles.grid3SideTileWrap}>
          <MediaTile
            uri={getImagePath(media[2])}
            posterUri={posterFor(media[2])}
            style={tileStyleFor(media[2], styles.grid3SideTile, playingIndex === 2)}
            showPlay={isVideo(media[2])}
            playing={playingIndex === 2}
            onVideoEnd={onVideoEnd}
            onPress={() => onOpen(2)}
          />
          {media.length > 3 ? (
            <Pressable style={styles.moreOverlay} onPress={() => onOpen(2)}>
              <Text style={styles.moreText}>+{media.length - 3}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function Lightbox({media, index, onClose}) {
  const images = media.filter(path => !isVideo(path));
  const startIndex = Math.max(
    0,
    images.findIndex(path => path === media[index]),
  );
  const [page, setPage] = useState(startIndex < 0 ? 0 : startIndex);

  if (!images.length) {
    return null;
  }

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.lightbox}>
        <TouchableOpacity style={styles.lightboxClose} onPress={onClose}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={page}
          getItemLayout={(_, i) => ({
            length: SCREEN_W,
            offset: SCREEN_W * i,
            index: i,
          })}
          onMomentumScrollEnd={e => {
            setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
          }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, i) => `lb_${i}_${item}`}
          renderItem={({item}) => (
            <View style={styles.lightboxPage}>
              <Image
                source={{uri: getImagePath(item)}}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            </View>
          )}
        />
        <Text style={styles.lightboxCount}>
          {page + 1} / {images.length}
        </Text>
      </View>
    </Modal>
  );
}

function commentAuthorName(author) {
  if (!author || typeof author === 'string') {
    return 'Parent';
  }
  if (author.motherFirstName || author.motherLastName) {
    return (
      `${author.motherFirstName || ''} ${author.motherLastName || ''}`.trim() ||
      'Parent'
    );
  }
  return (
    `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'User'
  );
}

function CommentRow({comment}) {
  const name = commentAuthorName(comment?.author);
  const photo =
    comment?.author?.image
      ? {uri: getImagePath(comment.author.image)}
      : profile_icon;
  const timeLabel = formatCommentTime(comment?.createdAt);

  return (
    <View style={styles.commentRow}>
      <Image source={photo} style={styles.commentAvatar} />
      <View style={styles.commentMain}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.commentBody}>{comment?.content}</Text>
        </View>
        {timeLabel ? (
          <Text style={styles.commentTime}>{timeLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

function CommentSheet({visible, onClose, postId, onSent}) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const selectComments = useMemo(
    () => selectPostComments(postId || ''),
    [postId],
  );
  const comments = useAppSelector(selectComments);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !postId) {
      setText('');
      setSending(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    dispatch(asyncGetCommentsByPostId({postId}))
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [visible, postId, dispatch]);

  const send = async (value = text) => {
    const content = String(value || '').trim();
    if (!content || !postId || sending) {
      return;
    }
    // Don't post bare reaction emojis as comments
    if (isReactionOnlyComment(content)) {
      setText('');
      return;
    }
    setSending(true);
    try {
      await dispatch(
        asyncCreatePostComment({postId, comment: {content}}),
      ).unwrap();
      setText('');
      onSent?.(content);
    } catch {
      // error toast comes from the action
    } finally {
      setSending(false);
    }
  };

  const sortedComments = useMemo(() => {
    return [...(comments || [])]
      .filter(c => !isReactionOnlyComment(c?.content))
      .sort((a, b) => {
        const ta = new Date(a?.createdAt || 0).getTime();
        const tb = new Date(b?.createdAt || 0).getTime();
        return tb - ta;
      });
  }, [comments]);

  const displayCount = sortedComments.length;
  const [shown, setShown] = useState(false);
  const dim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(SCREEN_H * 0.5)).current;

  useEffect(() => {
    if (visible) {
      setShown(true);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && shown) {
      slideY.setValue(SCREEN_H * 0.5);
      dim.setValue(0);
      Animated.parallel([
        Animated.timing(dim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          tension: 68,
          friction: 11,
          overshootClamping: true,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    if (!visible && shown) {
      Animated.parallel([
        Animated.timing(dim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: SCREEN_H * 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          setShown(false);
        }
      });
    }
  }, [visible, shown, dim, slideY]);

  return (
    <Modal
      visible={shown}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetDimHit} onPress={onClose}>
          <Animated.View style={[styles.sheetDim, {opacity: dim}]} />
        </Pressable>
        <KeyboardAvoidingView
          style={styles.sheetKav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View
            style={[
              styles.sheetCard,
              {
                paddingBottom: Math.max(insets.bottom, 14),
                transform: [{translateY: slideY}],
              },
            ]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>Comments</Text>
                <Text style={styles.sheetSub}>
                  {displayCount} comment{displayCount === 1 ? '' : 's'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={10}
                style={styles.sheetCloseBtn}>
                <Ionicons name="close" size={20} color={MUTED} />
              </TouchableOpacity>
            </View>

            <View style={styles.commentsListWrap}>
              {loading && !sortedComments.length ? (
                <View style={styles.commentsEmpty}>
                  <Text style={styles.commentsEmptyText}>Loading comments…</Text>
                </View>
              ) : sortedComments.length ? (
                <FlatList
                  data={sortedComments}
                  keyExtractor={item => String(item._id)}
                  renderItem={({item}) => <CommentRow comment={item} />}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.commentsListContent}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                <View style={styles.commentsEmpty}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={28}
                    color="#C5CAD6"
                  />
                  <Text style={styles.commentsEmptyText}>
                    No comments yet. Be the first!
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Write a comment…"
                placeholderTextColor={MUTED}
                multiline
                maxLength={400}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!text.trim() || sending) && styles.sendBtnDisabled,
                ]}
                disabled={!text.trim() || sending}
                onPress={() => send()}>
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const PostItem = ({item}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectUserProfile);
  const media = useMemo(() => collectMedia(item), [item]);
  const videoPoster = useMemo(() => {
    const firstVideo = (item?.videos || []).find(Boolean);
    return firstVideo ? videoPosterFor(item, firstVideo) : null;
  }, [item]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(
    Array.isArray(item?.likes) && profile?._id
      ? item.likes.some(id => String(id) === String(profile._id))
      : false,
  );
  const [likeCount, setLikeCount] = useState(item?.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(item?.commentsCount || 0);
  const [saved, setSaved] = useState(false);
  const likeBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isLiked =
      Array.isArray(item?.likes) && profile?._id
        ? item.likes.some(id => String(id) === String(profile._id))
        : false;
    setLiked(isLiked);
    setLikeCount(item?.likes?.length || 0);
    setCommentCount(item?.commentsCount || 0);
  }, [item, profile?._id]);

  useEffect(() => {
    let alive = true;
    readSavedIds().then(ids => {
      if (alive && item?._id) {
        setSaved(ids.includes(item._id));
      }
    });
    return () => {
      alive = false;
    };
  }, [item?._id]);

  const activityTitle =
    item.activity?.title || item.title || item.type || 'Update';
  const teacher = authorLabel(item.author);
  const classroom = classLabel(item);
  const initials = authorInitials(item.author);
  const photo = authorPhoto(item.author);
  const activityBadge = activityBadgeSource(item);
  const caption = cleanCaption(
    item.content || item.description || item.activity?.description || '',
  );
  const timeLabel = item.createdAt ? moment(item.createdAt).fromNow() : '';
  const reactionTotal = likeCount;

  const openDetail = () => {
    try {
      if (!item) {
        return;
      }
      const parent = navigation.getParent?.();
      const nav = parent || navigation;
      nav.navigate(routes.screens.activityDetail, {item});
    } catch (error) {
      console.log('openDetail error', error);
    }
  };

  const bounceLike = () => {
    try {
      likeBounce.setValue(1);
      Animated.sequence([
        Animated.timing(likeBounce, {
          toValue: 1.28,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(likeBounce, {
          toValue: 1,
          friction: 3.5,
          tension: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (_) {
      // ignore animation errors
    }
  };

  const toggleSave = async () => {
    if (!item?._id) {
      return;
    }
    const ids = await readSavedIds();
    const next = !saved;
    const updated = next
      ? Array.from(new Set([...ids, item._id]))
      : ids.filter(id => id !== item._id);
    await writeSavedIds(updated);
    setSaved(next);
  };

  const toggleLike = async () => {
    if (!item?._id) {
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikeCount(count => Math.max(0, count + (next ? 1 : -1)));
    bounceLike();
    playReactionSound('select');
    try {
      const res = await dispatch(asyncLikePost({postId: item._id}));
      const payload = res?.payload;
      if (payload && payload.status === false) {
        throw new Error(payload?.message || 'Failed');
      }
    } catch (error) {
      console.log('toggleLike error', error);
      setLiked(!next);
      setLikeCount(count => Math.max(0, count + (next ? -1 : 1)));
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerMain}
          activeOpacity={0.85}
          onPress={openDetail}>
          <View style={styles.avatarWrap}>
            {photo ? (
              <Image source={photo} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.activityBadge}>
              <Image
                source={activityBadge}
                style={styles.activityBadgeImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.author} numberOfLines={1}>
              {teacher}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {[classroom, activityTitle, 'Class Teacher']
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>{timeLabel}</Text>
        </View>
      </View>

      {caption ? (
        <TouchableOpacity activeOpacity={0.9} onPress={openDetail}>
          <Text style={styles.caption} numberOfLines={4}>
            {caption}
          </Text>
        </TouchableOpacity>
      ) : null}

      {media.length ? (
        <View style={styles.mediaWrap}>
          <MediaGallery
            media={media}
            videoPoster={videoPoster}
            playingIndex={playingVideoIndex}
            onVideoEnd={() => setPlayingVideoIndex(null)}
            onOpen={index => {
              const path = media[index];
              if (isVideo(path)) {
                setPlayingVideoIndex(index);
                return;
              }
              setLightboxIndex(index);
            }}
          />
        </View>
      ) : null}

      <View style={styles.actionsWrap}>
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <TouchableOpacity
              style={styles.iconAction}
              activeOpacity={0.75}
              onPress={toggleLike}>
              <Animated.View style={{transform: [{scale: likeBounce}]}}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={liked ? LOVE : MUTED}
                />
              </Animated.View>
              <Text style={[styles.footerCount, liked && {color: LOVE}]}>
                {reactionTotal}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconAction}
              activeOpacity={0.75}
              onPress={() => setCommentOpen(true)}>
              <Ionicons name="chatbubble-outline" size={21} color={MUTED} />
              <Text style={styles.footerCount}>{commentCount}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.75}
            onPress={toggleSave}
            hitSlop={8}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? PRIMARY : MUTED}
            />
          </TouchableOpacity>
        </View>
      </View>

      {lightboxIndex !== null ? (
        <Lightbox
          media={media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}

      <CommentSheet
        visible={commentOpen}
        onClose={() => setCommentOpen(false)}
        postId={item?._id}
        onSent={() => setCommentCount(count => count + 1)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    marginBottom: 14,
    paddingTop: 14,
    paddingBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0F1F4B',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 4},
      },
      android: {elevation: 2},
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    marginRight: 4,
    overflow: 'visible',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: TAG_BG,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: TAG_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: PRIMARY,
  },
  activityBadge: {
    position: 'absolute',
    right: -2,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: TAG_BG,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F1F4B',
        shadowOpacity: 0.18,
        shadowRadius: 2,
        shadowOffset: {width: 0, height: 1},
      },
      android: {elevation: 2},
    }),
  },
  activityBadgeImage: {
    width: '100%',
    height: '100%',
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },
  author: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 11,
    color: MUTED,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  caption: {
    paddingHorizontal: 14,
    marginBottom: 12,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#1F2A44',
  },
  mediaWrap: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    height: MEDIA_H,
    gap: 6,
  },
  videoRow: {
    height: VIDEO_H,
  },
  videoPlayingRow: {
    height: VIDEO_H + 28,
  },
  fullTile: {
    width: '100%',
    height: MEDIA_H,
    borderRadius: 6,
    overflow: 'hidden',
  },
  videoFullTile: {
    width: '100%',
    height: VIDEO_H,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#0B1220',
  },
  videoSizedTile: {
    backgroundColor: '#0B1220',
  },
  videoPlayingTile: {
    height: VIDEO_H + 28,
  },
  halfTile: {
    flex: 1,
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  grid3: {
    flexDirection: 'row',
    height: MEDIA_H,
    gap: 6,
  },
  grid3Main: {
    flex: 1.15,
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  grid3Side: {
    flex: 1,
    gap: 6,
  },
  grid3SideTile: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  grid3SideTileWrap: {
    flex: 1,
    position: 'relative',
  },
  tile: {
    backgroundColor: '#F0F3F8',
    overflow: 'hidden',
    position: 'relative',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  videoTile: {
    backgroundColor: '#1A2744',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  playBadge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,31,75,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,31,75,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  moreText: {
    color: '#FFFFFF',
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
  },
  actionsWrap: {
    position: 'relative',
    zIndex: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 2,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerCount: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: MUTED,
    minWidth: 10,
  },
  footerEmoji: {
    fontSize: 18,
  },
  saveBtn: {
    padding: 4,
  },
  pickerLayer: {
    ...StyleSheet.absoluteFillObject,
    top: -72,
    bottom: 44,
    zIndex: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  pickerDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  reactionTray: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    minWidth: Math.min(SCREEN_W - 28, 340),
    ...Platform.select({
      ios: {
        shadowColor: '#0F1F4B',
        shadowOpacity: 0.16,
        shadowRadius: 16,
        shadowOffset: {width: 0, height: 8},
      },
      android: {elevation: 8},
    }),
  },
  reactionLabelWrap: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  reactionLabel: {
    backgroundColor: 'rgba(15,31,75,0.82)',
    color: '#FFFFFF',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  reactionEmojiHit: {
    width: 42,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 28,
  },
  lightbox: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 28,
    right: 18,
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxPage: {
    width: SCREEN_W,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: SCREEN_W,
    height: '75%',
  },
  lightboxCount: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
  },
  sheetRoot: {
    flex: 1,
  },
  sheetDimHit: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
  },
  sheetKav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: SCREEN_H * 0.78,
    width: '100%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8DEE8',
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F5F8',
  },
  sheetTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  sheetSub: {
    marginTop: 1,
    marginBottom: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  commentsListWrap: {
    minHeight: 120,
    maxHeight: 280,
    marginBottom: 6,
  },
  commentsListContent: {
    paddingBottom: 4,
  },
  commentsEmpty: {
    flex: 1,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  commentsEmptyText: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F3F8',
  },
  commentMain: {
    flex: 1,
    marginLeft: 8,
  },
  commentBubble: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: '#F4F5F8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 12,
    color: NAVY,
  },
  commentBody: {
    marginTop: 1,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 17,
    color: '#2A3348',
  },
  commentTime: {
    marginTop: 3,
    marginLeft: 10,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 10,
    color: MUTED,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E8F0',
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 11,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: NAVY,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});

export default PostItem;

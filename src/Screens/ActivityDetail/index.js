import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../../theme/colors';
import {vh, vw} from '../../theme/units';
import {BackArrow} from '../../Components/BackArrow';
import GlroyBold from '../../Components/GlroyBoldText';
import AppVideoPlayer from '../../Components/AppVideoPlayer';
import VideoFrame, {warmStill} from '../../Components/VideoFrame';
import {cacheVideo} from '../../Utils/videoCache';
import moment from 'moment';
import VectorIcon from '../../Components/VectorIcons';

import {getImagePath} from '../../Service/axios';

const ActivityDetail = ({route}) => {
  const insets = useSafeAreaInsets();
  const item = route?.params?.item;
  const headerPadTop = Math.max(insets.top, 8) + 8;
  const [playingVideo, setPlayingVideo] = useState(null);

  const imageList = useMemo(() => {
    if (!item) {
      return [];
    }
    if (item.images?.length) {
      return item.images;
    }
    return item.image ? [item.image] : [];
  }, [item]);

  const videoList = useMemo(() => {
    if (!item?.videos?.length) {
      return [];
    }
    return item.videos.filter(Boolean);
  }, [item]);

  const poster =
    imageList[0] != null ? getImagePath(imageList[0]) : undefined;

  useEffect(() => {
    videoList.forEach(vid => {
      const uri = getImagePath(vid);
      cacheVideo(uri);
      warmStill(uri);
    });
  }, [videoList]);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, {paddingTop: headerPadTop}]}>
          <BackArrow />
          <GlroyBold text="Post Details" _style={styles.headerTitle} />
        </View>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Post not found</Text>
        </View>
      </View>
    );
  }

  const activityTitle =
    item.activity?.title || item.title || item.type || 'Activity';

  const getActivityIcon = title => {
    const t = title?.toLowerCase() || '';
    if (t.includes('read')) {
      return {name: 'book', color: '#4CAF50'};
    }
    if (t.includes('play')) {
      return {name: 'game-controller', color: '#2196F3'};
    }
    if (t.includes('eat') || t.includes('food')) {
      return {name: 'restaurant', color: '#FF9800'};
    }
    if (t.includes('sleep')) {
      return {name: 'bed', color: '#9C27B0'};
    }
    return {name: 'star', color: colors.theme.primary};
  };

  const iconData = getActivityIcon(activityTitle);

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: headerPadTop}]}>
        <BackArrow />
        <GlroyBold text="Post Details" _style={styles.headerTitle} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {videoList.map((vid, index) => {
            const uri = getImagePath(vid);
            const isPlaying = playingVideo === uri;
            return (
              <View key={`v_${index}`} style={styles.videoCard}>
                {isPlaying ? (
                  <View style={[styles.fullImage, styles.playingFrame]}>
                    <AppVideoPlayer
                      inline
                      uri={uri}
                      poster={poster}
                      onEnd={() => setPlayingVideo(null)}
                      onClose={() => setPlayingVideo(null)}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setPlayingVideo(uri)}>
                    {poster ? (
                      <Image
                        source={{uri: poster}}
                        style={styles.fullImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.fullImage}>
                        <VideoFrame uri={uri} />
                      </View>
                    )}
                    <View style={styles.playOverlay}>
                      <View style={styles.playCircle}>
                        <Ionicons name="play" size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.playLabel}>Play video</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {imageList.length > 0
            ? imageList.map((img, index) => (
                <Image
                  key={index}
                  source={{uri: getImagePath(img)}}
                  style={styles.fullImage}
                  resizeMode="cover"
                />
              ))
            : !videoList.length ? (
                <View style={styles.placeholderContainer}>
                  <VectorIcon
                    type="Ionicons"
                    name="image-outline"
                    size={50}
                    color={colors.text.grey}
                  />
                  <Text style={styles.placeholderText}>No Photos</Text>
                </View>
              ) : null}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.typeRow}>
            <View
              style={[
                styles.iconWrapper,
                {backgroundColor: iconData.color + '15'},
              ]}>
              <VectorIcon
                type="Ionicons"
                name={iconData.name}
                size={20}
                color={iconData.color}
              />
            </View>
            <Text style={[styles.typeText, {color: iconData.color}]}>
              {activityTitle.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.timeText}>
            {moment(item.createdAt).calendar(null, {
              sameDay: '[Today] h:mm A',
              nextDay: '[Tomorrow] h:mm A',
              lastDay: '[Yesterday] h:mm A',
              lastWeek: 'MMM D, h:mm A',
              sameElse: 'MMM D, YYYY h:mm A',
            })}
          </Text>

          <View style={styles.divider} />

          <GlroyBold text="Teacher's Notes" _style={styles.sectionLabel} />
          <Text style={styles.noteText}>
            {item.content ||
              item.description ||
              item.activity?.description ||
              'No notes provided.'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <VectorIcon type="Ionicons" name="heart" size={18} color="#FF5252" />
              <Text style={styles.statText}>
                {item.likes?.length || 0} Likes
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.theme.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 15,
    color: colors.text.black,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageContainer: {
    width: '100%',
  },
  videoCard: {
    position: 'relative',
  },
  playingFrame: {
    overflow: 'visible',
  },
  fullImage: {
    width: vw * 100,
    height: vh * 46,
    marginBottom: 5,
    backgroundColor: '#111827',
    overflow: 'hidden',
    position: 'relative',
  },
  videoFallback: {
    backgroundColor: '#1A2744',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    marginBottom: 5,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(15,31,75,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  playLabel: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderContainer: {
    width: '100%',
    height: vh * 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text.grey,
    marginTop: 10,
  },
  infoSection: {
    padding: 20,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 13,
    color: colors.text.grey,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    color: colors.text.black,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 25,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text.grey,
    fontWeight: '600',
  },
});

export default ActivityDetail;

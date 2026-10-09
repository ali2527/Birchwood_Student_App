import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import fonts from '../../Assets/fonts';
import {cacheVideo, cachedVideoUri, forgetCachedVideo} from '../../Utils/videoCache';
import {rememberedStill} from '../VideoFrame';

const NAVY = '#0F1F4B';

const BUFFER = {
  minBufferMs: 1000,
  maxBufferMs: 5000,
  bufferForPlaybackMs: 250,
  bufferForPlaybackAfterRebufferMs: 500,
  backBufferDurationMs: 1500,
  cacheSizeMB: 256,
};

function isLocalUri(uri) {
  return (
    !!uri &&
    (uri.startsWith('file://') ||
      uri.startsWith('content://') ||
      uri.startsWith('ph://') ||
      uri.startsWith('assets-library://'))
  );
}

/**
 * Plays immediately from a local file or by streaming the remote URL.
 * A full download may warm the disk cache for the next open, but never blocks
 * the first frame.
 */
export default function AppVideoPlayer({
  visible = true,
  uri,
  poster,
  onClose,
  onEnd,
  inline = false,
  style,
  resizeMode = 'contain',
}) {
  const insets = useSafeAreaInsets();
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState(null);
  const [playUri, setPlayUri] = useState(() => cachedVideoUri(uri) || uri || '');
  const started = useRef(false);
  const cover = poster || rememberedStill(uri);

  useEffect(() => {
    started.current = false;
    setError(null);
    const local = cachedVideoUri(uri);
    const next = local || uri || '';
    setPlayUri(next);
    setWaiting(Boolean(next) && !isLocalUri(next) && !local);

    if (uri && !isLocalUri(uri) && !local) {
      cacheVideo(uri).catch(() => {});
    }
  }, [uri]);

  if (!uri || (!inline && !visible)) {
    return null;
  }

  const markReady = () => {
    started.current = true;
    setWaiting(false);
    setError(null);
  };

  const video = (
    <>
      {playUri ? (
        <Video
          key={playUri}
          source={{uri: playUri, bufferConfig: BUFFER}}
          style={styles.videoFill}
          controls
          resizeMode={inline ? 'contain' : resizeMode}
          paused={false}
          rate={1}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          automaticallyWaitsToMinimizeStalling={false}
          preferredForwardBufferDuration={2}
          bufferConfig={BUFFER}
          useTextureView={Platform.OS === 'android'}
          shutterColor="#000000"
          progressUpdateInterval={500}
          onLoadStart={() => {
            if (!started.current) setWaiting(true);
          }}
          onLoad={markReady}
          onReadyForDisplay={markReady}
          onError={() => {
            if (playUri !== uri && uri) {
              forgetCachedVideo(uri);
              setPlayUri(uri);
              setError(null);
              setWaiting(true);
              started.current = false;
              return;
            }
            setWaiting(false);
            setError('Could not play this video. Check your connection and try again.');
          }}
          onEnd={() => {
            onEnd?.();
            if (!inline) onClose?.();
          }}
        />
      ) : null}
      {waiting && !error && cover ? (
        <Image
          source={{uri: cover}}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          pointerEvents="none"
        />
      ) : null}
      {waiting && !error ? (
        <View style={styles.loaderLayer} pointerEvents="none">
          <View style={styles.loaderBubble}>
            <ActivityIndicator size={inline ? 'small' : 'large'} color="#FFFFFF" />
          </View>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorLayer}>
          <Text style={[styles.errorText, inline && styles.errorTextInline]}>{error}</Text>
          {onClose ? (
            <Pressable style={styles.retryBtn} onPress={onClose}>
              <Text style={styles.retryLabel}>Close</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </>
  );

  if (inline) {
    return <View style={[styles.inlineRoot, style]}>{video}</View>;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.root}>
        {video}
        <Pressable
          style={[styles.closeBtn, {top: Math.max(insets.top, 12) + 4}]}
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close video">
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  inlineRoot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'visible',
  },
  loaderLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 31, 75, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 14,
  },
  errorTextInline: {
    fontSize: 12,
    marginBottom: 8,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: NAVY,
  },
  retryLabel: {
    color: '#FFFFFF',
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,31,75,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 2},
      },
      android: {elevation: 4},
    }),
  },
});

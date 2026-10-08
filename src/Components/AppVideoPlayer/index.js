import React, {useState} from 'react';
import {
  ActivityIndicator,
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

const NAVY = '#0F1F4B';

const STREAM_BUFFER = {
  minBufferMs: 2000,
  maxBufferMs: 8000,
  bufferForPlaybackMs: 1000,
  bufferForPlaybackAfterRebufferMs: 1500,
  backBufferDurationMs: 2000,
};

/**
 * Progressive HTTP-range video player.
 * - inline: plays inside the post card
 * - modal: fullscreen (optional)
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
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState(null);

  if (!uri || (!inline && !visible)) {
    return null;
  }

  const video = (
    <>
      <Video
        source={{uri, type: 'mp4'}}
        style={inline ? styles.inlineVideo : styles.video}
        controls
        resizeMode={inline ? 'cover' : resizeMode}
        poster={poster || undefined}
        posterResizeMode={inline ? 'cover' : 'contain'}
        paused={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        useTextureView
        shutterColor="#0B1220"
        progressUpdateInterval={500}
        bufferConfig={STREAM_BUFFER}
        preferredForwardBufferDuration={4}
        maxBitRate={2_500_000}
        onLoadStart={() => {
          setBuffering(true);
          setError(null);
        }}
        onReadyForDisplay={() => setBuffering(false)}
        onBuffer={({isBuffering}) => setBuffering(!!isBuffering)}
        onError={e => {
          setBuffering(false);
          setError('Could not play this video. Check your connection and try again.');
        }}
        onEnd={() => {
          onEnd?.();
          if (!inline) {
            onClose?.();
          }
        }}
      />

      {buffering && !error ? (
        <View style={styles.centerOverlay} pointerEvents="none">
          <ActivityIndicator size={inline ? 'small' : 'large'} color="#FFFFFF" />
          {!inline ? <Text style={styles.hint}>Streaming…</Text> : null}
        </View>
      ) : null}

      {error ? (
        <View style={styles.centerOverlay}>
          <Text style={[styles.errorText, inline && styles.errorTextInline]}>
            {error}
          </Text>
          {onClose ? (
            <Pressable style={styles.retryBtn} onPress={onClose}>
              <Text style={styles.retryLabel}>{inline ? 'Retry' : 'Close'}</Text>
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
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  inlineRoot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0B1220',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inlineVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0B1220',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 24,
  },
  hint: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
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

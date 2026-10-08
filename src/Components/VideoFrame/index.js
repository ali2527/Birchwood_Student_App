import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

const thumbs = new Map();

function grabFrame(uri) {
  try {
    const create = require('react-native-compressor').createVideoThumbnail;
    if (typeof create !== 'function') {
      return Promise.resolve('');
    }
    return create(uri, {quality: 0.85}).then(result => {
      const path = result?.path || '';
      if (!path) {
        return '';
      }
      return path.startsWith('file://') || path.startsWith('content://') ? path : `file://${path}`;
    });
  } catch {
    return Promise.resolve('');
  }
}

/** First-frame still. A paused video view stays black and steals the play tap. */
export default function VideoFrame({uri, style}) {
  const [thumb, setThumb] = useState(() => (uri ? thumbs.get(uri) || '' : ''));

  useEffect(() => {
    if (!uri) {
      return undefined;
    }
    const cached = thumbs.get(uri);
    if (cached) {
      setThumb(cached);
      return undefined;
    }
    let alive = true;
    grabFrame(uri)
      .then(path => {
        if (!alive || !path) {
          return;
        }
        thumbs.set(uri, path);
        setThumb(path);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [uri]);

  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      {thumb ? <Image source={{uri: thumb}} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A2744',
  },
});

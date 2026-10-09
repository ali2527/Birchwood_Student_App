import React, {useEffect, useState} from 'react';
import {Image, Platform, StyleSheet, View} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {cacheVideo, cachedVideoUri, mediaKey} from '../../Utils/videoCache';

const thumbs = new Map();
const pending = new Map();
const STILL_DIR = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/bw-stills`;

function asFileUri(path) {
  if (!path) return '';
  if (path.startsWith('file://') || path.startsWith('content://')) return path;
  return `file://${path}`;
}

function barePath(path) {
  if (!path) return '';
  const raw = path.startsWith('file://') ? path.slice('file://'.length) : path;
  try {
    return decodeURI(raw);
  } catch {
    return raw;
  }
}

function isLocalUri(uri) {
  return (
    !!uri &&
    (uri.startsWith('file://') ||
      uri.startsWith('content://') ||
      uri.startsWith('ph://') ||
      uri.startsWith('assets-library://'))
  );
}

function localSource(uri) {
  const cached = cachedVideoUri(uri);
  if (isLocalUri(cached)) return cached;
  if (isLocalUri(uri)) return uri;
  if (uri && uri.startsWith('/')) return `file://${uri}`;
  if (uri && uri.startsWith('file:/') && !uri.startsWith('file://')) {
    return `file://${uri.slice('file:'.length)}`;
  }
  return '';
}

function stillFrom(uri) {
  try {
    const create = require('react-native-compressor').createVideoThumbnail;
    if (typeof create !== 'function') return Promise.resolve('');
    return create(uri, {quality: 0.8})
      .then(result => asFileUri(result?.path || ''))
      .catch(() => '');
  } catch {
    return Promise.resolve('');
  }
}

function stillPath(uri) {
  return `${STILL_DIR}/${mediaKey(uri)}.jpg`;
}

async function savedStill(uri) {
  const path = stillPath(uri);
  try {
    if (!(await ReactNativeBlobUtil.fs.exists(path))) return '';
  } catch {
    return '';
  }
  const local = `file://${path}`;
  thumbs.set(uri, local);
  return local;
}

async function storeStill(uri, source) {
  if (!source) return '';
  const dest = stillPath(uri);
  try {
    if (!(await ReactNativeBlobUtil.fs.exists(STILL_DIR))) {
      await ReactNativeBlobUtil.fs.mkdir(STILL_DIR);
    }
    const raw = barePath(source);
    if (raw && raw !== dest) {
      await ReactNativeBlobUtil.fs.unlink(dest).catch(() => {});
      await ReactNativeBlobUtil.fs.cp(raw, dest);
    }
  } catch {
    const fallback = asFileUri(source);
    if (fallback) thumbs.set(uri, fallback);
    return fallback;
  }
  const local = `file://${dest}`;
  thumbs.set(uri, local);
  return local;
}

export function rememberedStill(uri) {
  return uri ? thumbs.get(uri) || '' : '';
}

export function rememberStill(uri, path) {
  if (uri && path) thumbs.set(uri, path);
}

/** Start (or reuse) a first-frame JPEG. Safe to call the moment a video is picked. */
export function warmStill(uri) {
  if (!uri) return Promise.resolve('');
  const cached = rememberedStill(uri);
  if (cached) return Promise.resolve(cached);
  if (pending.has(uri)) return pending.get(uri);

  const job = (async () => {
    const onDisk = await savedStill(uri);
    if (onDisk) return onDisk;

    const local = localSource(uri);
    if (local) {
      const path = await stillFrom(local);
      return path ? storeStill(uri, path) : '';
    }

    // Android can read a remote frame. iOS AVAssetImageGenerator only works
    // once the file is on disk, because the movie header is often at the end.
    if (Platform.OS === 'android') {
      const remote = await stillFrom(uri);
      if (remote) return storeStill(uri, remote);
    }

    const downloaded = cachedVideoUri(uri) || (await cacheVideo(uri));
    if (!downloaded || !isLocalUri(downloaded)) return '';
    const path = await stillFrom(downloaded);
    return path ? storeStill(uri, path) : '';
  })()
    .catch(() => '')
    .finally(() => {
      pending.delete(uri);
    });

  pending.set(uri, job);
  return job;
}

/** First-frame still. Remote videos are cached, then a JPEG is taken from that file. */
export default function VideoFrame({uri, poster, style}) {
  const [thumb, setThumb] = useState(() => poster || rememberedStill(uri));

  useEffect(() => {
    if (poster) {
      rememberStill(uri, poster);
      setThumb(poster);
      return undefined;
    }
    if (!uri) return undefined;
    const cached = rememberedStill(uri);
    if (cached) {
      setThumb(cached);
      return undefined;
    }
    let alive = true;
    warmStill(uri).then(path => {
      if (alive && path) setThumb(path);
    });
    return () => {
      alive = false;
    };
  }, [poster, uri]);

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

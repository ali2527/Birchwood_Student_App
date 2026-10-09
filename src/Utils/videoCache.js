import ReactNativeBlobUtil from 'react-native-blob-util';

const localByUrl = new Map();
const jobs = new Map();
const MAX_ACTIVE = 2;
let active = 0;
const slotQueue = [];

function takeSlot() {
  if (active < MAX_ACTIVE) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise(resolve => {
    slotQueue.push(resolve);
  });
}

function freeSlot() {
  active = Math.max(0, active - 1);
  const next = slotQueue.shift();
  if (next) {
    active += 1;
    next();
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

export function mediaKey(uri) {
  let hash = 0;
  const value = String(uri);
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

function cacheName(uri) {
  const ext = (String(uri).split('?')[0].match(/\.(mp4|mov|m4v|webm)$/i) || [, 'mp4'])[1].toLowerCase();
  return `bw-video-${mediaKey(uri)}.${ext}`;
}

function fileUri(path) {
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

async function fileReady(path) {
  try {
    if (!(await ReactNativeBlobUtil.fs.exists(path))) return false;
    const stat = await ReactNativeBlobUtil.fs.stat(path);
    return Number(stat?.size) > 1024;
  } catch {
    return false;
  }
}

export function cachedVideoUri(uri) {
  if (!uri) return '';
  if (isLocalUri(uri)) return uri;
  return localByUrl.get(uri) || '';
}

/** Drop a saved copy that failed to play so the next attempt downloads it again. */
export function forgetCachedVideo(uri) {
  const local = uri ? localByUrl.get(uri) : '';
  if (uri) localByUrl.delete(uri);
  if (local && local.startsWith('file://')) {
    ReactNativeBlobUtil.fs.unlink(barePath(local)).catch(() => {});
  }
}

/** Save the video on the phone so the next play does not download it again. */
export function cacheVideo(uri) {
  if (!uri) return Promise.resolve('');
  if (isLocalUri(uri)) return Promise.resolve(uri);
  if (localByUrl.has(uri)) return Promise.resolve(localByUrl.get(uri));
  if (jobs.has(uri)) return jobs.get(uri);

  const job = (async () => {
    const finalPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${cacheName(uri)}`;
    if (await fileReady(finalPath)) {
      const local = fileUri(finalPath);
      localByUrl.set(uri, local);
      return local;
    }

    await takeSlot();
    try {
      if (localByUrl.has(uri)) return localByUrl.get(uri);
      if (await fileReady(finalPath)) {
        const local = fileUri(finalPath);
        localByUrl.set(uri, local);
        return local;
      }

      const part = `${finalPath}.part`;
      await ReactNativeBlobUtil.fs.unlink(part).catch(() => {});
      const result = await ReactNativeBlobUtil.config({
        path: part,
        overwrite: true,
      }).fetch('GET', uri);
      const status = Number(result.info?.().status || 0);
      const saved = barePath(result.path());
      const ready = await fileReady(saved);
      if (status >= 400 || !ready) {
        await ReactNativeBlobUtil.fs.unlink(saved || part).catch(() => {});
        return '';
      }
      await ReactNativeBlobUtil.fs.unlink(finalPath).catch(() => {});
      await ReactNativeBlobUtil.fs.mv(saved, finalPath);
      const local = fileUri(finalPath);
      localByUrl.set(uri, local);
      return local;
    } finally {
      freeSlot();
    }
  })().catch(() => '');

  jobs.set(uri, job);
  return job.finally(() => {
    jobs.delete(uri);
  });
}

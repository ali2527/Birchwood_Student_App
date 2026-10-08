import {Platform} from 'react-native';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {BASE_URL} from '../Service/axios';
import {store} from '../Stores';

const DOCUMENT_MAX = 2 * 1024 * 1024;
const AUDIO_MAX = 2 * 1024 * 1024;
/**
 * Live school API still enforces ~800 KB for chat images until backend IMAGE_MAX is deployed.
 * Compress under this so uploads succeed and size errors are honest.
 */
const IMAGE_UPLOAD_MAX = 750 * 1024;

function isImage(mime, name) {
  const label = `${mime || ''} ${name || ''}`.toLowerCase();
  return label.includes('image/') || /\.(jpe?g|png|webp|gif|heic|heif)\b/.test(label);
}

function sizeRejectMessage(message) {
  return /800\s*k|file too large|file size|too big|payload too large|keep this file under/i.test(
    String(message || ''),
  );
}

function humanSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function assertClientSize({asImage, mime, name, size}) {
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes < 1) {
    return;
  }
  if (asImage || isImage(mime, name)) {
    // Photos are compressed below — only hard-fail absurd sizes.
    if (bytes > 40 * 1024 * 1024) {
      throw new Error('That photo is too large to send.');
    }
    return;
  }
  if (String(mime || '').startsWith('audio/') || /\.(m4a|aac|mp3|wav)$/i.test(name || '')) {
    if (bytes > AUDIO_MAX) {
      throw new Error('Keep the voice message under 2 MB.');
    }
    return;
  }
  if (bytes > DOCUMENT_MAX) {
    throw new Error('Keep the document under 2 MB.');
  }
}

function dataUri(base64, mime = 'image/jpeg') {
  const clean = String(base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!clean) return '';
  return `data:${mime || 'image/jpeg'};base64,${clean}`;
}

function bytesFromBase64(input) {
  const clean = String(input || '').replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  if (!clean || typeof global.atob !== 'function') return null;
  try {
    const binary = global.atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i) & 0xff;
    }
    return bytes.byteLength ? bytes : null;
  } catch {
    return null;
  }
}

/** Make camera / picker / document paths readable by fetch & XHR. */
export function normalizeFileUri(uri) {
  if (!uri || typeof uri !== 'string') return '';
  let trimmed = uri.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('file:/') && !trimmed.startsWith('file://')) {
    trimmed = `file://${trimmed.slice('file:'.length)}`;
  }
  if (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('assets-library://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `file://${trimmed}`;
  }
  return trimmed;
}

function readCandidates(uri) {
  const source = normalizeFileUri(uri);
  if (!source) return [];
  const list = [source];
  if (source.startsWith('file://')) {
    try {
      const decoded = decodeURI(source);
      if (decoded !== source) list.push(decoded);
    } catch {
      // keep original
    }
  }
  return [...new Set(list.filter(Boolean))];
}

function xhrBlob(uri) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status !== 0 && (request.status < 200 || request.status >= 300)) {
        reject(new Error('read failed'));
        return;
      }
      let blob;
      try {
        blob = request.response;
      } catch (error) {
        reject(error instanceof Error ? error : new Error('read failed'));
        return;
      }
      if (blob?.size) resolve(blob);
      else reject(new Error('read failed'));
    };
    request.onerror = () => reject(new Error('read failed'));
    request.ontimeout = () => reject(new Error('read failed'));
    request.responseType = 'blob';
    request.open('GET', uri, true);
    request.send();
  });
}

function bytesFromBlob(blob) {
  if (blob?.data) {
    blob.data.offset = Number(blob.data.offset) || 0;
    blob.data.size = Number(blob.data.size) || blob.size || 0;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.onload = () => {
      const result = reader.result;
      if (result instanceof ArrayBuffer && result.byteLength) {
        resolve(new Uint8Array(result));
        return;
      }
      reject(new Error('read failed'));
    };
    try {
      reader.readAsArrayBuffer(blob);
    } catch (error) {
      reject(error instanceof Error ? error : new Error('read failed'));
    }
  });
}

function androidFilePath(uri) {
  const source = normalizeFileUri(uri);
  if (source.startsWith('file://')) {
    const path = source.slice('file://'.length);
    try {
      return decodeURI(path);
    } catch {
      return path;
    }
  }
  return source;
}

async function bytesFromUri(uri) {
  if (Platform.OS === 'android') {
    // OkHttp rejects file:// and content://. Read the local file natively instead.
    const base64 = await ReactNativeBlobUtil.fs.readFile(androidFilePath(uri), 'base64');
    const bytes = bytesFromBase64(base64);
    if (!bytes?.byteLength) throw new Error('read failed');
    return bytes;
  }
  const blob = await xhrBlob(uri);
  return bytesFromBlob(blob);
}

async function materializeImage(uri, width = 1600, quality = 85) {
  const out = await ImageResizer.createResizedImage(
    uri,
    width,
    width,
    'JPEG',
    quality,
    0,
    undefined,
    true,
    {mode: 'contain', onlyScaleDown: true},
  );
  return normalizeFileUri(out?.uri || out?.path);
}

async function compressImage(uri, maxBytes = IMAGE_UPLOAD_MAX) {
  let quality = 80;
  let width = 1600;
  let current = normalizeFileUri(uri);
  let best = null;
  for (let i = 0; i < 8; i += 1) {
    try {
      const local = await materializeImage(current, width, quality);
      if (!local) break;
      current = local;
      const bytes = await bytesFromUri(local);
      if (!bytes?.byteLength) continue;
      best = bytes;
      if (bytes.byteLength <= maxBytes) {
        return {bytes, uri: local};
      }
    } catch {
      // try a smaller pass
    }
    quality = Math.max(32, quality - 10);
    width = Math.max(640, Math.round(width * 0.8));
  }
  return best ? {bytes: best, uri: current} : null;
}

async function readBytes(uri, {asImage, label, base64, mime} = {}) {
  const fail = label || 'file';
  const candidates = readCandidates(uri);
  if (!candidates.length && !base64) {
    throw new Error(
      asImage
        ? "Couldn't open that photo. Try taking or picking it again."
        : `Couldn't open that ${fail}. Try another file.`,
    );
  }

  if (asImage) {
    const sources = [];
    const encoded = dataUri(base64, mime || 'image/jpeg');
    if (encoded) sources.push(encoded);
    if (candidates[0]) sources.push(candidates[0]);
    for (const source of sources) {
      try {
        const compressed = await compressImage(source, IMAGE_UPLOAD_MAX);
        if (compressed?.bytes?.byteLength) return compressed;
      } catch {
        // try the next source
      }
    }
  }

  const direct = bytesFromBase64(base64);
  if (direct?.byteLength) return {bytes: direct, uri: uri || ''};

  for (const source of candidates) {
    try {
      const bytes = await bytesFromUri(source);
      if (bytes?.byteLength) return {bytes, uri: source};
    } catch {
      // next
    }
  }

  throw new Error(
    asImage
      ? "Couldn't open that photo. Try taking or picking it again."
      : `Couldn't open that ${fail}. Try another file.`,
  );
}

async function authed(path, init) {
  const token = store.getState().user?.token;
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token || ''}`,
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new Error("Can't reach the school server. Check your connection and try again.");
  }
  let body = null;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? 'The school server sent an unexpected reply.'
        : `Upload failed (${response.status}). Try again.`,
    );
  }
  return body;
}

async function pushChunks(uploadId, bytes, chunkSize, onProgress) {
  const total = bytes.byteLength;
  let offset = 0;
  let index = 0;
  while (offset < total) {
    const end = Math.min(offset + chunkSize, total);
    const piece = new Uint8Array(bytes.subarray(offset, end));
    const saved = await authed('message/attachmentChunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-upload-id': uploadId,
        'x-chunk-index': String(index),
      },
      body: piece,
    });
    if (!saved?.status) {
      if (sizeRejectMessage(saved?.message)) {
        throw new Error(saved?.message || 'Keep this file under 800 KB.');
      }
      throw new Error(saved?.message || 'A piece of the file failed to upload.');
    }
    offset = end;
    index += 1;
    if (onProgress) onProgress(offset / total);
  }
}

/** Sends a photo or document in pieces. */
export async function uploadChatFile(chatId, file, onProgress) {
  const asImage = isImage(file.type, file.name);
  assertClientSize({
    asImage,
    mime: file.type,
    name: file.name,
    size: file.size,
  });

  const loaded = await readBytes(file.uri, {
    asImage,
    label: asImage ? 'photo' : 'document',
    base64: file.base64,
    mime: file.type,
  });
  let bytes = loaded.bytes;
  let readableUri = loaded.uri || file.uri;
  let mime = file.type || (asImage ? 'image/jpeg' : 'application/octet-stream');

  if (asImage && bytes.byteLength > IMAGE_UPLOAD_MAX) {
    const smaller = await compressImage(readableUri || file.uri, IMAGE_UPLOAD_MAX);
    if (smaller?.bytes) {
      bytes = smaller.bytes;
      readableUri = smaller.uri || readableUri;
      mime = 'image/jpeg';
    }
  }

  if (asImage && bytes.byteLength > IMAGE_UPLOAD_MAX) {
    throw new Error('Keep photos under 800 KB.');
  }

  if (!isImage(mime, file.name)) {
    if (String(mime).startsWith('audio/') && bytes.byteLength > AUDIO_MAX) {
      throw new Error('Keep the voice message under 2 MB.');
    }
    if (!String(mime).startsWith('audio/') && bytes.byteLength > DOCUMENT_MAX) {
      throw new Error('Keep the document under 2 MB.');
    }
  }

  const startBody = {
    chatId,
    fileName: file.name || (asImage ? 'photo.jpg' : 'file'),
    mime,
    size: bytes.byteLength,
    duration: Math.max(0, Math.round(Number(file.duration) || 0)),
    waveform: Array.isArray(file.waveform) ? file.waveform.slice(0, 48) : [],
  };

  let started = await authed('message/startAttachment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(startBody),
  });

  if (
    asImage &&
    (!started?.status || !started.data?.uploadId) &&
    sizeRejectMessage(started?.message)
  ) {
    const smaller = await compressImage(readableUri || file.uri, 700 * 1024);
    if (smaller?.bytes) {
      bytes = smaller.bytes;
      mime = 'image/jpeg';
      started = await authed('message/startAttachment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...startBody,
          fileName: (file.name || 'photo.jpg').replace(/\.\w+$/, '.jpg'),
          mime,
          size: bytes.byteLength,
        }),
      });
    }
  }

  if (!started?.status || !started.data?.uploadId) {
    if (sizeRejectMessage(started?.message)) {
      throw new Error(started?.message || 'Keep photos under 800 KB.');
    }
    throw new Error(started?.message || "Couldn't start the upload. Try again.");
  }

  const uploadId = started.data.uploadId;
  const chunkSize = Number(started.data.chunkSize) || 48 * 1024;
  await pushChunks(uploadId, bytes, chunkSize, onProgress);

  const finished = await authed('message/finishAttachment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({uploadId}),
  });
  if (!finished?.status) {
    if (sizeRejectMessage(finished?.message)) {
      throw new Error(finished?.message || 'Keep photos under 800 KB.');
    }
    throw new Error(finished?.message || "Couldn't finish sending the file.");
  }
  return finished.data?.message;
}

export function uploadChatPhoto(chatId, file, onProgress) {
  return uploadChatFile(chatId, file, onProgress);
}

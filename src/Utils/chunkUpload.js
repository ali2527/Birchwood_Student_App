import ImageResizer from '@bam.tech/react-native-image-resizer';
import {BASE_URL} from '../Service/axios';
import {store} from '../Stores';

const DOCUMENT_MAX = 2 * 1024 * 1024;
const AUDIO_MAX = 2 * 1024 * 1024;

function isImage(mime, name) {
  const label = `${mime || ''} ${name || ''}`.toLowerCase();
  return label.includes('image/') || /\.(jpe?g|png|webp|gif|heic|heif)\b/.test(label);
}

/** Make camera / picker / document paths readable by fetch & XHR. */
export function normalizeFileUri(uri) {
  if (!uri || typeof uri !== 'string') return '';
  let trimmed = uri.trim();
  if (!trimmed) return '';
  // Some native modules return file:/path instead of file:///path
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
  // Absolute device paths from document picker / native camera
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
  return list;
}

function xhrBlob(uri) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status !== 0 && (request.status < 200 || request.status >= 300)) {
        reject(new Error('Could not read the file'));
        return;
      }
      resolve(request.response);
    };
    request.onerror = () => reject(new Error('Could not read the file'));
    request.ontimeout = () => reject(new Error('Could not read the file'));
    request.responseType = 'blob';
    request.open('GET', uri, true);
    request.send();
  });
}

async function blobFromUri(uri) {
  try {
    const response = await fetch(uri);
    if (!response.ok && response.status !== 0) {
      throw new Error('fetch failed');
    }
    return await response.blob();
  } catch {
    return xhrBlob(uri);
  }
}

async function materializeImage(uri) {
  const out = await ImageResizer.createResizedImage(
    uri,
    4096,
    4096,
    'JPEG',
    95,
    0,
    undefined,
    true,
    {mode: 'contain', onlyScaleDown: true},
  );
  return normalizeFileUri(out?.uri || out?.path);
}

async function finalizeBlob(blob) {
  if (!blob) return null;
  // Some Android content:// reads return a Blob with size 0 until arrayBuffer is touched.
  if (!blob.size && typeof blob.arrayBuffer === 'function') {
    try {
      const buffer = await blob.arrayBuffer();
      if (buffer?.byteLength) {
        return new Blob([buffer], {type: blob.type || 'application/octet-stream'});
      }
    } catch {
      // keep original blob
    }
  }
  return blob.size ? blob : null;
}

async function readBlob(uri, {asImage} = {}) {
  const candidates = readCandidates(uri);
  if (!candidates.length) {
    throw new Error('Could not read the file');
  }

  for (const source of candidates) {
    try {
      const blob = await finalizeBlob(await blobFromUri(source));
      if (blob) return blob;
    } catch {
      // try next candidate / fallback
    }
  }

  if (asImage) {
    try {
      const local = await materializeImage(candidates[0]);
      if (local) {
        const blob = await finalizeBlob(await blobFromUri(local));
        if (blob) return blob;
      }
    } catch {
      // fall through
    }
  }

  throw new Error('Could not read the file');
}

async function authed(path, init) {
  const token = store.getState().user?.token;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token || ''}`,
      ...(init.headers || {}),
    },
  });
  return response.json();
}

/** Sends a photo or document in pieces. Images have no size cap — they stream in chunks. */
export async function uploadChatFile(chatId, file, onProgress) {
  const asImage = isImage(file.type, file.name);
  const blob = await readBlob(file.uri, {asImage});
  const mime = file.type || blob.type || (asImage ? 'image/jpeg' : 'application/octet-stream');
  if (!isImage(mime, file.name)) {
    if (String(mime).startsWith('audio/') && blob.size > AUDIO_MAX) {
      throw new Error('Keep the voice message under 2 MB');
    }
    if (!String(mime).startsWith('audio/') && blob.size > DOCUMENT_MAX) {
      throw new Error('Keep the document under 2 MB');
    }
  }
  const started = await authed('message/startAttachment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      chatId,
      fileName: file.name || 'file',
      mime,
      size: blob.size,
      duration: Math.max(0, Math.round(Number(file.duration) || 0)),
      waveform: Array.isArray(file.waveform) ? file.waveform.slice(0, 48) : [],
    }),
  });
  if (!started?.status || !started.data?.uploadId) {
    throw new Error(started?.message || 'Could not start the file');
  }
  const uploadId = started.data.uploadId;
  const chunkSize = Number(started.data.chunkSize) || 48 * 1024;
  let offset = 0;
  let index = 0;
  while (offset < blob.size) {
    const slice = blob.slice(offset, Math.min(offset + chunkSize, blob.size));
    const saved = await authed('message/attachmentChunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-upload-id': uploadId,
        'x-chunk-index': String(index),
      },
      body: slice,
    });
    if (!saved?.status) {
      throw new Error(saved?.message || 'A piece of the file failed');
    }
    offset += chunkSize;
    index += 1;
    if (onProgress) onProgress(Math.min(offset, blob.size) / blob.size);
  }
  const finished = await authed('message/finishAttachment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({uploadId}),
  });
  if (!finished?.status) {
    throw new Error(finished?.message || 'Could not send the file');
  }
  return finished.data?.message;
}

export function uploadChatPhoto(chatId, file, onProgress) {
  return uploadChatFile(chatId, file, onProgress);
}
